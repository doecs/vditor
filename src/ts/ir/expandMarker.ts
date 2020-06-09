import {hasClosestByClassName, hasTopClosestByClassName} from "../util/hasClosest";
// 判断下一个是否是是vditor-ir__node节点
const nextIsNode = (range: Range) => {
    const startContainer = range.startContainer;
    if (startContainer.nodeType === 3 && startContainer.nodeValue.length !== range.startOffset) {
        return false; // 起始节点为文本节点并且？？
    }

    let nextNode: HTMLElement = startContainer.nextSibling as HTMLElement;
    // 查找下一个兄弟非空节点
    while (nextNode && nextNode.textContent === "") {
        nextNode = nextNode.nextSibling as HTMLElement;
    }

    if (!nextNode) {
        // *em*|**string**
        const markerElement = hasClosestByClassName(startContainer, "vditor-ir__marker");
        if (markerElement && !markerElement.nextSibling) {
            const parentNextNode = startContainer.parentElement.parentElement.nextSibling as HTMLElement;
            if (parentNextNode && parentNextNode.nodeType !== 3 &&
                parentNextNode.classList.contains("vditor-ir__node")) {
                return parentNextNode;
            }
        }
        return false;
    } else if (nextNode && nextNode.nodeType !== 3 && nextNode.classList.contains("vditor-ir__node") &&
        !nextNode.getAttribute("data-block")) {
        // test|*em*
        return nextNode;
    }

    return false;
};

export const expandMarker = (range: Range, vditor: IVditor) => {
    // 先取消其他已经expand元素的expand状态
    vditor.ir.element.querySelectorAll(".vditor-ir__node--expand").forEach((item) => {
        item.classList.remove("vditor-ir__node--expand");
    });
    // 找到选区起始节点的父层中class=vditor-ir__node节点
    const nodeElement = hasTopClosestByClassName(range.startContainer, "vditor-ir__node");
    // 并将该节点进行expand
    if (nodeElement) {
        nodeElement.classList.add("vditor-ir__node--expand");
        nodeElement.classList.remove("vditor-ir__node--hidden");
    }

    const nextNode = nextIsNode(range); // 如果下一个也是vditor-ir__node节点，则进行expand
    if (nextNode) {
        nextNode.classList.add("vditor-ir__node--expand");
        nextNode.classList.remove("vditor-ir__node--hidden");
        return;
    }
};
