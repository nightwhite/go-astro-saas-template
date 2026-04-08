# Go + Astro Template

高性能、高标准、方便二次开发的模板工程，当前目标栈为：
- 后端：Go + PostgreSQL + Redis + R2 + SMTP + Ent
- 前端：Astro + React
- 交付形态：单一前端工程同时承载 client 与 admin，标准 Docker / Kubernetes / Helm 基线

## 当前已落地

- `apps/api`: 标准 Go 分层后端、Ent 主链路、认证正式链路、安全中间件、settings 配置中心、jobs 队列/调度/补偿骨架、邮件与文件模板能力
- `apps/web`: 单一 Astro 前端工程，同时承载客户端前端和 Admin 前端，`/admin` 默认 `noindex`
- `packages/ui`: 共享 UI 基础组件、列表/设置/后台布局与 design tokens 起点
- `deploy/docker`: 本地开发与容器化基线
- `deploy/k8s`: Kubernetes 清单基线，含 HPA / PDB / ServiceAccount 示例
- `deploy/helm`: Helm Chart 基线，含 env/secrets/resources/HPA/PDB/环境矩阵
- `helloagents`: 主计划、wiki、历史方案与实施记录

## 当前验证状态

- 已通过：
  - `cd apps/api && GOWORK=off GOPROXY=https://goproxy.cn,direct go test ./...`
  - `npm run build`
  - `npm run test:e2e -w apps/web`
  - `zsh scripts/deploy-check.sh`
  - `apps/api/cmd/devstack` + `scripts/load-login.sh` + `scripts/load-admin-pages.sh` + `scripts/explain-check.sh` + `scripts/cache-check.sh`
- 已完成：
  - Ent 主链路与 tenant scope 贯穿
  - Admin/client 同仓 Astro + React 基线
  - 共享 UI 组件与后台布局体系
  - Playwright 前端测试基线，包含 UI 组件、表单交互、权限保护验证
- 已完成的真实联调：
  - 通过 `apps/api/cmd/devstack` 启动 embedded PostgreSQL + miniredis + API，在 `127.0.0.1:18080` 完成登录压测、后台接口压测、Explain 检查、缓存命中率检查
  - 通过 `apps/api/cmd/deploycheck` 校验 `deploy/docker/docker-compose.yml`、`deploy/k8s/*.yaml` 与 Helm `base/staging/production` 模板渲染结果

## 唯一启动命令（根目录）

```bash
npm run dev
```

说明:
- 启动前只需一次性准备：
  - `cp .env.example .env`
  - `npm install`
  - `cd apps/api && GOWORK=off GOPROXY=https://goproxy.cn,direct go mod download`
- `npm run dev` 会自动读取根目录 `.env`，并同时启动：
  - Web: `http://127.0.0.1:4321`
  - API: `http://127.0.0.1:8080`
- 脚本会自动处理端口冲突、等待 API ready 后再启动 Web。

## 环境变量示例

最小可运行示例（本地开发）：

```env
APP_ENV=development
APP_NAME=go-astro-template
APP_HOST=0.0.0.0
APP_PORT=8080
APP_WEB_ORIGIN=http://127.0.0.1:4321
APP_BASE_URL=http://127.0.0.1:8080

POSTGRES_DSN=postgres://postgres:postgres@localhost:5432/go_astro_template?sslmode=disable
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=noreply@example.com
```

完整字段请直接参考根目录 [`.env.example`](/Users/night/Documents/code/go/go-astro-teamplae/.env.example)。

## 故障排查

- `failed to connect to user=night database=` 或走本地 unix socket：
  - 原因: `POSTGRES_DSN` 没有从根目录 `.env` 加载。
  - 处理: 确认根目录 `.env` 存在并包含完整 `POSTGRES_DSN`，再从项目根执行 `npm run dev`。
- `listen tcp 0.0.0.0:8080: bind: address already in use`：
  - 原因: 本机已有旧 API 进程占用 `8080`。
  - 处理: 关闭占用进程，或改 `.env` 里的 `APP_PORT` 后重启。
- 前端显示 `Port 4321 is in use, trying another one`：
  - 原因: 4321 已被占用。
  - 处理: 释放端口或接受 Astro 自动切换到新端口（如 4322）。
- API 启动失败后前端没有停：
  - 当前脚本已在 API 启动失败时主动清理 web 进程；如仍残留，手动终止对应 `astro dev` 进程后重试。

## 校验命令

```bash
sh scripts/check.sh
```

`scripts/check.sh` 会顺序执行：
- `go test`（API）
- `astro check + build`（Web）
- `explain-check`（如服务已就绪）
- `deploy-check`（docker/helm/k8s 模板校验）

## 目录

```text
apps/
  api/
  web/
packages/
  ui/
deploy/
  docker/
  k8s/
  helm/
helloagents/
```

## 文档入口

- `helloagents/history/2026-04/202604051933_master_delivery_plan/task.md`
- `helloagents/wiki/overview.md`
- `helloagents/wiki/modules/backend.md`
- `helloagents/wiki/modules/frontend.md`
- `helloagents/wiki/modules/platform.md`
- `helloagents/wiki/ui-spec.md`
- `helloagents/wiki/secondary-development.md`
- `helloagents/wiki/module-extension-example.md`
