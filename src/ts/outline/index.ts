import {Constants} from "../constants";
import {outlineRender} from "../markdown/outlineRender";
import {setPadding} from "../ui/initUI";

export class Outline {
    public element: HTMLElement;

    constructor(outlineLabel: string) {
        this.element = document.createElement("div");
        this.element.className = "vditor-outline";
        this.element.innerHTML = `<div class="vditor-outline__title">${outlineLabel}</div>
<div class="vditor-outline__content"></div>`;
    }

    public render(vditor: IVditor) {
      // 当需要显示时
        if (this.element.style.display === "block") {
            if (vditor.preview.element.style.display === "block") {
                outlineRender(vditor.preview.element.lastElementChild as HTMLElement,
                    this.element.lastElementChild, vditor); // 当显示预览时，对预览进行渲染
            } else {
                outlineRender(vditor[vditor.currentMode].element, 
                  this.element.lastElementChild, vditor); // 其他模式则，则对相对应模式的元素进行渲染
            }
        }
    }

    // 是否显示大纲
    public toggle(vditor: IVditor, show = true) {
        const btnElement = vditor.toolbar.elements.outline?.firstElementChild;
        if (show && window.innerWidth >= Constants.MOBILE_WIDTH) {
            this.element.style.display = "block";
            this.render(vditor);
            btnElement?.classList.add("vditor-menu--current");
        } else {
            this.element.style.display = "none";
            btnElement?.classList.remove("vditor-menu--current");
        }
        setPadding(vditor);
    }
}
