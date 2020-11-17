import {isSetextHeadingMD, isHrMD, renderToc} from "../util/fixBrowserBehavior";
import {
    getTopList,
    hasClosestBlock, hasClosestByAttribute,
    hasClosestByClassName,
} from "../util/hasClosest";
import {hasClosestByTag} from "../util/hasClosestByHeadings";
import {log} from "../util/log";
import {processCodeRender} from "../util/processCode";
import {getElSelectedPosition, setRangeByWbr} from "../util/selection";
import {processAfterRender} from "./process";

export const input = (vditor: IVditor, range: Range, ignoreSpace = false) => {
    let blockElement = hasClosestBlock(range.startContainer);
    
    // 聚焦在block元素 && 不忽略空格
    if (blockElement && !ignoreSpace) {
        // 分隔符 || Setext Heading 不处理
        if (isHrMD(vditor, blockElement.innerHTML) || isSetextHeadingMD(vditor, blockElement.innerHTML)) {
            return; 
        }
  
        // 选区的开始位置距离元素起点的offset
        const startOffset = getElSelectedPosition(blockElement, range).start;

        // 检查插入点前面到距离最近的\n符之间的字符是否存在\t或空格
        let startSpace = true;
        for (let i = startOffset - 1;
             i > blockElement.textContent.substr(0, startOffset).lastIndexOf("\n");
             i--) {
            if (blockElement.textContent.charAt(i) !== " " &&
                // 多个 tab 前删除不形成代码块 https://github.com/Vanessa219/vditor/issues/1621
                blockElement.textContent.charAt(i) !== "\t") {
                startSpace = false;
                break;
            }
        }
        if (startOffset === 0) {
            startSpace = false;
        }
        // 检查插入点后到block最后位置之间的字符是否存在\t或空格
        let endSpace = true;
        for (let i = startOffset - 1; i < blockElement.textContent.length; i++) {
            if (blockElement.textContent.charAt(i) !== " " && blockElement.textContent.charAt(i) !== "\n") {
                endSpace = false;
                break;
            }
        }
        // 如果前面有tab|space（非脑图类型）或 后面有tab|space
        if ((startSpace && !blockElement.querySelector(".language-mindmap")) || endSpace) {
            // 后面有tab|space
            if (endSpace) {
                const markerElement = hasClosestByClassName(range.startContainer, "vditor-ir__marker");
                if (markerElement) {
                    // 插入点元素属于marker元素子元素（修改marker）
                    // inline marker space https://github.com/Vanessa219/vditor/issues/239
                } else {
                    // 非修改marker
                    const previousNode = range.startContainer.previousSibling as HTMLElement;
                    // 且插入点前面的兄弟node不是Text Node，并且前面的兄弟node属于expand状态，则去掉expand状态
                    if (previousNode && previousNode.nodeType !== 3 && previousNode.classList.contains("vditor-ir__node--expand")) {
                        // FireFox https://github.com/Vanessa219/vditor/issues/239
                        previousNode.classList.remove("vditor-ir__node--expand");
                    }
                }
            } else {
                // 前面有tab|space（非脑图类型）后面没有tab | space
                const preRenderElement = hasClosestByClassName(range.startContainer, "vditor-ir__marker--pre");
                if (preRenderElement && preRenderElement.tagName === "PRE") {
                  // 且在代码块的pre区
                  // bug fixed 如果是在代码块，则需要继续执行到lute渲染代码块，否则代码没法同步反映到pre区中. jay
                } else {
                  return;
                }                
            }
        }
    }
    // 去除文中所有expand的状态（重设）
    vditor.ir.element.querySelectorAll(".vditor-ir__node--expand").forEach((item) => {
        item.classList.remove("vditor-ir__node--expand");
    });
    if (!blockElement) {
        // 使用顶级块元素，应使用 innerHTML
        blockElement = vditor.ir.element;
    }
    // 用<wbr>来代表光标的位置，使得通过lute重新渲染后的结果也能重现光标位置。jay
    // 如果当前block块没有光标位置标识<wbr>
    if (!blockElement.querySelector("wbr")) {
        const previewRenderElement = hasClosestByClassName(range.startContainer, "vditor-ir__preview");
        // 且在代码的pre块
        if (previewRenderElement) {
            // 插入点在pre块中，则自动设置到代码的编辑块的最后位置
            if (previewRenderElement.previousElementSibling.firstElementChild) {
                range.selectNodeContents(previewRenderElement.previousElementSibling.firstElementChild);
            } else {
                range.selectNodeContents(previewRenderElement.previousElementSibling);
            }
            range.collapse(false);
        }
        // document.exeComment insertHTML 会插入 wbr
        range.insertNode(document.createElement("wbr"));
    }
    
    // 清除浏览器自带的样式
    blockElement.querySelectorAll("[style]").forEach((item) => {
        item.removeAttribute("style");
    });

    if (blockElement.getAttribute("data-type") === "link-ref-defs-block") {
        // 修改链接引用
        blockElement = vditor.ir.element;
    }

    const isIRElement = blockElement.isEqualNode(vditor.ir.element);
    let html = "";
    if (!isIRElement) {
        // 列表需要到最顶层
        const topListElement = getTopList(range.startContainer);
        if (topListElement) {
            const blockquoteElement = hasClosestByTag(range.startContainer, "BLOCKQUOTE");
            if (blockquoteElement) {
                // li 中有 blockquote 就只渲染 blockquote
                blockElement = hasClosestBlock(range.startContainer) || blockElement;
            } else {
                blockElement = topListElement;
            }
        }

        // 修改脚注
        const footnoteElement = hasClosestByAttribute(blockElement, "data-type", "footnotes-block");
        if (footnoteElement) {
            blockElement = footnoteElement;
        }

        html = blockElement.outerHTML;

        if (blockElement.tagName === "UL" || blockElement.tagName === "OL") {
            // 如果为列表的话，需要把上下的列表都重绘
            const listPrevElement = blockElement.previousElementSibling;
            const listNextElement = blockElement.nextElementSibling;
            if (listPrevElement && (listPrevElement.tagName === "UL" || listPrevElement.tagName === "OL")) {
                html = listPrevElement.outerHTML + html;
                listPrevElement.remove();
            }
            if (listNextElement && (listNextElement.tagName === "UL" || listNextElement.tagName === "OL")) {
                html = html + listNextElement.outerHTML;
                listNextElement.remove();
            }
            // firefox 列表回车不会产生新的 list item https://github.com/Vanessa219/vditor/issues/194
            html = html.replace("<div><wbr><br></div>", "<li><p><wbr><br></p></li>");
        } else if (blockElement.previousElementSibling && blockElement.previousElementSibling.textContent !== "") {
            // 换行时需要处理上一段落
            html = blockElement.previousElementSibling.outerHTML + html;
            blockElement.previousElementSibling.remove();
        }

        // 添加链接引用
        const allLinkRefDefsElement = vditor.ir.element.querySelector("[data-type='link-ref-defs-block']");
        if (allLinkRefDefsElement && !blockElement.isEqualNode(allLinkRefDefsElement)) {
            html += allLinkRefDefsElement.outerHTML;
            allLinkRefDefsElement.remove();
        }
        // 添加脚注
        const allFootnoteElement = vditor.ir.element.querySelector("[data-type='footnotes-block']");
        if (allFootnoteElement && !blockElement.isEqualNode(allFootnoteElement)) {
            html += allFootnoteElement.outerHTML;
            allFootnoteElement.remove();
        }
    } else {
        html = blockElement.innerHTML;
    }

    log("SpinVditorIRDOM", html, "argument", vditor.options.debugger);
    html = vditor.lute.SpinVditorIRDOM(html);
    log("SpinVditorIRDOM", html, "result", vditor.options.debugger);
    if (isIRElement) {
        blockElement.innerHTML = html;
    } else {
        blockElement.outerHTML = html;

        const allLinkRefDefsElement = vditor.ir.element.querySelector("[data-type='link-ref-defs-block']");
        if (allLinkRefDefsElement) {
            vditor.ir.element.insertAdjacentElement("beforeend", allLinkRefDefsElement);
        }

        const allFootnoteElement = vditor.ir.element.querySelector("[data-type='footnotes-block']");
        if (allFootnoteElement) {
            vditor.ir.element.insertAdjacentElement("beforeend", allFootnoteElement);
        }
    }

    setRangeByWbr(vditor.ir.element, range);

    vditor.ir.element.querySelectorAll(".vditor-ir__preview[data-render='2']").forEach((item: HTMLElement) => {
        processCodeRender(item, vditor);
    });

    renderToc(vditor);

    processAfterRender(vditor, {
        enableAddUndoStack: true,
        enableHint: true,
        enableInput: true,
    });
};
