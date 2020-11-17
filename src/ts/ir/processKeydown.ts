import {Constants} from "../constants";
import {hidePanel} from "../toolbar/setToolbar";
import {isCtrl} from "../util/compatibility";
import {
    fixBlockquote, fixCJKPosition,
    fixCodeBlock, fixCursorDownInlineMath,
    fixDelete, fixFirefoxArrowUpTable, fixHR,
    fixList,
    fixMarkdown,
    fixTab,
    fixTable,
    fixTask,
    insertAfterBlock, insertBeforeBlock, isFirstCell, isLastCell,
} from "../util/fixBrowserBehavior";
import {
    hasClosestBlock,
    hasClosestByAttribute,
    hasClosestByClassName,
    hasClosestByMatchTag,
} from "../util/hasClosest";
import {hasClosestByHeadings, hasClosestByTag} from "../util/hasClosestByHeadings";
import {getEditorRange, getElSelectedPosition} from "../util/selection";

/**
 * 处理keydown事件
 * return true: 结束keydown事件，false：继续剩余的keydown事件
 * @param vditor 
 * @param event 
 */
export const processKeydown = (vditor: IVditor, event: KeyboardEvent) => {
    vditor.ir.composingLock = event.isComposing;
    if (event.isComposing) {
        return false; // 如果是进入输入法语言输入模式，则不处理
    }

    // 除方向键外，记录当前光标位置及DOM到回退栈中
    if (event.key.indexOf("Arrow") === -1) {
        vditor.irUndo.recordFirstWbr(vditor, event);
    }

    const range = getEditorRange(vditor.ir.element);  // 取得editor内的range
    const startContainer = range.startContainer;

    fixCJKPosition(range, event); // p tag输入时如果是开始位置输入，则先插入占位符

    fixHR(range); // firefox时，输入位置的容器是hr时，将输入点移到hr前的位置

    // 仅处理包含有（Enter、Tab、Backspace、ArrowXxx、Ctrl、Esc）的按键处理
    if (event.key !== "Enter" && 
      event.key !== "Tab" && 
      event.key !== "Backspace" && 
      event.key.indexOf("Arrow") === -1 && 
      !isCtrl(event) && 
      event.key !== "Escape") {
        return false;
    }

    // [bug fixed]Enter键处理。H标签光标放在最前回车后，新建行前面仍有H的标记（应该是生成普通段落） jay
    const headEl = hasClosestByHeadings(startContainer);
    if (event.key === "Enter" && headEl && range.startOffset === 0 &&
          !isCtrl(event) && !event.altKey && !event.shiftKey) {
        headEl.insertAdjacentHTML("beforebegin", `<p data-block="0">${Constants.ZWSP}</p>`);
        event.preventDefault();
        return true;
    }

    // [bug fixed]Enter键处理。vditor空行enter键无法添加多个空行，滚动条会上下移动一下。
    const pBlockEl = hasClosestBlock(startContainer)
    console.log(pBlockEl)
    console.log(pBlockEl ? pBlockEl.tagName : 'none')
    console.log(range.startOffset)
    if (event.key === "Enter" && pBlockEl && range.startOffset === 0 && pBlockEl.tagName === 'P'
          && !isCtrl(event) && !event.altKey && !event.shiftKey) {
        console.log(2)
        pBlockEl.insertAdjacentHTML("beforebegin", `<p data-block="0">${Constants.ZWSP}</p>`);
        event.preventDefault();
        return true;
    }

    // Enter键处理。斜体、粗体、删除线、内联代码块（用`包裹）中输入时，
    const newlineElement = hasClosestByAttribute(startContainer, "data-newline", "1");
    if (!isCtrl(event) && !event.altKey && !event.shiftKey && event.key === "Enter" && newlineElement
        && range.startOffset < newlineElement.textContent.length) {
        const beforeMarkerElement = newlineElement.previousElementSibling;
        // 插入该输入项的前后marker标识符到输入点（将输入项以输入点为界，分隔为两个相同的类型的输入项）
        if (beforeMarkerElement) {
            range.insertNode(document.createTextNode(beforeMarkerElement.textContent));
            range.collapse(false); //收缩到end
        }
        const afterMarkerElement = newlineElement.nextSibling;
        if (afterMarkerElement) {
            range.insertNode(document.createTextNode(afterMarkerElement.textContent));
            range.collapse(true); //收缩到start
        }
    }

    const pElement = hasClosestByMatchTag(startContainer, "P"); // 取得
    // Enter、Space键在P标签内的处理。md格式的修复
    if (fixMarkdown(event, vditor, pElement, range)) {
        return true;
    }
    // Enter、Space、Tab键在li标签内的处理。li格式的修复
    if (fixList(range, vditor, pElement, event)) {
        return true;
    }
    // Enter、Space键及wysiwyg模式下blockquote快捷键的处理。blockquote格式的修复。
    if (fixBlockquote(vditor, range, event, pElement)) {
        return true;
    }
    // toc 前无元素，插入空块
    if (pElement && pElement.previousElementSibling &&
        pElement.previousElementSibling.classList.contains("vditor-toc")) {
        if (insertBeforeBlock(vditor, event, range, pElement, pElement.previousElementSibling as HTMLElement)) {
            return true;
        }
    }

    // 代码块
    const preRenderElement = hasClosestByClassName(startContainer, "vditor-ir__marker--pre");
    if (preRenderElement && preRenderElement.tagName === "PRE") {
        const codeRenderElement = preRenderElement.firstChild as HTMLElement;
        if (fixCodeBlock(vditor, event, preRenderElement, range)) {
            return true;
        }
        // 数学公式上无元素，按上或左将添加新块
        if ((codeRenderElement.getAttribute("data-type") === "math-block"
            || codeRenderElement.getAttribute("data-type") === "html-block") &&
            insertBeforeBlock(vditor, event, range, codeRenderElement, preRenderElement.parentElement)) {
            return true;
        }

        // 代码块下无元素或者为代码块/table 元素，添加空块
        if (insertAfterBlock(vditor, event, range, codeRenderElement, preRenderElement.parentElement)) {
            return true;
        }
    }
    // 代码块语言
    const preBeforeElement = hasClosestByAttribute(startContainer, "data-type", "code-block-info");
    if (preBeforeElement) {
        if (event.key === "Enter" || event.key === "Tab") {
            range.selectNodeContents(preBeforeElement.nextElementSibling.firstChild);
            range.collapse(true);
            event.preventDefault();
            return true;
        }

        if (event.key === "Backspace") {
            const start = getElSelectedPosition(preBeforeElement).start;
            if (start === 1) { // 删除零宽空格
                range.setStart(startContainer, 0);
            }
            if (start === 2) { // 删除时清空自动补全语言
                vditor.hint.recentLanguage = "";
            }
        }
        if (insertBeforeBlock(vditor, event, range, preBeforeElement, preBeforeElement.parentElement)) {
            // 上无元素，按上或左将添加新块
            hidePanel(vditor, ["hint"]);
            return true;
        }
    }

    // table
    const cellElement = hasClosestByMatchTag(startContainer, "TD") ||
        hasClosestByMatchTag(startContainer, "TH");
    if (event.key.indexOf("Arrow") > -1 && cellElement) {
        const tableElement = isFirstCell(cellElement);
        if (tableElement && insertBeforeBlock(vditor, event, range, cellElement, tableElement)) {
            return true;
        }

        const table2Element = isLastCell(cellElement);
        if (table2Element && insertAfterBlock(vditor, event, range, cellElement, table2Element)) {
            return true;
        }
    }
    
    if (fixTable(vditor, event, range)) {
        return true;
    }

    // task list
    if (fixTask(vditor, range, event)) {
        return true;
    }

    // tab(not in code block)
    if (fixTab(vditor, range, event)) {
        return true;
    }

    // backspace(not in code block)
    if (event.key === "Backspace" && !isCtrl(event) && !event.shiftKey && !event.altKey && range.toString() === "") {
        if (fixDelete(vditor, range, event, pElement)) {
            return true;
        }
        // 光标位于标题前，marker 后
        const headingElement = hasClosestByHeadings(startContainer);
        if (headingElement) {
            const headingLength = headingElement.firstElementChild.textContent.length;
            if (getElSelectedPosition(headingElement).start === headingLength) {
                range.setStart(headingElement.firstElementChild.firstChild, headingLength - 1);
                range.collapse(true);
            }
        }
    }

    const blockElement = hasClosestBlock(startContainer);
    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && blockElement) {
        // https://github.com/Vanessa219/vditor/issues/358
        blockElement.querySelectorAll(".vditor-ir__node").forEach((item: HTMLElement) => {
            if (!item.contains(startContainer)) {
                item.classList.add("vditor-ir__node--hidden");
            }
        });

        if (fixFirefoxArrowUpTable(event, blockElement, range)) {
            return true;
        }
    }
    // 修复：光标在内联数学公式中无法向下移动。
    fixCursorDownInlineMath(range, event.key);

    return false;
};
