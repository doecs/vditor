declare module "*.svg";

declare module "*.png";

declare module '*.js'

declare const Lute: ILute;

interface ILuteNode {
    TokensStr: () => string;
    __internal_object__: {
        Parent: {
            Type: number,
        },
        HeadingLevel: string,
    };
}

type ILuteRenderCallback = (node: ILuteNode, entering: boolean) => [string, number];

/** @link https://hacpai.com/article/1588412297062 */
interface ILuteRender {
    renderDocument?: ILuteRenderCallback;
    renderParagraph?: ILuteRenderCallback;
    renderText?: ILuteRenderCallback;
    renderCodeBlock?: ILuteRenderCallback;
    renderCodeBlockOpenMarker?: ILuteRenderCallback;
    renderCodeBlockInfoMarker?: ILuteRenderCallback;
    renderCodeBlockCode?: ILuteRenderCallback;
    renderCodeBlockCloseMarker?: ILuteRenderCallback;
    renderMathBlock?: ILuteRenderCallback;
    renderMathBlockOpenMarker?: ILuteRenderCallback;
    renderMathBlockContent?: ILuteRenderCallback;
    renderMathBlockCloseMarker?: ILuteRenderCallback;
    renderBlockquote?: ILuteRenderCallback;
    renderBlockquoteMarker?: ILuteRenderCallback;
    renderHeading?: ILuteRenderCallback;
    renderHeadingC8hMarker?: ILuteRenderCallback;
    renderList?: ILuteRenderCallback;
    renderListItem?: ILuteRenderCallback;
    renderTaskListItemMarker?: ILuteRenderCallback;
    renderThematicBreak?: ILuteRenderCallback;
    renderHTML?: ILuteRenderCallback;
    renderTable?: ILuteRenderCallback;
    renderTableHead?: ILuteRenderCallback;
    renderTableRow?: ILuteRenderCallback;
    renderTableCell?: ILuteRenderCallback;
    renderFootnotesDef?: ILuteRenderCallback;
    renderCodeSpan?: ILuteRenderCallback;
    renderCodeSpanOpenMarker?: ILuteRenderCallback;
    renderCodeSpanContent?: ILuteRenderCallback;
    renderCodeSpanCloseMarker?: ILuteRenderCallback;
    renderInlineMath?: ILuteRenderCallback;
    renderInlineMathOpenMarker?: ILuteRenderCallback;
    renderInlineMathContent?: ILuteRenderCallback;
    renderInlineMathCloseMarker?: ILuteRenderCallback;
    renderEmphasis?: ILuteRenderCallback;
    renderEmAsteriskOpenMarker?: ILuteRenderCallback;
    renderEmAsteriskCloseMarker?: ILuteRenderCallback;
    renderEmUnderscoreOpenMarker?: ILuteRenderCallback;
    renderEmUnderscoreCloseMarker?: ILuteRenderCallback;
    renderStrong?: ILuteRenderCallback;
    renderStrongA6kOpenMarker?: ILuteRenderCallback;
    renderStrongA6kCloseMarker?: ILuteRenderCallback;
    renderStrongU8eOpenMarker?: ILuteRenderCallback;
    renderStrongU8eCloseMarker?: ILuteRenderCallback;
    renderStrikethrough?: ILuteRenderCallback;
    renderStrikethrough1OpenMarker?: ILuteRenderCallback;
    renderStrikethrough1CloseMarker?: ILuteRenderCallback;
    renderStrikethrough2OpenMarker?: ILuteRenderCallback;
    renderStrikethrough2CloseMarker?: ILuteRenderCallback;
    renderHardBreak?: ILuteRenderCallback;
    renderSoftBreak?: ILuteRenderCallback;
    renderInlineHTML?: ILuteRenderCallback;
    renderLink?: ILuteRenderCallback;
    renderOpenBracket?: ILuteRenderCallback;
    renderCloseBracket?: ILuteRenderCallback;
    renderOpenParen?: ILuteRenderCallback;
    renderCloseParen?: ILuteRenderCallback;
    renderLinkText?: ILuteRenderCallback;
    renderLinkSpace?: ILuteRenderCallback;
    renderLinkDest?: ILuteRenderCallback;
    renderLinkTitle?: ILuteRenderCallback;
    renderImage?: ILuteRenderCallback;
    renderBang?: ILuteRenderCallback;
    renderEmoji?: ILuteRenderCallback;
    renderEmojiUnicode?: ILuteRenderCallback;
    renderEmojiImg?: ILuteRenderCallback;
    renderEmojiAlias?: ILuteRenderCallback;
    renderToC?: ILuteRenderCallback;
    renderFootnotesRef?: ILuteRenderCallback;
    renderBackslash?: ILuteRenderCallback;
    renderBackslashContent?: ILuteRenderCallback;
}

interface ILuteOptions extends IMarkdownConfig {
    emojis: { [key: string]: string };
    emojiSite: string;
    headingAnchor: boolean;
    inlineMathDigit: boolean;
    lazyLoadImage?: string;
}

interface ILute {
    WalkStop: number;
    WalkSkipChildren: number;
    WalkContinue: number;
    Version: string;

    New(): ILute;

    GetHeadingID(node: ILuteNode): string;

    SetJSRenderers(options?: {
        renderers: {
            HTML2VditorDOM?: ILuteRender,
            HTML2VditorIRDOM?: ILuteRender,
            HTML2Md?: ILuteRender,
            Md2HTML?: ILuteRender,
            Md2VditorDOM?: ILuteRender,
            Md2VditorIRDOM?: ILuteRender,
        },
    }): void;

    SetChineseParagraphBeginningSpace(enable: boolean): void;

    SetRenderListMarker(enable: boolean): void;

    SetLinkBase(url: string): void;

    SetSanitize(enable: boolean): void;

    SetHeadingAnchor(enable: boolean): void;

    SetImageLazyLoading(imagePath: string): void;

    SetInlineMathAllowDigitAfterOpenMarker(enable: boolean): void;

    SetToC(enable: boolean): void;

    SetFootnotes(enable: boolean): void;

    SetAutoSpace(enable: boolean): void;

    SetChinesePunct(enable: boolean): void;

    SetFixTermTypo(enable: boolean): void;

    SetEmojiSite(emojiSite: string): void;

    SetSetext(enable: boolean): void;

    SetVditorCodeBlockPreview(enable: boolean): void;

    PutEmojis(emojis: { [key: string]: string }): void;

    GetEmojis(): { [key: string]: string };

    FormatMd(markdown: string): string;

    // debugger md
    RenderEChartsJSON(text: string): string;

    // md 转换为 html
    Md2HTML(markdown: string): string;

    // 粘贴时将 html 转换为 md
    HTML2Md(html: string): string;

    // wysiwyg 转换为 html
    VditorDOM2HTML(vhtml: string): string;

    // wysiwyg 输入渲染
    SpinVditorDOM(html: string): string;

    // 粘贴时将 html 转换为 wysiwyg
    HTML2VditorDOM(html: string): string;

    // 将 wysiwyg 转换为 md
    VditorDOM2Md(html: string): string;

    // 将 md 转换为 wysiwyg
    Md2VditorDOM(markdown: string): string;

    // ir 输入渲染
    SpinVditorIRDOM(markdown: string): string;

    // ir 获取 md
    VditorIRDOM2Md(html: string): string;

    // md 转换为 ir
    Md2VditorIRDOM(html: string): string;

    // 获取 HTML
    VditorIRDOM2HTML(html: string): string;

    HTML2VditorIRDOM(html: string): string;
}

declare const webkitAudioContext: {
    prototype: AudioContext
    new(contextOptions?: AudioContextOptions): AudioContext,
};

interface II18nLang {
    en_US: string;
    ko_KR: string;
    zh_CN: string;
}

interface II18n {
    en_US: { [key: string]: string };
    ko_KR: { [key: string]: string };
    zh_CN: { [key: string]: string };
}

interface IClasses {
    preview?: string;
}

/** @link https://hacpai.com/article/1549638745630#options-upload */
interface IUpload {
    /** 上传 url */
    url?: string;
    /** 上传文件最大 Byte */
    max?: number;
    /** 剪切板中包含图片地址时，使用此 url 重新上传 */
    linkToImgUrl?: string;
    /** CORS 上传验证，头为 X-Upload-Token */
    token?: string;
    /** 文件上传类型，同 [input accept](https://www.w3schools.com/tags/att_input_accept.asp) */
    accept?: string;
    /** 跨站点访问控制。默认值: false */
    withCredentials?: boolean;
    /** 请求头设置 */
    headers?: { [key: string]: string };
    /** 额外请求参数 */
    extraData?: { [key: string]: string | Blob };

    /** 每次上传前都会重新设置请求头 */
    setHeaders?(): { [key: string]: string };

    /** 上传成功回调 */
    success?(editor: HTMLPreElement, msg: string): void;

    /** 上传失败回调 */
    error?(msg: string): void;

    /** 文件名安全处理。 默认值: name => name.replace(/\W/g, '') */
    filename?(name: string): string;

    /** 校验，成功时返回 true 否则返回错误信息 */
    validate?(files: File[]): string | boolean;

    /** 自定义上传，当发生错误时返回错误信息 */
    handler?(files: File[]): string | null;

    /** 对服务端返回的数据进行转换，以满足内置的数据结构 */
    format?(files: File[], responseText: string): string;

    /** 将上传的文件处理后再返回  */
    file?(files: File[]): File[];
}

/** @link https://hacpai.com/article/1549638745630#options-toolbar */
interface IMenuItem {
    /** 唯一标示 */
    name: string;
    /** svg 图标 HTML */
    icon?: string;
    /** 元素的样式名称 */
    className?: string;
    /** 提示 */
    tip?: string;
    /** 快捷键，支持⌘/ctrl-key 或 ⌘/ctrl-⇧/shift-key 格式的配置，不支持 wysiwyg 模式 */
    hotkey?: string;
    /** 插入编辑器中的后缀 */
    suffix?: string;
    /** 插入编辑器中的前缀 */
    prefix?: string;
    /** 提示位置：ne, nw */
    tipPosition?: string;
    /** 子菜单 */
    toolbar?: Array<string | IMenuItem>;
    /** 菜单层级，最大为 3，内部使用 */
    level?: number;

    /** 自定义按钮点击时触发的事件 */
    click?(status?: boolean): void;
}

/** @link https://hacpai.com/article/1549638745630#options-preview-hljs */
interface IHljs {
    /** 是否启用行号。默认值: false */
    lineNumber?: boolean;
    /** 代码风格，可选值参见 [Chroma](https://xyproto.github.io/splash/docs/longer/all.html)。 默认值: 'github' */
    style?: string;
    /** 是否启用代码高亮。默认值: true */
    enable?: boolean;
}

/** @link https://hacpai.com/article/1549638745630#options-preview-math */
interface IMath {
    /** 内联数学公式起始 $ 后是否允许数字。默认值: false */
    inlineDigit: boolean;
    /** 使用 MathJax 渲染时传入的宏定义。默认值: {} */
    macros: object;
    /** 数学公式渲染引擎。默认值: 'KaTeX' */
    engine: "KaTeX" | "MathJax";
}

/** @link https://hacpai.com/article/1549638745630#options-preview-markdown */
interface IMarkdownConfig {
    /** 自动空格。默认值: false */
    autoSpace?: boolean;
    /** 段落开头是否空两格。默认值: false */
    paragraphBeginningSpace?: boolean;
    /** 自动矫正术语。默认值: false */
    fixTermTypo?: boolean;
    /** 自动矫正标点。默认值: false */
    chinesePunct?: boolean;
    /** 插入目录。默认值: false */
    toc?: boolean;
    /** 脚注。默认值: true */
    footnotes?: boolean;
    /** wysiwyg & ir 模式代码块是否渲染。默认值: true */
    codeBlockPreview: boolean;
    /** 是否解析 setext 标题。默认值: false */
    setext: boolean;
    /** 是否启用过滤 XSS。默认值: true */
    sanitize: boolean;
    /** 内容主题。默认值：light */
    theme?: string;
    /** 链接前缀。默认值：'' */
    linkBase?: string;
    /** 为列表添加标记，以便[自定义列表样式](https://github.com/Vanessa219/vditor/issues/390) 默认值：false */
    listMarker?: boolean;
}

/** @link https://hacpai.com/article/1549638745630#options-preview */
interface IPreview {
    /** 预览 debounce 毫秒间隔。默认值: 1000 */
    delay?: number;
    /** 预览区域最大宽度。默认值: 768 */
    maxWidth?: number;
    /** 显示模式。默认值: 'both' */
    mode?: "both" | "editor";
    /** md 解析请求 */
    url?: string;
    /** @link https://hacpai.com/article/1549638745630#options-preview-hljs */
    hljs?: IHljs;
    /** @link https://hacpai.com/article/1549638745630#options-preview-math */
    math?: IMath;
    /** @link https://hacpai.com/article/1549638745630#options-preview-markdown */
    markdown?: IMarkdownConfig;

    /** 预览回调 */
    parse?(element: HTMLElement): void;

    /** 渲染之前回调 */
    transform?(html: string): string;
}

interface IPreviewOptions {
    customEmoji?: { [key: string]: string };
    lang?: (keyof II18nLang);
    lazyLoadImage?: string;
    emojiPath?: string;
    hljs?: IHljs;
    speech?: {
        enable?: boolean,
    };
    anchor?: number; // 0: no render, 1: render left, 2: render right
    math?: IMath;
    cdn?: string;
    markdown?: IMarkdownConfig;
    renderers?: ILuteRender;

    transform?(html: string): string;

    after?(): void;
}

interface IHintData {
    html: string;
    value: string;
}

/** @link https://hacpai.com/article/1549638745630#options-hint */
interface IHint {
    /** 常用表情提示 HTML */
    emojiTail?: string;
    /** 提示 debounce 毫秒间隔。默认值: 200 */
    delay?: number;
    /** 默认表情，可从 [lute/emoji_map](https://github.com/88250/lute/blob/master/parse/emoji_map.go#L32) 中选取，也可自定义 */
    emoji?: { [key: string]: string };
    /** 表情图片地址。默认值: 'https://cdn.jsdelivr.net/npm/vditor@${VDITOR_VERSION}/dist/images/emoji' */
    emojiPath?: string;

    /** `@`用户回调 */
    at?(value: string): IHintData[];
}

interface IResize {
    position?: string;
    enable?: boolean;

    after?(height: number): void;
}

/** @link https://hacpai.com/article/1549638745630#options */
interface IOptions {
    /** 编辑器初始化值。默认值: '' */
    value?: string;
    /** 是否显示日志。默认值: false */
    debugger?: boolean;
    /** 是否启用打字机模式。默认值: false */
    typewriterMode?: boolean;
    /** @link https://hacpai.com/article/1549638745630#options-keymap */
    keymap?: { [key: string]: string };
    /** 编辑器总高度。默认值: 'auto' */
    height?: number | string;
    /** 编辑器最小高度 */
    minHeight?: number;
    /** 编辑器总宽度，支持 %。默认值: 'auto' */
    width?: number | string;
    /** 输入区域为空时的提示。默认值: '' */
    placeholder?: string;
    /** 多语言。默认值: 'zh_CN' */
    lang?: (keyof II18nLang);
    /** @link https://hacpai.com/article/1549638745630#options-toolbar */
    toolbar?: Array<string | IMenuItem>;
    /** @link https://hacpai.com/article/1549638745630#options-resize */
    resize?: IResize;
    /** @link https://hacpai.com/article/1549638745630#options-counter */
    counter?: {
        enable: boolean;
        max?: number;
        type: "markdown" | "text";
    };
    /** @link https://hacpai.com/article/1549638745630#options-cache */
    cache?: {
        id?: string;
        enable?: boolean;
        after?(markdown: string): void;
    };
    /** 编辑模式。默认值: 'wysiwyg' */
    mode?: "wysiwyg" | "sv" | "ir";
    /** @link https://hacpai.com/article/1549638745630#options-preview */
    preview?: IPreview;
    /** @link https://hacpai.com/article/1549638745630#options-hint */
    hint?: IHint;
    /** @link https://hacpai.com/article/1549638745630#options-toolbarConfig */
    toolbarConfig: {
        hide?: boolean,
        pin?: boolean,
    };
    /** 主题。默认值: 'classic' */
    theme?: "classic" | "dark";
    /** @link https://hacpai.com/article/1549638745630#options-upload */
    upload?: IUpload;
    /** @link https://hacpai.com/article/1549638745630#options-classes */
    classes?: IClasses;
    /** 配置自建 CDN 地址。默认值: 'https://cdn.jsdelivr.net/npm/vditor@${VDITOR_VERSION}' */
    cdn?: string;
    /** tab 键操作字符串，支持 \t 及任意字符串 */
    tab?: string;
    /** 是否展现大纲。默认值：'false' */
    outline?: boolean;

    /** 编辑器异步渲染完成后的回调方法 */
    after?(): void;

    /** 输入后触发 */
    input?(value: string, previewElement?: HTMLElement): void;

    /** 聚焦后触发  */
    focus?(value: string): void;

    /** 失焦后触发 */
    blur?(value: string): void;

    /** `esc` 按下后触发 */
    esc?(value: string): void;

    /** `⌘/ctrl+enter` 按下后触发 */
    ctrlEnter?(value: string): void;

    /** 编辑器中选中文字后触发 */
    select?(value: string): void;
}

interface IEChart {
    setOption(option: any): void;

    resize(): void;
}

interface IVditor {
    element: HTMLElement;
    options: IOptions;
    originalInnerHTML: string;
    lute: ILute;
    currentMode: "sv" | "wysiwyg" | "ir";
    devtools?: {
        element: HTMLDivElement,
        renderEchart(vditor: IVditor): void,
    };
    outline: {
        element: HTMLElement,
        render(vditor: IVditor): void,
        toggle(vditor: IVditor, show?: boolean): void,
    };
    toolbar?: {
        elements?: { [key: string]: HTMLElement },
        element?: HTMLElement,
    };
    preview?: {
        element: HTMLElement
        render(vditor: IVditor, value?: string): void,
    };
    sv?: {
        element: HTMLPreElement,
    };
    counter?: {
        element: HTMLElement
        render(vditor: IVditor, mdText?: string): void,
    };
    resize?: {
        element: HTMLElement,
    };
    hint: {
        timeId: number
        element: HTMLDivElement
        recentLanguage: string
        fillEmoji(element: HTMLElement, vditor: IVditor): void
        render(vditor: IVditor): void,
        genHTML(data: IHintData[], key: string, vditor: IVditor): void
        select(event: KeyboardEvent, vditor: IVditor): boolean,
    };
    tip: {
        element: HTMLElement
        show(text: string, time?: number): void
        hide(): void,
    };
    upload?: {
        element: HTMLElement
        isUploading: boolean
        range: Range,
    };
    undo?: {
        redo(vditor: IVditor): void
        undo(vditor: IVditor): void
        addToUndoStack(vditor: IVditor): void
        recordFirstPosition(vditor: IVditor): void,
        resetIcon(vditor: IVditor): void,
    };
    wysiwygUndo?: {
        redo(vditor: IVditor): void
        undo(vditor: IVditor): void
        addToUndoStack(vditor: IVditor): void
        recordFirstWbr(vditor: IVditor, event: KeyboardEvent): void,
        resetIcon(vditor: IVditor): void,
    };
    irUndo?: {
        redo(vditor: IVditor): void
        undo(vditor: IVditor): void
        addToUndoStack(vditor: IVditor): void
        recordFirstWbr(vditor: IVditor, event: KeyboardEvent): void,
        resetIcon(vditor: IVditor): void,
    };
    wysiwyg?: {
        element: HTMLPreElement,
        popover: HTMLDivElement,
        afterRenderTimeoutId: number,
        hlToolbarTimeoutId: number,
        preventInput: boolean,
        composingLock: boolean,
    };
    ir?: {
        element: HTMLPreElement,
        composingLock: boolean,
        preventInput: boolean,
        processTimeoutId: number,
        hlToolbarTimeoutId: number,
    };
}
