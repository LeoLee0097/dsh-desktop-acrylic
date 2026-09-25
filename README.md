# dsh-desktop-acrylic

Tokyo Night themes for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) Desktop —
两套主题（暗色 / 亮色）、磨砂面板与全局字体选项。

两套皮肤都是**注册进内置主题运行时的真实主题**（`ctx.theme.register`），因此切换主题就是切换
运行时偏好本身，不依赖属性开关或事后 CSS 覆盖。

---

## 能力一览

| 能力 | 实现方式 | 参数 |
| --- | --- | --- |
| 主题：Tokyo Night 暗色 / 亮色 | 皮肤 token（静态色阶 + 别名色阶 + 组件专属 + 语法高亮），两套各 157 个 token | 暗色底 `#1a1b26`，亮色底 `#e1e2e7` |
| 图标随主题变色 | 桌面端用 `currentColor` 绘制图标且没有图标专属 token，因此图标自动跟随 `--dsw-alias-label-*` / `--dsw-alias-brand-primary` | 无需额外配置 |
| 画布透明度 | 背景族 token 带 alpha | 暗色 `0.10`（90% 透明）；亮色 `0.90`（保证深色文字可读） |
| 材质底层 | 用 Tokyo Night 自身的蓝/紫/青做的柔和渐变色场，固定在最底层并预模糊 | 强度 30%，`blur(28px)` |
| 弹出菜单 / 下拉 / 浮层 | 皮肤下发 `--dsw-menu-backdrop-filter`，由桌面端自带材质通路渲染 | `blur(24px) saturate(1.15)` |
| 对话框（设置窗口等） | 磨砂面板：`isolation` + 绝对定位 `::before` 承载模糊，面板本身不加滤镜 | 底色 `rgba(22,22,30,0.75)`（25% 透明）+ `blur(30px)` |
| 工作区主侧栏 | 静态磨砂纹理（渐变光泽 + 细噪点 + 内高光，均为 `background-image`） | 光泽 7%、噪点 9% / 3px |
| 全局字体 | 设置行输入界面字体 / 代码字体，写入 `--dsw-font-family`、`--ds-font-family-code` | 留空即用默认字体栈 |

以上分别由 `src/theme.mjs` 的 `ACRYLIC`（模糊半径等）与 `SURFACES` / `buildPanelCss`（面板参数）
集中定义；token 由皮肤统一下发，样式规则由构建脚本生成。

---

## 安装

```sh
# 从 GitHub
dsh plugin --profile desktop add github:LeoLee0097/dsh-desktop-acrylic

# 从本地目录（-w 必需，profile 目录本身是 pnpm workspace 根）
dsh plugin --profile desktop add -w /absolute/path/to/dsh-desktop-acrylic
```

安装后完全退出并重启 DSH Desktop。此后单独重载渲染进程也会重新拉取客户端包。

## 使用

**设置 → 通用 → 「Tokyo Night 主题」**：

- **主题**：暗色 / 亮色 / 默认 —— 点击即时切换；
- **亚克力**：模糊已开 / 模糊已关 —— 关掉只去模糊、保留主题；
- **界面字体 / 代码字体**：填写后立即生效，留空恢复默认；
- **诊断行**：`当前偏好 · bg-base 计算值 · chrome on/off · hosts 已挂载/候选 · frost n · panels n`。

`bg-base` 取自 `getComputedStyle(document.body)`，是浏览器实际解析出的值——用来确认主题真的
落到了级联上，而不是「看起来没变化」。

---

## 项目结构

```
dsh-desktop-acrylic/
├── src/
│   ├── theme.mjs          # 调色板、两套皮肤、面板/纹理/字体 CSS（手写，规范来源）
│   └── client.tpl.js      # 浏览器半边模板（手写）
├── scripts/build.mjs      # 构建 + 自检 → 产出下面两项
├── lib/
│   ├── index.js           # 宿主半边：/dark-acrylic/state 路由（持久开关 + 状态上报）
│   └── client.js          # 浏览器半边（GENERATED，勿手改）
├── themes/
│   ├── tokyo-night.json
│   └── tokyo-night-day.json
├── docs/desktop-window-material.md
├── cordis.patch.yml       # profile 补丁层：insert 一个 loader 条目
├── package.json           # dsh.bundle.patch + dsh.client.inject 两处声明
├── LICENSE / .gitignore / .gitattributes
└── README.md
```

```sh
node scripts/build.mjs     # 或 npm run build
```

构建脚本在写盘前做四类自检，任一条不通过就直接失败：

1. **占位符**全部被替换，且无残留；
2. **皮肤**数量 / id / 配色方案、默认主题与语言字典一致；
3. **token 取值**必须符合保守语法（`#hex`、`rgb(a)`、`color-mix`、`blur(..) saturate(..)`、
   `透明` 或 `<n>px`，且不含 `var(` 与分号花括号）——一个坏值足以摧毁整块内联样式；
4. **CSS 安全**：模糊必须挂在 `::before` 图层上、面板必须带不透明底色 token，且没有任何规则
   给布局容器本体加滤镜或定位。

## 诊断

插件会把运行实况上报给宿主路由，写入 `~/.dsh/dark-acrylic-state.json`：

```sh
curl http://127.0.0.1:<端口>/dark-acrylic/state
```

```json
{
  "version": 2,
  "plugin": "tokyo-night-theme",
  "chosen": "tokyo-night",
  "acrylic": true,
  "preference": "tokyo-night",
  "chrome": true,
  "hosts": 0,
  "hostStats": { "matched": 23, "armed": 0, "skipped": 23 },
  "frost": 1,
  "panels": 1,
  "computed": {
    "bgBase": "rgba(22, 22, 30, 0.1)",
    "sidebar": "rgba(15, 16, 23, 0.1)",
    "menuBlur": "blur(24px) saturate(1.15)"
  },
  "instance": "…",
  "at": "…"
}
```

`hosts` 与 `hostStats` 用来解释「为什么某处没有磨砂」：`matched` 是候选容器数，`armed` 是成功
挂上模糊层的数量——布局列普遍是静态元素，被守卫拒绝是正常结果。

## 踩过的坑（都写进了构建自检）

1. **不要给布局容器本体加 `backdrop-filter`**：它会让元素成为 `position: fixed` 后代的包含块，
   而桌面端把侧栏开关、新建会话按钮正是这样钉在标题栏上的——结果就是控件重新锚定、直接消失。
2. **静态容器里不能放绝对定位的模糊图层**：伪元素会逃逸到最近的定位祖先、铺满视口，
   把整个界面连同文字一起糊掉（这正是早期「文字不显示」的原因）。因此模糊层只在容器
   **已经是定位元素**时才挂载。
3. **字体变量不能自引用**：`--dsw-font-family: X, var(--dsw-font-family)` 是 CSS 循环，
   会让该变量与所有读取它的 `font:` 简写一起失效。
4. **设置槽位只给行组件三样东西**：`t`（来自 `locale`）、`useStore`（来自 `store`）、
   以及 `inject(actions)` 的返回值——props 上没有环境里的主题服务。
5. **「透」与「磨砂」是两件事**：透明来自 alpha，磨砂来自对背后内容的卷积；背后必须存在
   可被卷积的纹理，否则调大半径也看不出变化——材质底层就是为此存在的。

## 已知边界

**Windows 上主窗口没有申请窗口材质**（只有欢迎窗口有；macOS 主窗口是 `vibrancy: "sidebar"`）。
因此本插件在 Windows 能做到的是：配色、半透明表面、面板与浮层的磨砂，以及一层应用内的材质
色场；「主界面透出桌面」需要桌面端主进程给主窗口加 `backgroundMaterial: "acrylic"` 与透明
底色，见 [docs/desktop-window-material.md](docs/desktop-window-material.md)。

`prefers-reduced-transparency: reduce` 时模糊层自动停用。

## 变更记录

- **0.6.0** — 对话框（设置窗口）改为真正的磨砂面板：25% 透明底色 + 30px 模糊，用绝对定位
  `::before` 承载滤镜；移除对话框内的静态纹理逻辑。新增 `panels` 诊断。
- **0.5.x** — 静态磨砂纹理（供无法模糊的侧栏使用）、对话框几何判定试验与相应收紧、
  `frost` / `frostTargets` 诊断。
- **0.4.x** — 材质底层（柔和色场）解决「没有东西可模糊」；色场强度与预模糊调优；
  菜单材质半径与 chrome 层解耦。
- **0.3.x** — 按「用主题的方式实现」重做：两套真实皮肤 + 设置行（主题 / 字体）+ 亚克力层；
  分阶段启用定位故障面；安全模式加固（不透明页面基色、可读性优先 alpha、失败隔离、构建期校验）。
- **0.1.0 - 0.2.x** — 早期版本：皮肤注册、设置行、持久开关、透明度档位与相应回归修复。

## License

MIT
