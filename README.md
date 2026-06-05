# 热统骨架项目（Thermal Stat Skeleton）

热统骨架是一个本地优先的 React/Vite 知识图谱应用，用教材页优先的方式组织热力学与统计力学概念、关系、来源和推导状态。项目支持 PWA 离线使用，并提供 Windows Web 包与 Android APK 的首版发布流程。

## 快速上手

- 目标：把“拉库 -> 安装 -> 首次运行”缩到最短。
- 推荐 Node 版本：`24.x`（项目 `.nvmrc` 为 `24`；Capacitor CLI 需要 Node `>=22`）。

### 1) 安装依赖

Windows:
```powershell
# 推荐先查看是否匹配
node -v
npm -v

npm run setup
```

macOS / Linux:
```bash
node -v
npm -v

npm run setup
```

- `npm run setup` = `check:env` + `npm ci` + `lint:data`
- 数据文件会在 `npm run generate:data` 时生成（`src/data/*`），因此首次安装后可直接校验通过。

### 2) 本地运行

```bash
npm run dev
# 或 Windows 常见浏览器路径启动
npm run start:local
```

默认地址：`http://127.0.0.1:5173/`

### 3) 脚本与场景命令

- `npm run generate:data`：生成 `src/data/*`（会写 `meta.generatedAt`）
- `npm run validate:data`：完整数据校验（概念/关系/来源/主键/引用）
- `npm run lint:data`：`generate:data` + `validate:data`
- `npm run check`：`lint:data` + `build`
- `npm run package:release`：生成 `release/` + zip 发布产物（跨平台）
- `npm run cap:sync`：执行网页构建后同步 Capacitor
- `npm run cap:apk`：跨平台打包 Android debug apk
- `npm run test:smoke`：冒烟脚本占位（本地自检入口）

## 环境与安装门槛排查

### `npm run check:env`
会检查：

- Node 版本（需满足 `package.json#engines.node`，当前为 `>=22.0.0`）
- npm 版本（需满足 `package.json#engines.npm`）
- 是否存在 `node_modules`
- `package.json` / `tsconfig.json` / `vite.config.ts`
- `src/data/meta.json`
- `android/gradlew`（仅提示）

建议任何报错按提示修复后重新执行。

## 打包与发布

### 本地发布

```bash
npm run package:release
```

产物：

- `release/thermal-stat-skeleton-web/`
- `release/thermal-stat-skeleton-web.zip`

Windows 下可直接运行：

```powershell
cd release\thermal-stat-skeleton-web
start-windows.cmd
```

### Android APK

```bash
npm run cap:apk
```

产物：

- `android/app/build/outputs/apk/debug/app-debug.apk`

首版 GitHub Release 会发布 debug APK，适合侧载试用；正式上架前需要单独配置 Android 签名 keystore 并生成 release APK/AAB。

### GitHub 首版发布

推送 `v*` tag 会触发 `.github/workflows/release.yml`，自动生成并上传：

- Windows Web 包：`thermal-stat-skeleton-windows-web-<tag>.zip`
- Android debug APK：`thermal-stat-skeleton-android-debug-<tag>.apk`
- 校验文件：`SHA256SUMS.txt`

### CI 健康检查（建议）

新增 GitHub Actions：`.github/workflows/ci.yml`

- `npm ci`
- `npm run lint:data`
- `npm run build`

## 数据与校对流程（Proofread）

建议每次改 `src/data/*.json` 后执行：

```bash
npm run validate:data
```

### 校对口径

每次变更提交前确认：

1. `meta.coverage`
- 四类状态计数完整：`verified` / `needs-source` / `needs-derivation` / `needs-alignment`
- 与概念总数一致

2. `sourceRefs` / `termRefs`
- 必须存在且为字符串数组
- 全部指向有效 `id`

3. 空值字段
- 概念：`title` / `summary` / `sectionTitle` / `articleSections` / `proofStatus`
- 关系：`sourceId` / `targetId` / `type` / `statement` / `sourceRefs` / `assumptions` / `derivationSteps`
- 来源：`title` / `status` / `authors`

4. 关键桥接关系
- `entropy -> partition-function`（`limit-bridge`）
- `partition-function -> helmholtz-free-energy`
- `id` 重复、关系端点缺失应一律拦截

5. 人工复核清单
- **来源**：新增引用是否可查到对应文献
- **推导**：关系推导链是否可复现、是否存在前提假设缺失
- **对齐**：概念定义与章节锚点是否保持同一主题口径

## 常见问题

- `npm run setup` 报错 npm 未找到
  - 检查系统 PATH，或重装 Node LTS，并确认 `npm -v` 可用
- `npm run validate:data` 失败
  - 先执行 `npm run generate:data` 再复跑
  - 查看报错的 `id`、引用路径是否在 `concepts.json`/`relations.json`/`sources.json` 中缺失
- 运行后页面显示空白
  - 检查浏览器控制台是否是数据文件 JSON 解析/加载错误
  - 执行 `npm run check` 进行全量检查
