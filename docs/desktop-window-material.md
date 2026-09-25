# 桌面端最小改动说明：主窗口启用亚克力材质

这份说明解决的是**插件无法解决**的那一半：让 Windows 上的主窗口透出桌面。

## 现象

装上 `dsh-desktop-acrylic` 后，菜单、弹层、对话框有磨砂效果，但主界面（画布、侧栏、
内容区）看不出变化。这不是主题没生效，而是主窗口本身不透明——界面层再怎么半透明，
也只能透出窗口自己的底色。

## 实测证据

来自桌面端打包产物（`DeepSeek Harness.exe` 内的主进程代码）：

| 位置 | 实测内容 |
| --- | --- |
| 主窗口 `createWindow()` | win32 分支只有 `titleBarStyle: "hidden"` 与 `titleBarOverlay { height: 40, color: chromeFallbackFill(), symbolColor: … }`；**没有** `backgroundMaterial`，**没有** `transparent`，**没有** 透明的 `backgroundColor` |
| 欢迎窗口 `welcomeWindowOptions()` | win32 分支**包含** `backgroundMaterial: "acrylic"` |
| 主窗口 macOS 分支 | `vibrancy: "sidebar"`、`visualEffectState: "active"`、`backgroundColor: "#00000000"`，并在 minimize/hide/restore/show 时重新设置 vibrancy |
| `chromeFallbackFill()` | 深色 `#1b1b1c` / 浅色 `#f9fafb`（不透明回退色） |
| 应用样式表 | `[data-platform=darwin] .ZTP-Xa_frame { background: 0 0 }`（macOS 框架自身透明）；Windows 下框架使用 `var(--dsw-alias-bg-base)` |

结论：**亚克力材质在 Windows 上只给了欢迎窗口**，主窗口没有申请。macOS 主窗口则一直有。

## 最小改动

在主进程 `createWindow()` 里给 `new BrowserWindow({…})` 补两项，位置就是现有的
`process.platform === "win32" && primary ? {…} : {}` 分支：

```js
process.platform === 'win32' && primary
  ? {
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        height: 40,
        color: chromeFallbackFill(),
        symbolColor: nativeTheme.shouldUseDarkColors ? '#f9fafb' : '#0f1115',
      },
      // ↓ 新增：申请亚克力材质 + 把窗口底色设为透明，否则页面再透明也只会露出不透明底色
      backgroundMaterial: 'acrylic',
      backgroundColor: '#00000000',
    }
  : {},
```

`backgroundMaterial` 需要 Windows 11（22H2 及以上）与较新的 Electron；不满足时应静默回落
为普通不透明窗口。若想做成运行期可切换（跟随主题开关），可使用窗口实例方法
`window.setBackgroundMaterial('acrylic' | 'none')`——**请以本项目实际的 Electron 版本为准**，
若不支持则保留静态写法。

## 配套注意

1. **回落**：参考 macOS 分支已有的 `applyBackdrop()`——最小化/隐藏时把材质设为 `null`
   并把底色设回 `chromeFallbackFill()`，恢复显示时再设回材质与透明底色。Windows 上
   建议同样处理，避免最小化动画期间出现黑块。
2. **拖动区域**：启用透明窗口后，标题栏区域的 `-webkit-app-region: drag` 仍需保留，
   否则窗口不可拖动；按钮所在的交互区域要保持 `no-drag`（现有样式已处理）。
3. **系统设置**：用户关闭系统「透明效果」时，材质不会渲染；此时窗口应表现为
   `chromeFallbackFill()` 的不透明底，可接受。
4. **性能**：亚克力窗口在低端显卡/远程桌面上开销明显，最好提供开关或跟随系统设置。

## 插件侧不需要改

`dsh-desktop-acrylic` 的 token 与样式层是按「窗口透明」前提写的：画布与各表面本就是
半透明 `rgba()`，窗口一旦带上材质，效果会立刻成立。主窗口提供材质后，本文件可以视为
历史记录。

## 验证

1. 改动后重启桌面端，窗口边缘应能透出桌面且带模糊。
2. 打开插件设置开关，关闭时应回落到不透明（若采用了运行期切换）。
3. 最小化再恢复，窗口不应出现黑块或残影。
