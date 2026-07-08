# Angular Dashboard Sandbox

> 大型企業內部管理專業後台系統 - 展示企業級 Angular 架構、RBAC 權限控制、Dual-control 審批流程、即時事件監控與完整稽核軌跡

[![Angular](https://img.shields.io/badge/Angular-20.3.0-red.svg)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0.0-orange.svg)](https://pnpm.io/)

## 🎯 專案簡介

這是一個模擬大型企業內部管理系統的專業後台應用程式，展示了現代 Angular 開發的最佳實踐和企業級功能實現。

> **與 nx-playground 的關係**：本 repo 是 [`nx-playground`](https://github.com/tessOu56/nx-playground) monorepo 中 `apps/enterprise-admin` 的獨立部署版本（standalone extract），兩者程式碼同源。評估作品時請以 monorepo 為主體，本 repo 用於獨立展示與部署。

### 核心特色

- **🔐 企業級權限控制 (RBAC)** - 完整的角色權限管理系統，含路由守衛、UI 層級權限控制
- **✅ Dual-control 審批流程** - 高風險操作雙重審批機制，符合金融監管要求
- **📝 動態表單系統** - Schema-driven 表單生成、交叉驗證、自動保存草稿
- **⚡ 即時事件監控** - SSE 串流 + Ring Buffer 架構，處理大量即時事件
- **📊 完整稽核軌跡** - 記錄所有操作、支援多維度查詢與匯出
- **🚀 效能優化** - 虛擬卷動、懶加載路由、智能快取策略
- **🎨 專業 UI/UX** - 現代化界面設計、動畫效果、完整無障礙支援 (WCAG 2.1)
- **🔄 Signal Store** - 使用 Angular Signals 實現響應式狀態管理

## 📋 環境要求

- **Node.js**: 20.19+ 或 22.12+
- **pnpm**: 9.0.0+
- **瀏覽器**: 支援 ES2022 的現代瀏覽器

## 🚀 快速開始

### 安裝依賴

```bash
# 使用 pnpm
pnpm install
```

### 開發伺服器

```bash
# 設定 Node.js 路徑（macOS with Homebrew）
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

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

## 🧪 測試

### 單元測試

```bash
# 執行所有測試
pnpm test

# Watch 模式
pnpm test:watch

# 產生覆蓋率報告
pnpm test:coverage
```

### E2E 測試

```bash
# 執行所有 E2E 測試
pnpm e2e

# UI 模式（互動式）
pnpm e2e:ui

# Debug 模式
pnpm e2e:debug
```

## 📚 專案文檔

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 架構設計與核心功能說明
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - 實現細節與開發指南

## 🏗️ 專案架構

```
src/
├── shared/sdk/          # @alloylab/types & @alloylab/sdk
├── app/
│   ├── core/           # 核心服務（auth, http, logger, events, mock）
│   ├── shared/         # 共用元件（UI, pipes, validators, directives, forms）
│   ├── store/          # Signal Store 狀態管理
│   ├── features/       # 功能模組
│   │   ├── dashboard/  # 儀表板
│   │   ├── approvals/  # 審批中心（含 Dual-control）
│   │   ├── flags/      # 旗標管理
│   │   ├── events/     # 事件監控（SSE）
│   │   ├── settings/   # 平台設定
│   │   └── audit/      # 稽核瀏覽
│   └── testing/        # 測試工具
└── environments/       # 環境配置
```

## 🔑 登入帳號（開發用）

| 使用者名稱 | 密碼     | 角色     | 權限           |
| ---------- | -------- | -------- | -------------- |
| admin      | admin    | Admin    | 所有權限（\*） |
| manager    | manager  | Manager  | 管理與審批     |
| employee   | employee | Operator | 基本操作       |

## 🌟 核心功能

### 1. RBAC 權限控制

```typescript
// 路由守衛
{
  path: 'approvals',
  canMatch: [RequirePermGuard],
  data: { requirePerm: [Permission.VIEW_APPROVALS] }
}

// UI 控制
<button *hasPerm="[Permission.CREATE_APPROVAL]">新增審批</button>
<div *hasRole="[UserRole.ADMIN, UserRole.MANAGER]">管理功能</div>
```

### 2. Dual-control 審批

```typescript
// 自動判斷高風險操作
const isDualControl = dualControlService.requiresDualControl(request);

// 檢查審批權限
const { canApprove, reason } = dualControlService.canApprove(request);

// 追蹤進度
const progress = dualControlService.getApprovalProgress(request);
// { current: 1, required: 2, percentage: 50 }
```

**觸發條件**:

- 類型為 `budget` 或 `purchase`
- 金額 ≥ $10,000

### 3. 即時事件監控

```typescript
// 啟動 SSE 串流
eventsSse.start('http://localhost:3000/api/events/stream');

// 取得即時事件
const events = eventsSse.recentEvents();
const critical = eventsSse.criticalEvents();

// 停止串流
eventsSse.stop();
```

### 4. Signal Store 狀態管理

```typescript
// 注入 store
store = inject(ApprovalsStore);

// 載入資料
await store.fetchApprovals();

// 使用計算屬性
const pending = store.pendingApprovals();
const highPriority = store.highPriorityApprovals();

// 篩選
store.setFilters({ status: ['pending'], priority: ['high'] });
```

### 5. Typed Forms

```typescript
// 建立表單
const form = typedFormService.createForm(fields, initialValues);

// 套用條件邏輯
typedFormService.applyConditionalLogic(form, 'amount', conditional);

// 自動保存草稿
const cleanup = draftService.autoSave('form-id', form, 30000);
```

## 🎨 UI 元件庫

### 基礎元件

- **Button** - 多樣式按鈕（primary, secondary, success, danger, outline）
- **Table** - 基礎表格（排序、篩選）
- **Spinner** - 載入動畫
- **Toast** - 通知系統
- **Modal** - 對話框

### 進階元件

- **DataGrid** - 進階資料表格（虛擬卷動、多選）
- **VirtualScroll** - 虛擬卷動容器（優化大列表）

### 指令

- **\*hasPerm** - 權限控制
- **\*hasRole** - 角色控制
- **appDebounce** - 防抖動
- **appLazyImage** - 延遲載入圖片

### Pipes

- **dateFormat** - 日期格式化
- **statusBadge** - 狀態徽章

## 📈 效能優化

### 虛擬卷動

```typescript
<app-data-grid
  [data]="largeDataset"
  [height]="600"
  [rowHeight]="50"
  [bufferSize]="5"
></app-data-grid>
```

### 延遲載入

```html
<img [appLazyImage]="imageUrl" placeholder="loading.svg" />
```

### 防抖動

```html
<input appDebounce [debounceTime]="500" (debounced)="onSearch($event)" />
```

## ♿ 無障礙功能

- ✅ WCAG 2.1 Level AA 符合
- ✅ 鍵盤導航支援（Tab, Enter, Escape）
- ✅ Screen reader 友善（ARIA 屬性）
- ✅ 高對比度模式支援
- ✅ 減少動畫偏好（prefers-reduced-motion）
- ✅ Skip Link（快速跳轉主內容）

## 🧪 測試

### 單元測試範例

- `permission.service.spec.ts` - 權限服務測試
- `approvals.store.spec.ts` - 狀態管理測試

### E2E 測試範例

- `e2e/approvals.spec.ts` - 審批流程完整測試

### 測試工具

- `src/app/testing/test-helpers.ts` - 測試輔助函數

## 📖 API 文檔

### SDK 使用方式

```typescript
import { sdk } from '../shared/sdk';

// 審批 API
const approvals = await sdk.approvals.list().toPromise();
const approval = await sdk.approvals.get(id).toPromise();
await sdk.approvals.approve(id, comment).toPromise();

// 旗標 API
const flags = await sdk.flags.list().toPromise();
await sdk.flags.publish(id).toPromise();

// 事件 API
const events = await sdk.events.list().toPromise();

// 稽核 API
const auditLogs = await sdk.audit.list(filters).toPromise();
const csv = await sdk.audit.export().toPromise();
```

## 🔧 開發工具

### 程式碼格式化

```bash
# 使用 Prettier
pnpm exec prettier --write "src/**/*.{ts,html,css}"
```

### Linting

```bash
pnpm lint
```

### 建置分析

```bash
# 分析 bundle 大小
pnpm build --stats-json
pnpm exec webpack-bundle-analyzer dist/angular-dashboard-sandbox/stats.json
```

## 📝 開發規範

### 元件

- 使用 Standalone Components
- 依賴注入使用 `inject()`
- 狀態使用 Signals
- 遵循 Single Responsibility Principle

### 服務

- 使用 `@Injectable({ providedIn: 'root' })`
- 避免服務間循環依賴
- 適當使用 RxJS operators

### 測試

- 單元測試覆蓋率 ≥ 80%
- 所有公開 API 需要測試
- 使用 Mock 資料

## 🗺️ 路由結構

```
/                       → 重導向到 /dashboard
/login                  → 登入頁面
/dashboard              → 儀表板
/approvals              → 審批列表
/approvals/new          → 新增審批
/approvals/:id          → 審批詳情
/flags                  → 旗標列表
/flags/new              → 新增旗標
/flags/:id              → 旗標詳情
/flags/:id/compare      → 旗標比較
/events                 → 事件監控
/events/:id             → 事件詳情
/settings               → 平台設定
/settings/dictionary    → 字典管理
/settings/webhooks      → Webhook 管理
/settings/permissions   → 權限管理
/audit                  → 稽核列表
/audit/:id              → 稽核詳情
/unauthorized           → 未授權頁面
```

## 📊 專案狀態

### 已完成 ✅

- [x] 專案架構重構
- [x] 共用型別與 SDK
- [x] RBAC 權限系統
- [x] Typed Forms 與草稿系統
- [x] Dual-control 審批
- [x] Signal Store 狀態管理
- [x] 即時事件監控（SSE）
- [x] 稽核軌跡系統
- [x] Mock Backend 服務
- [x] 單元測試框架
- [x] E2E 測試框架
- [x] 效能優化（虛擬卷動、懶加載）
- [x] UI/UX 增強（動畫、Toast、Modal）
- [x] 無障礙支援

### 待開發 ⏳

- [ ] 完整的功能頁面（Form, Detail 等）
- [ ] 後端 API 整合
- [ ] 更多測試案例
- [ ] 效能監控整合
- [ ] 部署設定

## 📚 詳細文檔

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 完整架構設計文檔
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - 實現細節與開發指南

## 🤝 貢獻

歡迎貢獻！請確保：

1. 所有測試通過
2. 程式碼覆蓋率 ≥ 80%
3. 遵循 Angular 風格指南
4. 更新相關文檔

## 📄 授權

MIT License

## 🔗 相關資源

- [Angular Documentation](https://angular.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [RxJS Documentation](https://rxjs.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
