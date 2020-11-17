import {isRangInElement} from "../util/selection";

export const getSelectText = (editor: HTMLElement, range?: Range) => {
    if (isRangInElement(editor, range)) {
        return getSelection().toString();
    }
    return "";
};
