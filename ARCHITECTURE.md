# AlloyLab Angular Platform - 企業級架構文件

## 專案概述

AlloyLab Angular Platform 是一個企業級的 Angular 應用程式，展示了以下核心功能：

- **Typed Forms + Signals**: 大型表單與審批流程管理
- **嚴謹 RBAC**: 角色型存取控制與權限管理
- **Dual-control 審批**: 高風險操作的雙重控制機制
- **即時事件監控**: SSE/WebSocket 實時事件追蹤
- **稽核軌跡**: 完整的操作記錄與審計
- **共用 Types/SDK**: 與 React 主線共用型別定義

## 技術棧

- **Angular**: 20.3.0
- **TypeScript**: 5.9.2
- **狀態管理**: Angular Signals
- **表單**: Typed Reactive Forms
- **套件管理**: pnpm 9.0.0
- **Node.js**: 20.19+

## 專案結構

```
angular-app/
├── src/
│   ├── shared/
│   │   └── sdk/                    # @alloylab/types & @alloylab/sdk
│   │       ├── types.ts            # 由 OpenAPI 產生的型別
│   │       ├── client.ts           # SDK 客戶端
│   │       └── index.ts
│   │
│   ├── app/
│   │   ├── core/                   # 核心服務與基礎設施
│   │   │   ├── auth/               # 認證與權限
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── permission.service.ts
│   │   │   │   └── require-perm.guard.ts
│   │   │   ├── http/               # HTTP 服務
│   │   │   │   └── api.service.ts
│   │   │   ├── interceptors/       # HTTP 攔截器
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── logger/             # 日誌服務
│   │   │   │   └── logger.service.ts
│   │   │   └── events/             # 即時事件
│   │   │       └── events-sse.service.ts
│   │   │
│   │   ├── shared/                 # 共用元件與服務
│   │   │   ├── ui/                 # UI 元件
│   │   │   │   ├── button/
│   │   │   │   └── table/
│   │   │   ├── pipes/              # 管道
│   │   │   │   ├── date-format.pipe.ts
│   │   │   │   └── status-badge.pipe.ts
│   │   │   ├── validators/         # 驗證器
│   │   │   │   └── custom.validators.ts
│   │   │   ├── directives/         # 指令
│   │   │   │   ├── has-perm.directive.ts
│   │   │   │   └── has-role.directive.ts
│   │   │   └── forms/              # 表單服務
│   │   │       ├── typed-form.service.ts
│   │   │       └── draft.service.ts
│   │   │
│   │   ├── store/                  # Signal Store 狀態管理
│   │   │   ├── app.store.ts
│   │   │   ├── approvals.store.ts
│   │   │   ├── flags.store.ts
│   │   │   └── events.store.ts
│   │   │
│   │   ├── features/               # 功能模組
│   │   │   ├── dashboard/          # 儀表板
│   │   │   ├── approvals/          # 審批中心
│   │   │   │   ├── approvals-list/
│   │   │   │   ├── approval-form/
│   │   │   │   ├── approval-detail/
│   │   │   │   ├── services/
│   │   │   │   │   └── dual-control.service.ts
│   │   │   │   └── approvals.routes.ts
│   │   │   ├── flags/              # 旗標管理
│   │   │   │   └── flags.routes.ts
│   │   │   ├── events/             # 事件監控
│   │   │   │   └── events.routes.ts
│   │   │   ├── settings/           # 平台設定
│   │   │   │   └── settings.routes.ts
│   │   │   └── audit/              # 稽核瀏覽
│   │   │       ├── audit-list/
│   │   │       └── audit.routes.ts
│   │   │
│   │   ├── app.routes.ts           # 主路由配置
│   │   └── app.config.ts           # 應用程式配置
│   │
│   └── environments/               # 環境配置
│       ├── environment.ts
│       └── environment.prod.ts
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 核心功能

### 1. 共用型別與 SDK (@alloylab/types, @alloylab/sdk)

**目的**: 與 React 主線共用型別定義，避免重複

**檔案**: `src/shared/sdk/`

**特點**:

- 由 OpenAPI 產生的型別定義 (`types.ts`)
- 統一的 SDK 客戶端 (`client.ts`)
- 支援 auth、flags、experiments、events 等 API
- 薄服務層包裝（便於攔截/快取/重試）

**使用方式**:

```typescript
import { sdk, Permission, User } from '../shared/sdk';

// 使用 SDK
const response = await sdk.approvals.list().toPromise();
```

### 2. 嚴謹 RBAC 系統

**目的**: 提供細粒度的權限控制

**核心檔案**:

- `src/app/core/auth/permission.service.ts` - 權限管理
- `src/app/core/auth/require-perm.guard.ts` - 路由守衛
- `src/app/shared/directives/has-perm.directive.ts` - UI 權限指令

**特點**:

- **路由守衛**: 使用 `CanMatch` 讀取 `data.requirePerm`
- **結構型指令**: `*hasPerm`、`*hasRole` 控制 UI 顯示
- **權限快取**: 登入後取得 effective permissions，存入 signal store，15 分鐘失效

**使用方式**:

```typescript
// 路由守衛
{
  path: 'approvals',
  loadChildren: () => import('./features/approvals/approvals.routes'),
  canMatch: [RequirePermGuard],
  data: { requirePerm: [Permission.VIEW_APPROVALS] }
}

// 結構型指令
<button *hasPerm="[Permission.CREATE_APPROVAL]">新增審批</button>
<div *hasRole="[UserRole.ADMIN, UserRole.MANAGER]">管理功能</div>

// 程式碼檢查
if (this.permissionService.hasPermission(Permission.APPROVE_REQUESTS)) {
  // 執行操作
}
```

### 3. Typed Forms + Signals

**目的**: 大型表單與審批流程管理

**核心檔案**:

- `src/app/shared/forms/typed-form.service.ts` - 表單服務
- `src/app/shared/forms/draft.service.ts` - 草稿管理

**特點**:

- **Schema-driven**: 基於 `@alloylab/types` 的 schema 產生表單
- **交叉驗證**: 支援複雜的表單驗證邏輯
- **條件欄位**: 依條件顯示/禁用欄位
- **草稿保存**: 本地 IndexedDB 自動保存

**使用方式**:

```typescript
// 建立表單
const form = this.typedFormService.createForm(fields, initialValues);

// 套用條件邏輯
this.typedFormService.applyConditionalLogic(form, 'fieldName', conditional);

// 自動保存草稿
const cleanup = this.draftService.autoSave('formId', form, 30000);

// 載入草稿
const draft = this.draftService.loadDraft('formId');
if (draft) {
  form.patchValue(draft.data);
}
```

### 4. Dual-control 審批

**目的**: 高風險操作的雙重控制機制

**核心檔案**:

- `src/app/features/approvals/services/dual-control.service.ts`

**特點**:

- 高風險操作需要兩個獨立的批准者
- 批准者之間不能互相審批對方的請求
- 支援多級審批流程
- 記錄完整的審批軌跡

**判斷條件**:

- 請求類型為 `budget` 或 `purchase`
- 金額超過 10,000

**使用方式**:

```typescript
// 檢查是否需要 Dual-control
const isDualControl = this.dualControlService.requiresDualControl(request);

// 檢查使用者是否可以審批
const { canApprove, reason } = this.dualControlService.canApprove(request);

// 取得審批進度
const progress = this.dualControlService.getApprovalProgress(request);
// { current: 1, required: 2, percentage: 50 }
```

### 5. Signal Store 狀態管理

**目的**: 響應式狀態管理

**核心檔案**:

- `src/app/store/app.store.ts` - 全域狀態
- `src/app/store/approvals.store.ts` - 審批狀態
- `src/app/store/flags.store.ts` - 旗標狀態
- `src/app/store/events.store.ts` - 事件狀態

**特點**:

- 基於 Angular Signals
- 響應式計算屬性
- 統一的狀態管理模式
- 支援篩選、分頁、排序

**使用方式**:

```typescript
@Component({...})
export class MyComponent {
  store = inject(ApprovalsStore);

  ngOnInit() {
    // 載入資料
    this.store.fetchApprovals();

    // 讀取狀態
    const approvals = this.store.approvals();
    const loading = this.store.loading();

    // 使用計算屬性
    const pending = this.store.pendingApprovals();

    // 套用篩選
    this.store.setFilters({ status: ['pending'] });
  }
}
```

### 6. 即時事件監控 (SSE)

**目的**: 實時事件追蹤與監控

**核心檔案**:

- `src/app/core/events/events-sse.service.ts`

**特點**:

- 基於 Server-Sent Events (SSE)
- Ring Buffer 緩衝 2000 筆事件
- 自動重連機制
- 事件過濾與搜尋
- 匯出功能 (JSON/CSV)

**使用方式**:

```typescript
// 啟動 SSE 連線
this.eventsSse.start('http://localhost:3000/api/events/stream');

// 取得即時事件
const recentEvents = this.eventsSse.recentEvents();
const criticalEvents = this.eventsSse.criticalEvents();

// 事件過濾
const userEvents = this.eventsSse.getEventsByType(EventType.USER_LOGIN);
const highSeverity = this.eventsSse.getEventsBySeverity(EventSeverity.HIGH);

// 搜尋事件
const results = this.eventsSse.searchEvents('login');

// 匯出事件
const csv = this.eventsSse.exportEventsAsCSV();

// 停止連線
this.eventsSse.stop();
```

### 7. 稽核軌跡系統

**目的**: 完整的操作記錄與審計

**核心檔案**:

- `src/app/features/audit/audit-list/audit-list.component.ts`

**特點**:

- 記錄所有使用者操作
- 支援多維度篩選（使用者、操作、資源類型、時間範圍）
- 統計分析（活躍使用者、今日操作等）
- 匯出功能 (CSV)
- 詳細的操作記錄

**篩選條件**:

- 使用者 ID
- 操作類型 (create, read, update, delete, login, logout, approve, reject, etc.)
- 資源類型 (user, approval_request, feature_flag, setting, webhook)
- 資源 ID
- 時間範圍

## 路由結構

```typescript
/                       → 重導向到 /dashboard
/login                  → 登入頁面
/dashboard              → 儀表板 (VIEW_DASHBOARD)
/approvals              → 審批列表 (VIEW_APPROVALS)
/approvals/new          → 新增審批 (CREATE_APPROVAL)
/approvals/:id          → 審批詳情 (VIEW_APPROVALS)
/flags                  → 旗標列表 (VIEW_FLAGS)
/flags/new              → 新增旗標 (MANAGE_FLAGS)
/flags/:id              → 旗標詳情 (VIEW_FLAGS)
/flags/:id/compare      → 旗標比較 (VIEW_FLAGS)
/events                 → 事件監控 (VIEW_EVENTS)
/events/:id             → 事件詳情 (VIEW_EVENTS)
/settings               → 設定儀表板 (VIEW_SETTINGS)
/settings/dictionary    → 字典管理 (VIEW_SETTINGS)
/settings/webhooks      → Webhook 管理 (MANAGE_SETTINGS)
/settings/permissions   → 權限管理 (MANAGE_SETTINGS)
/audit                  → 稽核列表 (VIEW_AUDIT_TRAIL)
/audit/:id              → 稽核詳情 (VIEW_AUDIT_TRAIL)
/unauthorized           → 未授權頁面
```

## 權限列表

```typescript
enum Permission {
  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',

  // User Management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',

  // Approval System
  CREATE_APPROVAL = 'create_approval',
  VIEW_APPROVALS = 'view_approvals',
  APPROVE_REQUESTS = 'approve_requests',
  DUAL_CONTROL_APPROVAL = 'dual_control_approval',

  // Feature Flags
  MANAGE_FLAGS = 'manage_flags',
  VIEW_FLAGS = 'view_flags',
  PUBLISH_FLAGS = 'publish_flags',

  // Events
  VIEW_EVENTS = 'view_events',
  MANAGE_EVENTS = 'manage_events',

  // Settings
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_SETTINGS = 'view_settings',

  // Audit
  VIEW_AUDIT_TRAIL = 'view_audit_trail',
  EXPORT_AUDIT_LOGS = 'export_audit_logs',
}
```

## 開發指南

### 環境要求

```bash
# Node.js 版本
node -v  # 需要 20.19+ 或 22.12+

# 設定 Node.js 路徑（使用 Homebrew）
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

### 安裝依賴

```bash
# 使用 pnpm
pnpm install
```

### 開發伺服器

```bash
# 啟動開發伺服器
pnpm start

# 應用程式將在 http://localhost:4200/ 運行
```

### 建置專案

```bash
# 生產環境建置
pnpm build

# 建置檔案將輸出到 dist/ 目錄
```

### 執行測試

```bash
# 單元測試
pnpm test

# E2E 測試
pnpm e2e

# Linting
pnpm lint
```

## 最佳實踐

### 1. 元件開發

- 使用 Standalone Components
- 依賴注入使用 `inject()`
- 狀態管理使用 Signals
- 避免使用 `ngOnInit` 進行複雜邏輯

### 2. 權限檢查

- 路由層級使用 `RequirePermGuard`
- UI 層級使用 `*hasPerm` 或 `*hasRole`
- 程式碼層級使用 `PermissionService`

### 3. 表單處理

- 使用 `TypedFormService` 建立表單
- 啟用草稿自動保存
- 實現交叉驗證
- 處理條件欄位顯示

### 4. 狀態管理

- 使用對應的 Store 服務
- 避免直接修改狀態
- 使用計算屬性衍生狀態
- 適當使用篩選與分頁

### 5. API 呼叫

- 使用 `sdk` 客戶端
- 處理載入與錯誤狀態
- 實現重試機制
- 快取常用資料

## 部署

### 環境變數

```typescript
// src/environments/environment.ts (開發環境)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  websocketUrl: 'ws://localhost:3000/ws',
};

// src/environments/environment.prod.ts (生產環境)
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
  websocketUrl: 'wss://api.yourdomain.com/ws',
};
```

### 建置與部署

```bash
# 生產環境建置
pnpm build

# 部署到靜態主機 (如 Nginx, Apache)
cp -r dist/* /var/www/html/

# 或部署到 CDN (如 AWS S3, Cloudflare Pages)
aws s3 sync dist/ s3://your-bucket-name/
```

## 維護與監控

### 日誌

使用 `LoggerService` 記錄重要操作：

```typescript
this.logger.info('User logged in', { userId: user.id });
this.logger.error('API call failed', error);
```

### 效能監控

- 使用 Angular DevTools 監控元件效能
- 追蹤 Signals 更新頻率
- 監控 API 呼叫時間
- 檢查記憶體洩漏

### 安全性

- 所有 API 呼叫需要認證 token
- 實施 CSRF 保護
- 定期更新依賴套件
- 使用 Content Security Policy (CSP)

## 故障排除

### 常見問題

1. **編譯錯誤**: 確保 Node.js 版本正確 (20.19+)
2. **權限錯誤**: 檢查 `PermissionService` 是否正確設定
3. **SSE 連線失敗**: 確認後端 SSE 端點可用
4. **表單草稿遺失**: 檢查 IndexedDB 配額

### 除錯模式

```typescript
// 啟用除錯日誌
localStorage.setItem('debug', 'true');

// 檢視當前權限
console.log(this.permissionService.getAllPermissions());

// 檢視狀態
console.log(this.store.approvals());
```

## 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權

本專案使用 MIT 授權。

## 聯絡方式

如有問題或建議，請開 Issue 或聯絡專案維護者。
