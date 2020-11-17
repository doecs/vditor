import {Constants} from "../constants";
import {uploadFiles} from "../upload";
import {isCtrl, isFirefox} from "../util/compatibility";
import {blurEvent, focusEvent, hotkeyEvent, scrollCenter, selectEvent} from "../util/editorCommonEvent";
import {paste} from "../util/fixBrowserBehavior";
import {hasClosestByClassName} from "../util/hasClosest";
import {
    getEditorRange, setRangeByWbr,
    setSelectionFocus,
} from "../util/selection";
import {expandMarker} from "./expandMarker";
import {highlightToolbar} from "./highlightToolbar";
import {input} from "./input";
import {processAfterRender, processHint} from "./process";

/**
 * template look like:
 * `
 * <div class="vditor-ir">
 *   <pre class="vditor-reset" contenteditable="true">
 *   </pre>
 * </div>
 * `
 */
class IR {
    public element: HTMLPreElement;
    public processTimeoutId: number;
    public hlToolbarTimeoutId: number;
    public composingLock: boolean = false;
    public preventInput: boolean;

    constructor(vditor: IVditor) {
        const divElement = document.createElement("div");
        divElement.className = "vditor-ir";

        divElement.innerHTML = `<pre class="vditor-reset" placeholder="${vditor.options.placeholder}"
 contenteditable="true" spellcheck="false"></pre>`;

        this.element = divElement.firstElementChild as HTMLPreElement;

        // this.bindEvent(vditor); // 绑定事件：copy、paste、drop、compositionend、compositionstart、input、click、keyup事件

        document.execCommand("DefaultParagraphSeparator", false, "p");  // 将回车后的段落分隔符改为p标签（默认：div）

        // focusEvent(vditor, this.element); // 焦点事件
        // blurEvent(vditor, this.element); // 失焦事件
        // hotkeyEvent(vditor, this.element);  // keydown事件（包括快捷键）
        // selectEvent(vditor, this.element);  // 选择事件
    }

    private bindEvent(vditor: IVditor) {
        this.element.addEventListener("copy", (event: ClipboardEvent & { target: HTMLElement }) => {
            const range = getSelection().getRangeAt(0);
            if (range.toString() === "") {
                return;
            }
            event.stopPropagation();
            event.preventDefault();

            const tempElement = document.createElement("div");
            tempElement.appendChild(range.cloneContents());

            event.clipboardData.setData("text/plain", vditor.lute.VditorIRDOM2Md(tempElement.innerHTML).trim());
            event.clipboardData.setData("text/html", "");
        });

        this.element.addEventListener("paste", (event: ClipboardEvent & { target: HTMLElement }) => {
            paste(vditor, event, {
                pasteCode: (code: string) => {
                    document.execCommand("insertHTML", false, code);
                },
            });
        });

        if (vditor.options.upload.url || vditor.options.upload.handler) {
            this.element.addEventListener("drop",
                (event: CustomEvent & { dataTransfer?: DataTransfer, target: HTMLElement }) => {
                    if (event.dataTransfer.types[0] !== "Files") {
                        return;
                    }
                    const files = event.dataTransfer.items;
                    if (files.length > 0) {
                        uploadFiles(vditor, files);
                    }
                    event.preventDefault();
                });
        }

        // 非英文输入法打开时，按键选择文字后触发
        this.element.addEventListener("compositionend", (event: InputEvent) => {
            input(vditor, getSelection().getRangeAt(0).cloneRange());
        });
        // 非英文输入法打开时，按键时触发
        this.element.addEventListener("compositionstart", (event: InputEvent) => {
            this.composingLock = true;
        });

        this.element.addEventListener("input", (event: InputEvent) => {
          if (3<4) return // debug
          console.log('input')
            if (this.preventInput) {
                this.preventInput = false;
                return;
            }
            if (this.composingLock) {
                return;
            }
            input(vditor, getSelection().getRangeAt(0).cloneRange());
        });

        this.element.addEventListener("click", (event: MouseEvent & { target: HTMLInputElement }) => {
            // 处理input类型（checkbox）
            if (event.target.tagName === "INPUT") {
                if (event.target.checked) {
                    event.target.setAttribute("checked", "checked");
                } else {
                    event.target.removeAttribute("checked");
                }
                this.preventInput = true;
                processAfterRender(vditor);
                return;
            }
            
            // 
            const range = getEditorRange(this.element);
            // 当点击最后一行时自动添加一个空的p标签
            if (event.target.isEqualNode(this.element) && this.element.lastElementChild && range.collapsed) {
                const lastRect = this.element.lastElementChild.getBoundingClientRect();
                if (event.y > lastRect.top + lastRect.height) {
                    if (this.element.lastElementChild.tagName === "P") {
                        range.selectNodeContents(this.element.lastElementChild);
                        range.collapse(false);
                    } else {
                        this.element.insertAdjacentHTML("beforeend",
                            `<p data-block="0">${Constants.ZWSP}<wbr></p>`);
                        setRangeByWbr(this.element, range);
                    }
                    return;
                }
            }

            expandMarker(range, vditor);
            highlightToolbar(vditor);

            // 点击后光标落于预览区
            let previewElement = hasClosestByClassName(event.target, "vditor-ir__preview");
            if (!previewElement) {
                previewElement = hasClosestByClassName(
                    range.startContainer, "vditor-ir__preview");
            }
            if (previewElement) {
                if (previewElement.previousElementSibling.firstElementChild) {
                    range.selectNodeContents(previewElement.previousElementSibling.firstElementChild);
                } else {
                    // 行内数学公式
                    range.selectNodeContents(previewElement.previousElementSibling);
                }
                range.collapse(true);
                setSelectionFocus(range);
                scrollCenter(vditor);
            }
        });

        // keyup事件（该处理在hotkeyEvent处理（keydown处理）之后执行，即hotkeyEvent的中未处理或已处理未阻止事件继续传播后执行）
        this.element.addEventListener("keyup", (event) => {
            if (3<4) return // debug
            console.log('keyup Event handler')
            if (event.isComposing || isCtrl(event)) {
                return;
            }
            if (event.key === "Enter") {
                scrollCenter(vditor);
            }
            highlightToolbar(vditor); // 根据当前编辑器中的光标位置，设定toolbar中按钮的状态
            if ((event.key === "Backspace" || event.key === "Delete") &&
                vditor.ir.element.innerHTML !== "" && vditor.ir.element.childNodes.length === 1 &&
                vditor.ir.element.firstElementChild && vditor.ir.element.firstElementChild.tagName === "P"
                && vditor.ir.element.firstElementChild.childElementCount === 0
                && (vditor.ir.element.textContent === "" || vditor.ir.element.textContent === "\n")) {
                // 为空时显示 placeholder
                vditor.ir.element.innerHTML = "";
                return;
            }
            const range = getEditorRange(this.element);
            if (event.key === "Backspace") {
                // firefox headings https://github.com/Vanessa219/vditor/issues/211
                if (isFirefox() && range.startContainer.textContent === "\n" && range.startOffset === 1) {
                    range.startContainer.textContent = "";
                    expandMarker(range, vditor);
                }
                // 数学公式前是空块，空块前是 table，在空块前删除，数学公式会多一个 br
                this.element.querySelectorAll(".language-math").forEach((item) => {
                    const brElement = item.querySelector("br");
                    if (brElement) {
                        brElement.remove();
                    }
                });
            } else if (event.key.indexOf("Arrow") > -1) {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    processHint(vditor);  // 代码块语言提示
                }
                expandMarker(range, vditor);
            }

            const previewRenderElement = hasClosestByClassName(range.startContainer, "vditor-ir__preview");

            if (previewRenderElement) {
                console.log('previewRenderElement: ', previewRenderElement)
                if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                    if (previewRenderElement.previousElementSibling.firstElementChild) {
                        range.selectNodeContents(previewRenderElement.previousElementSibling.firstElementChild);
                    } else {
                        // 行内数学公式
                        range.selectNodeContents(previewRenderElement.previousElementSibling);
                    }
                    range.collapse(false);
                    event.preventDefault();
                    return true;
                }
                // 行内数学公式
                if (previewRenderElement.tagName === "SPAN" &&
                    (event.key === "ArrowDown" || event.key === "ArrowRight")) {
                    range.selectNodeContents(previewRenderElement.parentElement.lastElementChild);
                    range.collapse(false);
                    event.preventDefault();
                    return true;
                }
            }
            console.log('keyup is not handle')
        });
    }
}

export {IR};
