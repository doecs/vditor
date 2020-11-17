import {getMarkdown} from "../markdown/getMarkdown";
import {formatRender} from "../sv/formatRender";
import {getEventName} from "../util/compatibility";
import {getElSelectedPosition} from "../util/selection";
import {MenuItem} from "./MenuItem";

export class Format extends MenuItem {
    constructor(vditor: IVditor, menuItem: IMenuItem) {
        super(vditor, menuItem);
        this.element.children[0].addEventListener(getEventName(), (event) => {
            event.preventDefault();
            formatRender(vditor,  vditor.lute.FormatMd( getMarkdown(vditor)),
                getElSelectedPosition(vditor.sv.element, getSelection().getRangeAt(0)));
        });
    }
}
