// NOTE: 减少 method.ts 打包，故从 hasClosest.ts 中拆分
// 向上查找是否指定的tag（直到class包含：vditor-reset）
export const hasClosestByTag = (element: Node, nodeName: string) => {
    if (!element) {
        return false;
    }
    if (element.nodeType === 3) { // Text
        element = element.parentElement;
    }
    let e = element as HTMLElement;
    let isClosest = false;
    while (e && !isClosest && !e.classList.contains("vditor-reset")) {
        if (e.nodeName.indexOf(nodeName) === 0) {
            isClosest = true;
        } else {
            e = e.parentElement;
        }
    }
    return isClosest && e;
};

// 向上查找是否指定的Heading标签（H1~H6）
export const hasClosestByHeadings = (element: Node) => {
    const headingElement = hasClosestByTag(element, "H");
    if (headingElement && headingElement.tagName.length === 2 && headingElement.tagName !== "HR") {
        return headingElement;
    }
    return false;
};
