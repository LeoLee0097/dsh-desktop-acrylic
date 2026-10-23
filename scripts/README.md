# scripts/

构建脚本，以及一批用来「对着真实 DSH 安装做研究」的维护工具。

只有 `build.mjs` 与 `check-fonts.mjs` 会随 npm 包发布（`package.json` 的 `files` 逐条列了它们）。
其余工具是给维护者在本机跑的一次性研究工具，**不入包**——它们会读你的 `~/.dsh` 与应用安装目录，
其中 `plugin-exemptions --write` 还会改写 profile。

## 路径怎么来的

所有工具都通过 `paths.mjs` 解析路径，不在脚本里写死：

| 值 | 来源（按优先级） |
| --- | --- |
| profile 目录 | 命令行参数 → `DSH_PROFILE_DIR` → `$DSH_HOME/profiles/<DSH_PROFILE>` → `~/.dsh/profiles/desktop` |
| 应用包 `app.asar` | 命令行参数 → `DSH_APP_ASAR` → 常见安装位置（Windows / macOS / Linux 各若干） |
| DSH 运行时版本 | 命令行参数 → `DSH_RUNTIME_VERSION` → 从应用包的 `sharedPackages` 清单读 |

注意 DSH 设置的 `DSH_PROFILE` 是 profile **名**（`desktop`），不是目录；目录是 `DSH_PROFILE_DIR`。
两者不能混用——把名字当路径会把 profile 解析到 `<cwd>/desktop`。

找不到时**报错并列出试过的路径**，不会猜。

## 工具一览

| 脚本 | 做什么 | 写盘 | 联网 |
| --- | --- | --- | --- |
| `build.mjs` | 构建 `lib/client.js` 与两套皮肤，写盘前做四类自检 | `lib/`、`themes/` | 无 |
| `check-fonts.mjs` | 打印宿主字体扫描结果（等宽清单） | 无 | 无 |
| `asar-tool.mjs` | 读 Electron 的 `app.asar`：`list` / `grep` / `extract`，无依赖 | 仅 `extract` 写你指定的文件 | 无 |
| `check-encoding.mjs` | U+FFFD 与 BOM 检查（PowerShell 走 GBK 写文件的事故拦网） | 无 | 无 |
| `diff-tokens.mjs` | 应用引用到的 `--dsw-*` / `--tv-*` vs 皮肤提供过的，找漏项 | 无 | 无 |
| `extract-static-tokens.mjs` | 抄出 shell 的 `--dsw-static-*` 默认值 | `static-tokens.json`（cwd，或 `DSH_TOKENS_OUT`） | 无 |
| `probe-dsh-packages.mjs` | 打印应用包声明的 peer 包版本 | 无 | 无 |
| `plugin-exemptions.mjs` | 哪些已装插件会被运行时拒绝，该发哪些豁免 | 仅 `--write` 时写 profile 的 `compatibility.json` | 无 |
| `check-plugin-updates.mjs` | profile 里的第三方插件 vs 注册表 | `update-plan.json`（cwd） | GET 注册表元数据 |
| `check-provider-support.mjs` | 需要豁免的插件，其提供方是否已适配当前运行时 | 无 | GET 注册表元数据 |

## 安全边界

- **不执行子进程**，不 `eval` 外部输入，不装 hook（`package.json` 只有 `prepublishOnly`，即发布时才跑构建）。
- **联网只发包名**：`check-plugin-updates.mjs` 与 `check-provider-support.mjs` 向
  `https://registry.npmjs.org`（前者失败时回退 `registry.npmmirror.com`）请求元数据，不发送本机信息。
  前者接受第二个参数指定注册表——那是你自己指定的地址。
- **写盘范围**只有三处：工作目录下的 `static-tokens.json` / `update-plan.json`、
  `asar-tool extract` 你指定的输出路径、以及 `plugin-exemptions --write` 的 profile 文件。
  最后这一项会先备份成 `compatibility.json.bak-<时间戳>`、打印新增/移除条目、写完回读校验。
- **只读应用包**：`diff-tokens` / `extract-static-tokens` / `probe-dsh-packages` / `plugin-exemptions`
  会把 182 MB 的 `app.asar` 整体读成字符串（约 400 MB 峰值内存）。这是刻意的取舍：asar 不压缩，
  直接按文本搜索比解包快得多。
- 仓库里没有凭据：`.gitignore` 已忽略上述工具输出与 `*.bak-*`。

## 例子

```sh
node scripts/asar-tool.mjs grep "/path/to/resources/app.asar" "role: \"dialog\"" 5
node scripts/diff-tokens.mjs
node scripts/probe-dsh-packages.mjs
node scripts/check-provider-support.mjs 0.2.1-rc.2
DSH_APP_ASAR="/Applications/DSH Desktop.app/Contents/Resources/app.asar" node scripts/extract-static-tokens.mjs
```
