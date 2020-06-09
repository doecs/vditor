import {hasClosestByHeadings} from "../util/hasClosestByHeadings";

/**
 * 大纲渲染
 * @param contentElement 要渲染的内容元素
 * @param targetElement 大纲元素
 * @param vditor 
 */
export const outlineRender = (contentElement: HTMLElement, targetElement: Element, vditor?: IVditor) => {
    let tocHTML = ""; // 大纲Html
    Array.from(contentElement.children).forEach((item: HTMLElement, index) => {
        if (hasClosestByHeadings(item)) {
            const headingNo = parseInt(item.tagName.substring(1), 10);  // 取header level
            const space = new Array((headingNo - 1) * 2).fill("&emsp;").join(""); // 根据level得到前缀的全角空格字符串
            let text = "";
            if (vditor && vditor.currentMode === "ir") {
                text = item.textContent.substring(headingNo + 1).trim();
            } else {
                text = item.textContent.trim();
            }
            const lastIndex = item.id.lastIndexOf("_"); // 重设id前原id格式，如：ir_xxx(xxx为header文本)
            const lastId = item.id.substring(0, lastIndex === -1 ? undefined : lastIndex);
            item.id = lastId + "_" + index; // 重设后：如，ir-xxx_yy（yy为index）
            tocHTML += `<div data-id="${item.id}" class="vditor-outline__item">${space}${text}</div>`;
        }
    });
    targetElement.innerHTML = tocHTML;
    // 添加点击大纲的事件
    targetElement.querySelectorAll(".vditor-outline__item").forEach((item) => {
        item.addEventListener("click", (event: Event & { target: HTMLElement }) => {
            const id = item.getAttribute("data-id");
            if (vditor) {
              console.log('vditor')
                if (vditor.options.height === "auto") {
                  console.log('vditor height = auto')
                  console.log('document.getElementById(id).offsetTop:' + document.getElementById(id).offsetTop)
                  console.log('vditor.element.offsetTop:' + vditor.element.offsetTop)
                    let windowScrollY = document.getElementById(id).offsetTop + vditor.element.offsetTop;
                    if (!vditor.options.toolbarConfig.pin) {                 
                      console.log('toolbarConfig.pin == not')        
                      console.log('vditor.toolbar.element.offsetHeight:' + vditor.toolbar.element.offsetHeight)
                        windowScrollY += vditor.toolbar.element.offsetHeight; // 如果工具栏是非固定的，则需要加上其高度
                    }              
                    console.log('windowScrollY:' + windowScrollY)  
                    window.scrollTo(window.scrollX, windowScrollY);
                } else {
                  console.log('vditor height != auto')
                  console.log('vditor.element.offsetTop:' + vditor.element.offsetTop)
                  console.log('window.scrollY:' + window.scrollY)
                    if (vditor.element.offsetTop < window.scrollY) {
                        window.scrollTo(window.scrollX, vditor.element.offsetTop);
                    }
                    if (vditor.preview.element.contains(contentElement)) {
                        console.log('vditor.preview.element.contains(contentElement)')
                        contentElement.parentElement.scrollTop = document.getElementById(id).offsetTop;
                    } else {
                        contentElement.scrollTop = document.getElementById(id).offsetTop;
                    }
                    console.log('document.getElementById(id).offsetTop:' + document.getElementById(id).offsetTop)
                }
            } else {
                console.log('no vditor')
                console.log('offsetTop:' + document.getElementById(id).offsetTop)
                window.scrollTo(window.scrollX, document.getElementById(id).offsetTop);
            }
            // 将点击的标题设置为当前标题
            targetElement.querySelectorAll(".vditor-outline__item").forEach((subItem) => {
                subItem.classList.remove("vditor-outline__item--current");
            });
            item.classList.add("vditor-outline__item--current");
        });
    });
};
