import {abcRender} from "../markdown/abcRender";
import {chartRender} from "../markdown/chartRender";
import {codeRender} from "../markdown/codeRender";
import {graphvizRender} from "../markdown/graphvizRender";
import {highlightRender} from "../markdown/highlightRender";
import {mathRender} from "../markdown/mathRender";
import {mermaidRender} from "../markdown/mermaidRender";
import {mindmapRender} from "../markdown/mindmapRender";
import {
  hasClosestBlock,
} from "./hasClosest";

export const processPasteCode = (html: string, text: string, type = "sv") => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = html;
    let isCode = false;
    if (tempElement.childElementCount === 1 &&
        (tempElement.lastElementChild as HTMLElement).style.fontFamily.indexOf("monospace") > -1) {
        // VS Code
        isCode = true;
    }
    const pres = tempElement.querySelectorAll("pre");
    if (tempElement.childElementCount === 1 && pres.length === 1
        && pres[0].className !== "vditor-wysiwyg"
        && pres[0].className !== "vditor-textarea") {
        // IDE
        isCode = true;
    }
    if (html.indexOf('\n<p class="p1">') === 0) {
        // Xcode
        isCode = true;
    }

    if (isCode) {
        const code = text || html;
        if (/\n/.test(code) || pres.length === 1) {
            if (type === "wysiwyg") {
                return `<div class="vditor-wysiwyg__block" data-block="0" data-type="code-block"><pre><code>${
                    code.replace(/&/g, "&amp;").replace(/</g, "&lt;")}<wbr></code></pre></div>`;
            }
            if (type === "ir") {
                return "```\n" + code.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "\n```";
            }
            return "```\n" + code + "\n```";
        } else {
            if (type === "wysiwyg") {
                return `<code>${code.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</code><wbr>`;
            }
            return `\`${code}\``;
        }
    }
    return false;
};

export const processCodeRender = (previewPanel: HTMLElement, vditor: IVditor) => {
    if (!previewPanel) {
        return;
    }
    const codeElement = previewPanel.querySelector("code");
    if (!codeElement) {
        return;
    }
    const language = codeElement.className.replace("language-", "");
    if (language === "abc") {
        abcRender(previewPanel, vditor.options.cdn);
    } else if (language === "mermaid") {
        mermaidRender(previewPanel, `.vditor-${vditor.currentMode}__preview .language-mermaid`, vditor.options.cdn);
    } else if (language === "echarts") {
        chartRender(previewPanel, vditor.options.cdn);
    }  else if (language === "mindmap") {
        mindmapRender(previewPanel, vditor.options.cdn);
    } else if (language === "graphviz") {
        graphvizRender(previewPanel, vditor.options.cdn);
    } else if (language === "math") {
        let tag = "div";
        if (previewPanel.tagName === "SPAN") {
            tag = "span";
        }
        previewPanel.innerHTML = `<code class="language-math"><${tag} class="vditor-math">${previewPanel.innerHTML}</${tag}></code>`;
        mathRender(previewPanel.parentElement, {cdn: vditor.options.cdn, math: vditor.options.preview.math});
    } else {
        highlightRender(Object.assign({}, vditor.options.preview.hljs), previewPanel, vditor.options.cdn);
        codeRender(previewPanel, vditor.options.lang);
    }

    previewPanel.setAttribute("data-render", "1");
};

export const syncUpdateCodePreview = (codeElement: HTMLElement, vditor: IVditor) => {
  let blockElement = hasClosestBlock(codeElement);
  if (blockElement) {
    let html = blockElement.outerHTML;
    // log("SpinVditorIRDOM", html, "argument", vditor.options.debugger);
    html = vditor.lute.SpinVditorIRDOM(html);
    // log("SpinVditorIRDOM", html, "result", vditor.options.debugger);
    let tempCodeBlock = new DOMParser().parseFromString(html, 'text/html');
    html = tempCodeBlock.querySelector('.vditor-ir__preview code').innerHTML
    blockElement.querySelector('.vditor-ir__preview code').innerHTML = html;
  }
  // 另外一种方式：（只适合没有多字符被选定的场合）
  // range.insertNode(document.createElement("wbr"));  // 用wbr标记光标位置
  // vditor.ir.element.querySelectorAll(".vditor-ir__node--expand").forEach((item) => {
  //   item.classList.remove("vditor-ir__node--expand");
  // });
  // let blockElement = hasClosestBlock(codeElement);
  // if (blockElement) {
  //   let html = blockElement.outerHTML;
  //   log("SpinVditorIRDOM", html, "argument", vditor.options.debugger);
  //   html = vditor.lute.SpinVditorIRDOM(html);
  //   log("SpinVditorIRDOM", html, "result", vditor.options.debugger);
  //   blockElement.outerHTML = html;
  // }
  // setSelectionFocus(range);
  // execAfterRender(vditor);
  // scrollCenter(vditor);
  // setRangeByWbr(vditor.ir.element, range);  // 根据wbr设置光标位置。jay
  // vditor.ir.element.querySelectorAll(".vditor-ir__preview[data-render='2']").forEach((item: HTMLElement) => {
  //     processCodeRender(item, vditor);
  // });
}
