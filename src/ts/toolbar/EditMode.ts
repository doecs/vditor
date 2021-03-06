import {Constants} from "../constants";
import {i18n} from "../i18n";
import {highlightToolbar as IRHighlightToolbar} from "../ir/highlightToolbar";
import {processAfterRender} from "../ir/process";
import {getMarkdown} from "../markdown/getMarkdown";
import {formatRender} from "../sv/formatRender";
import {setPadding, setTypewriterPosition} from "../ui/initUI";
import {getEventName, updateHotkeyTip} from "../util/compatibility";
import {processCodeRender} from "../util/processCode";
import {highlightToolbar} from "../wysiwyg/highlightToolbar";
import {renderDomByMd} from "../wysiwyg/renderDomByMd";
import {MenuItem} from "./MenuItem";
import {
    disableToolbar,
    enableToolbar,
    hidePanel,
    hideToolbar,
    removeCurrentToolbar,
    showToolbar, toggleSubMenu,
} from "./setToolbar";

export const setEditMode = (vditor: IVditor, type: string, event: Event | string) => {
    let markdownText;
    if (typeof event !== "string") {
        hidePanel(vditor, ["subToolbar", "hint"]);
        event.preventDefault();
        markdownText = getMarkdown(vditor);
    } else {
        markdownText = event;
    }
    if (vditor.currentMode === type && typeof event !== "string") {
        return;
    }
    if (vditor.devtools) {
        vditor.devtools.renderEchart(vditor);
    }
    if (vditor.options.preview.mode === "both" && type === "sv") {
        vditor.preview.element.style.display = "block";
    } else {
        vditor.preview.element.style.display = "none";
    }

    enableToolbar(vditor.toolbar.elements, Constants.EDIT_TOOLBARS);
    removeCurrentToolbar(vditor.toolbar.elements, Constants.EDIT_TOOLBARS);
    disableToolbar(vditor.toolbar.elements, ["outdent", "indent"]);

    if (type === "ir") {
        hideToolbar(vditor.toolbar.elements, ["format", "both"]);
        showToolbar(vditor.toolbar.elements, ["outdent", "indent", "outline", "insert-before", "insert-after"]);
        vditor.irUndo.resetIcon(vditor);
        vditor.sv.element.style.display = "none";
        vditor.wysiwyg.element.parentElement.style.display = "none";
        vditor.ir.element.parentElement.style.display = "block";

        vditor.currentMode = "ir";
        console.log(markdownText)
        let html = vditor.lute.Md2VditorIRDOM(markdownText);
        console.log(html)
        vditor.ir.element.innerHTML = html

        processAfterRender(vditor, {
            enableAddUndoStack: true,
            enableHint: false,
            enableInput: false,
        });

        setPadding(vditor);

        vditor.ir.element.querySelectorAll(".vditor-ir__preview[data-render='2']").forEach((item: HTMLElement) => {
            processCodeRender(item, vditor);
        });

        if (typeof event !== "string") {
            // 初始化不 focus
            vditor.ir.element.focus();
            IRHighlightToolbar(vditor);
        }
    } else if (type === "wysiwyg") {
        hideToolbar(vditor.toolbar.elements, ["format", "both"]);
        showToolbar(vditor.toolbar.elements, ["outdent", "indent", "outline", "insert-before", "insert-after"]);
        vditor.wysiwygUndo.resetIcon(vditor);
        vditor.sv.element.style.display = "none";
        vditor.wysiwyg.element.parentElement.style.display = "block";
        vditor.ir.element.parentElement.style.display = "none";

        vditor.currentMode = "wysiwyg";

        setPadding(vditor);
        renderDomByMd(vditor, markdownText, false);

        if (typeof event !== "string") {
            // 初始化不 focus
            vditor.wysiwyg.element.focus();
            highlightToolbar(vditor);
        }
        vditor.wysiwyg.popover.style.display = "none";
    } else if (type === "sv") {
        showToolbar(vditor.toolbar.elements, ["format", "both"]);
        hideToolbar(vditor.toolbar.elements, ["outdent", "indent", "outline", "insert-before", "insert-after"]);
        vditor.undo.resetIcon(vditor);
        vditor.wysiwyg.element.parentElement.style.display = "none";
        vditor.ir.element.parentElement.style.display = "none";
        if (vditor.options.preview.mode === "both") {
            vditor.sv.element.style.display = "block";
        } else if (vditor.options.preview.mode === "editor") {
            vditor.sv.element.style.display = "block";
        }
        vditor.currentMode = "sv";
        formatRender(vditor, markdownText, undefined, {
            enableAddUndoStack: true,
            enableHint: false,
            enableInput: false,
        });
        if (typeof event !== "string") {
            // 初始化不 focus
            vditor.sv.element.focus();
        }
        setPadding(vditor);
    }
    if (typeof event === "string") {
        vditor.outline.render(vditor);
    }
    setTypewriterPosition(vditor);

    if (vditor.toolbar.elements["edit-mode"]) {
        vditor.toolbar.elements["edit-mode"].querySelectorAll("button").forEach((item) => {
            item.classList.remove("vditor-menu--current");
        });
        vditor.toolbar.elements["edit-mode"].querySelector(`button[data-mode="${vditor.currentMode}"]`).classList.add("vditor-menu--current");
    }

    vditor.outline.toggle(vditor, vditor.currentMode !== "sv" && vditor.options.outline);
};

export class EditMode extends MenuItem {
    public element: HTMLElement;

    constructor(vditor: IVditor, menuItem: IMenuItem) {
        super(vditor, menuItem);

        const panelElement = document.createElement("div");
        panelElement.className = `vditor-hint${menuItem.level === 2 ? "" : " vditor-panel--arrow"}`;
        panelElement.innerHTML = `<button data-mode="wysiwyg">${i18n[vditor.options.lang].wysiwyg} &lt;${updateHotkeyTip("⌘-⌥-7")}></button>
<button data-mode="ir">${i18n[vditor.options.lang].instantRendering} &lt;${updateHotkeyTip("⌘-⌥-8")}></button>
<button data-mode="sv">${i18n[vditor.options.lang].splitView} &lt;${updateHotkeyTip("⌘-⌥-9")}></button>`;

        this.element.appendChild(panelElement);

        this._bindEvent(vditor, panelElement, menuItem);
    }

    public _bindEvent(vditor: IVditor, panelElement: HTMLElement, menuItem: IMenuItem) {
        const actionBtn = this.element.children[0] as HTMLElement;
        toggleSubMenu(vditor, panelElement, actionBtn, menuItem.level);

        panelElement.children.item(0).addEventListener(getEventName(), (event: Event) => {
            // wysiwyg
            setEditMode(vditor, "wysiwyg", event);
            event.preventDefault();
            event.stopPropagation();
        });

        panelElement.children.item(1).addEventListener(getEventName(), (event: Event) => {
            // ir
            setEditMode(vditor, "ir", event);
            event.preventDefault();
            event.stopPropagation();
        });

        panelElement.children.item(2).addEventListener(getEventName(), (event: Event) => {
            // markdown
            setEditMode(vditor, "sv", event);
            event.preventDefault();
            event.stopPropagation();
        });
    }
}
