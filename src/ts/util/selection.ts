import {Constants} from "../constants";
import {isChrome} from "./compatibility";
import {hasClosestBlock, hasClosestByClassName} from "./hasClosest";

// 取得当前编辑器的选区
export const getEditorRange = (editorEl: HTMLElement) => {
    let range: Range;
    if (getSelection().rangeCount > 0) {
        range = getSelection().getRangeAt(0);
        // 选择区域的开始节点在元素内，则返回该选择区
        if (editorEl.isEqualNode(range.startContainer) || editorEl.contains(range.startContainer)) {
            return range;
        }
    }
    // 如果editor中不包含当前range，或不存在range，则将焦点移到editor并且设置rang到editor的起始位置（没有设置插入符）
    editorEl.focus();
    range = editorEl.ownerDocument.createRange();
    range.setStart(editorEl, 0);
    range.collapse(true); // 选区折叠到开始节点
    return range;
};

export const getCursorPosition = (editor: HTMLElement) => {
    const range = window.getSelection().getRangeAt(0);
    if (!editor.contains(range.startContainer) && !hasClosestByClassName(range.startContainer, "vditor-panel--none")) {
        return {
            left: 0,
            top: 0,
        };
    }
    const parentRect = editor.parentElement.getBoundingClientRect();
    let cursorRect;
    if (range.getClientRects().length === 0) {
        if (range.startContainer.nodeType === 3) {
            return {
                left: 0,
                top: 0,
            };
        }
        const children = (range.startContainer as Element).children;
        if (children[range.startOffset] &&
            children[range.startOffset].getClientRects().length > 0) {
            // markdown 模式回车
            cursorRect = children[range.startOffset].getClientRects()[0];
        } else if (range.startContainer.childNodes.length > 0) {
            // in table or code block
            range.selectNode(range.startContainer.childNodes[Math.max(0, range.startOffset - 1)]);
            cursorRect = range.getClientRects()[0];
            range.collapse(false);
        } else {
            cursorRect = (range.startContainer as HTMLElement).getClientRects()[0];
        }
        if (!cursorRect) {
            let parentElement = range.startContainer.childNodes[range.startOffset] as HTMLElement;
            while (!parentElement.getClientRects ||
            (parentElement.getClientRects && parentElement.getClientRects().length === 0)) {
                parentElement = parentElement.parentElement;
            }
            cursorRect = parentElement.getClientRects()[0];
        }
    } else {
        cursorRect = range.getClientRects()[0];
    }

    return {
        left: cursorRect.left - parentRect.left,
        top: cursorRect.top - parentRect.top,
    };
};
// selection是否在editor内
export const isRangInElement = (el: HTMLElement, range?: Range) => {
    if (!range) {
        if (getSelection().rangeCount === 0) {
            return false;
        } else {
            range = getSelection().getRangeAt(0);
        }
    }
    const container = range.commonAncestorContainer;

    return el.isEqualNode(container) || el.contains(container);
};

export const setSelectionFocus = (range: Range) => {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
};

// 取得指定元素上存在于range中的位置范围
export const getElSelectedPosition = (el: HTMLElement, range?: Range) => {
    const position = {
        end: 0,
        start: 0,
    };

    if (!range) {
        if (getSelection().rangeCount === 0) {
            return position;
        }
        range = window.getSelection().getRangeAt(0);
    }
    // 如果range在editor内
    if (isRangInElement(el, range)) {
        const rangeForCalc = range.cloneRange();
        if (el.childNodes[0] && el.childNodes[0].childNodes[0]) {
            rangeForCalc.setStart(el.childNodes[0].childNodes[0], 0);
        } else {
            rangeForCalc.selectNodeContents(el);
        }
        rangeForCalc.setEnd(range.startContainer, range.startOffset);
        position.start = rangeForCalc.toString().length;
        position.end = position.start + range.toString().length;
    }
    return position;
};

export const setSelectionByPosition = (start: number, end: number, editor: HTMLElement) => {
    let charIndex = 0;
    let line = 0;
    let pNode = editor.childNodes[line];
    let foundStart = false;
    let stop = false;
    start = Math.max(0, start);
    end = Math.max(0, end);

    const range = editor.ownerDocument.createRange();
    range.setStart(pNode || editor, 0);
    range.collapse(true);

    while (!stop && pNode) {
        const nextCharIndex = charIndex + pNode.textContent.length;
        if (!foundStart && start >= charIndex && start <= nextCharIndex) {
            if (start === 0) {
                range.setStart(pNode, 0);
            } else {
                if (pNode.childNodes[0].nodeType === 3) {
                    range.setStart(pNode.childNodes[0], start - charIndex);
                } else if (pNode.nextSibling) {
                    range.setStartBefore(pNode.nextSibling);
                } else {
                    range.setStartAfter(pNode);
                }
            }
            foundStart = true;
            if (start === end) {
                stop = true;
                break;
            }
        }
        if (foundStart && end >= charIndex && end <= nextCharIndex) {
            if (end === 0) {
                range.setEnd(pNode, 0);
            } else {
                if (pNode.childNodes[0].nodeType === 3) {
                  console.log(pNode.childNodes[0].textContent.length)
                  console.log(end - charIndex)
                    range.setEnd(pNode.childNodes[0], end - charIndex);
                } else if (pNode.nextSibling) {
                    range.setEndBefore(pNode.nextSibling);
                } else {
                    range.setEndAfter(pNode);
                }
            }
            stop = true;
        }
        charIndex = nextCharIndex;
        pNode = editor.childNodes[++line];
    }

    if (!stop && editor.childNodes[line - 1]) {
        range.setStartBefore(editor.childNodes[line - 1]);
    }

    setSelectionFocus(range);
    return range;
};
// 根据<wbr>标签位置，定位并设置光标位置后移除<wbr>标签
export const setRangeByWbr = (element: HTMLElement, range: Range) => {
    const wbrElement = element.querySelector("wbr");
    if (!wbrElement) {
        return;
    }
    if (!wbrElement.previousElementSibling) {
        if (wbrElement.previousSibling) {
            // text<wbr>
            range.setStart(wbrElement.previousSibling, wbrElement.previousSibling.textContent.length);
        } else if (wbrElement.nextSibling) {
            if (wbrElement.nextSibling.nodeType === 3) {
                // <wbr>text
                range.setStart(wbrElement.nextSibling, 0);
            } else {
                // <wbr><br> https://github.com/Vanessa219/vditor/issues/400
                range.setStartBefore(wbrElement.nextSibling);
            }
        } else {
            // 内容为空
            range.setStart(wbrElement.parentElement, 0);
        }
    } else {
        if (wbrElement.previousElementSibling.isSameNode(wbrElement.previousSibling)) {
            if (wbrElement.previousElementSibling.lastChild) {
                // <em>text</em><wbr>
                range.setStartBefore(wbrElement);
                range.collapse(true);
                setSelectionFocus(range);
                // fix Chrome set range bug: **c**
                if (isChrome() && (wbrElement.previousElementSibling.tagName === "EM" ||
                    wbrElement.previousElementSibling.tagName === "STRONG" ||
                    wbrElement.previousElementSibling.tagName === "S")) {
                    range.insertNode(document.createTextNode(Constants.ZWSP));
                    range.collapse(false);
                }
                wbrElement.remove();
                return;
            } else {
                // <br><wbr>
                range.setStartAfter(wbrElement.previousElementSibling);
            }
        } else {
            // <em>text</em>text<wbr>
            range.setStart(wbrElement.previousSibling, wbrElement.previousSibling.textContent.length);
        }
    }
    range.collapse(true);
    wbrElement.remove();
    setSelectionFocus(range);
};

export const insertHTML = (html: string, vditor: IVditor) => {
    // 使用 lute 方法会添加 p 元素，只有一个 p 元素的时候进行删除
    const tempElement = document.createElement("div");
    tempElement.innerHTML = html;
    const pElements = tempElement.querySelectorAll("p");
    if (pElements.length === 1 && !pElements[0].previousSibling && !pElements[0].nextSibling) {
        if ((vditor.currentMode === "wysiwyg" && vditor.wysiwyg.element.children.length > 0) ||
            (vditor.currentMode === "ir" && vditor.ir.element.children.length > 0)) {
            // empty and past
            html = pElements[0].innerHTML.trim();
        }
    }

    const pasteElement = document.createElement("template");
    pasteElement.innerHTML = html;

    const range = getEditorRange(vditor[vditor.currentMode].element);
    if (range.toString() !== "" && vditor.currentMode !== "sv") {
        vditor[vditor.currentMode].preventInput = true;
        document.execCommand("delete", false, "");
    }

    const blockElement = hasClosestBlock(range.startContainer);
    if (pasteElement.content.firstElementChild &&
        pasteElement.content.firstElementChild.getAttribute("data-block") === "0" && blockElement) {
        // 粘贴内容为块元素时，应在下一段落中插入
        blockElement.insertAdjacentHTML("afterend", html);
    } else {
        range.insertNode(pasteElement.content.cloneNode(true));
        range.collapse(false);
    }
};
