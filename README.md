# 热统骨架

热统骨架是一个本地 React 应用，用教材页优先的方式组织热力学与统计力学知识图谱。

## 功能

- 720 个概念、1424 条关系、88 个来源条目的静态知识库
- 点击概念查看定义、公式、来源和相关术语
- 点击关系查看关系类型、假设和推导步骤
- 热力学与统计力学桥接路径：熵、配分函数、自由能、热力学极限
- 本地搜索、领域筛选、证明状态筛选
- 数据生成和校验脚本，显式保留待补源、待推导、待对齐状态

## 开发

```powershell
npm install
npm run generate:data
npm run validate:data
npm run dev
```

默认开发地址：

```text
http://127.0.0.1:5173/
```

如果端口被占用，Vite 会提示实际端口。

## 构建

```powershell
npm run build
```

构建产物位于 `dist/`。

## 打包

```powershell
npm run package:release
```

打包产物位于 `release/`：

- `thermal-stat-skeleton-web/`：可分发目录
- `thermal-stat-skeleton-web.zip`：压缩包

Windows 上解压后运行：

```powershell
start-windows.cmd
```

应用会通过本地静态服务器打开，不依赖后端 API。

## PWA（离线 + 手机安装）

应用已配置为 PWA，构建后可离线使用并安装到手机/桌面：

- `manifest.webmanifest`：应用名称、图标、`standalone` 显示模式（构建时自动注入）
- Service Worker（`vite-plugin-pwa` 生成）：预缓存应用外壳、内置数据集和 KaTeX 字体，首次加载后整页（含公式）可离线
- 安装入口：右下角「安装到手机」浮动按钮。Chrome/Edge/Android 直接弹出安装；iOS Safari 会提示通过「分享 → 添加到主屏幕」安装

图标由脚本生成（无第三方依赖）：

```powershell
npm run icons
```

本地验证 PWA（Service Worker 在 `dev` 下默认关闭，需用生产构建预览）：

```powershell
npm run build
npm run preview
```

然后在浏览器 DevTools → Application 面板检查 Manifest 与 Service Worker。

## Android（Capacitor 打 APK）

已接入 Capacitor，`android/` 为原生工程，`webDir` 指向 `dist/`。

前置条件（仅打 APK 时需要）：Android Studio 或 Android SDK + JDK 17，并设置好 `local.properties` 中的 SDK 路径（用 Android Studio 打开一次会自动生成）。

```powershell
# 同步最新 Web 构建到原生工程
npm run cap:sync

# 用 Android Studio 打开（推荐，可直接运行/打包/调试）
npm run cap:open

# 或命令行直接打 debug APK（需本机已配置 Android SDK/Gradle）
npm run cap:apk
```

`cap:apk` 产物位于：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

发布版 APK/AAB 需自建签名 keystore，参见 Capacitor 与 Android 官方文档。

## 数据策略

来源采用教材和原典双层策略。第一版中未完成页码级核验或完整推导的条目不会伪装为已核验，而是标记为：

- `verified`
- `needs-source`
- `needs-derivation`
- `needs-alignment`

`paper_pages/` 与 `paper_texts/` 是本地已有钢丝绳传感论文素材，当前未接入热统知识库。
