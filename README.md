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

## 数据策略

来源采用教材和原典双层策略。第一版中未完成页码级核验或完整推导的条目不会伪装为已核验，而是标记为：

- `verified`
- `needs-source`
- `needs-derivation`
- `needs-alignment`

`paper_pages/` 与 `paper_texts/` 是本地已有钢丝绳传感论文素材，当前未接入热统知识库。
