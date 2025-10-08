# AlloyLab Angular Platform - 實現指南

## 🎯 已實現功能清單

### ✅ 1. 共用型別與 SDK (@alloylab/types, @alloylab/sdk)

**檔案位置**: `src/shared/sdk/`

- ✅ `types.ts` - 由 OpenAPI 產生的型別定義
- ✅ `client.ts` - 統一的 SDK 客戶端
- ✅ `index.ts` - 匯出檔案

**特點**:

- 與 React 主線共用型別定義
- 薄服務層包裝（便於攔截/快取/重試）
- 支援所有主要 API（auth, approvals, flags, events, audit, settings）

### ✅ 2. 嚴謹 RBAC 系統

**檔案位置**: `src/app/core/auth/` 和 `src/app/shared/directives/`

- ✅ `permission.service.ts` - 權限管理服務
  - 權限快取（15 分鐘失效）
  - 支援 `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`
  - 支援角色檢查 `hasRole()`, `hasAnyRole()`
- ✅ `require-perm.guard.ts` - 路由守衛
  - 使用 `CanMatch` 讀取 `data.requirePerm`
  - 自動檢查權限並拒絕未授權訪問
- ✅ `has-perm.directive.ts` - 權限指令
  - 結構型指令：`*hasPerm="[Permission.CREATE_APPROVAL]"`
  - 控制 UI 元素顯示/隱藏
- ✅ `has-role.directive.ts` - 角色指令
  - 結構型指令：`*hasRole="[UserRole.ADMIN]"`
  - 基於角色控制 UI

**使用範例**:

```typescript
// 路由守衛
{
  path: 'approvals',
  canMatch: [RequirePermGuard],
  data: { requirePerm: [Permission.VIEW_APPROVALS] }
}

// UI 控制
<button *hasPerm="[Permission.CREATE_APPROVAL]">新增</button>
<div *hasRole="[UserRole.ADMIN, UserRole.MANAGER]">管理</div>
```

### ✅ 3. Typed Forms + Signals

**檔案位置**: `src/app/shared/forms/`

- ✅ `typed-form.service.ts` - 表單服務
  - Schema-driven 表單生成
  - 交叉驗證支援
  - 條件欄位邏輯
  - 動態表單陣列
- ✅ `draft.service.ts` - 草稿管理
  - 本地 IndexedDB 保存
  - 自動保存功能（30 秒間隔）
  - 版本管理
  - 草稿統計

**使用範例**:

```typescript
// 建立表單
const form = this.typedFormService.createForm(fields, initialValues);

// 套用條件邏輯
this.typedFormService.applyConditionalLogic(form, 'amount', {
  field: 'requestType',
  operator: 'equals',
  value: 'budget',
  action: 'enable',
});

// 自動保存
const cleanup = this.draftService.autoSave('approval-form', form);
```

### ✅ 4. Dual-control 審批流程

**檔案位置**: `src/app/features/approvals/services/dual-control.service.ts`

- ✅ 高風險操作識別
  - 類型檢查：`budget`, `purchase`
  - 金額閾值：>= $10,000
- ✅ 雙重批准驗證
  - 需要兩個獨立批准者
  - 批准者不能審批自己的請求
  - 批准者不能重複審批同一請求
- ✅ 審批進度追蹤
  - 當前批准數 / 所需批准數
  - 進度百分比計算
  - 狀態文字提示
- ✅ 審批軌跡記錄
  - 整合稽核系統
  - 記錄每個審批動作

**判斷邏輯**:

```typescript
// 自動判斷是否需要 Dual-control
const isDualControl = this.dualControlService.requiresDualControl(request);

// 檢查使用者是否可以審批
const { canApprove, reason } = this.dualControlService.canApprove(request);

// 取得審批進度
const progress = this.dualControlService.getApprovalProgress(request);
// 輸出: { current: 1, required: 2, percentage: 50 }
```

### ✅ 5. Signal Store 狀態管理

**檔案位置**: `src/app/store/`

- ✅ `app.store.ts` - 全域狀態
- ✅ `approvals.store.ts` - 審批狀態管理
  - CRUD 操作
  - 篩選與分頁
  - 計算屬性（pending, approved, rejected, highPriority）
- ✅ `flags.store.ts` - 旗標狀態管理
  - CRUD 操作
  - 發佈/封存功能
  - 計算屬性（published, draft, enabled, disabled）
- ✅ `events.store.ts` - 事件狀態管理
  - 篩選與分頁
  - 計算屬性（critical, highSeverity, recent）

**使用範例**:

```typescript
// 注入 store
store = inject(ApprovalsStore);

// 載入資料
await this.store.fetchApprovals();

// 讀取狀態
const pending = this.store.pendingApprovals();
const loading = this.store.loading();

// 篩選
this.store.setFilters({ status: ['pending'], priority: ['high'] });
```

### ✅ 6. 即時事件監控 (SSE)

**檔案位置**: `src/app/core/events/events-sse.service.ts`

- ✅ SSE 連線管理
  - 自動重連機制（5 秒延遲）
  - 連線狀態追蹤
- ✅ Ring Buffer (2000 筆事件)
  - 避免記憶體無限增長
  - 保持最近的事件
- ✅ 事件過濾與搜尋
  - 依類型、嚴重度、來源過濾
  - 時間範圍篩選
  - 全文搜尋
- ✅ 匯出功能
  - JSON 格式
  - CSV 格式

**使用範例**:

```typescript
// 啟動串流
this.eventsSse.start('http://localhost:3000/api/events/stream');

// 即時讀取
const events = this.eventsSse.recentEvents();
const critical = this.eventsSse.criticalEvents();

// 停止串流
this.eventsSse.stop();
```

### ✅ 7. 稽核軌跡系統

**檔案位置**: `src/app/features/audit/`

- ✅ 稽核記錄列表元件
  - 多維度篩選（使用者、操作、資源、時間）
  - 統計儀表板
  - 匯出功能
- ✅ 操作記錄
  - 完整的使用者操作追蹤
  - IP 地址與 User Agent
  - 變更記錄（oldValue/newValue）

### ✅ 8. Mock Backend 服務

**檔案位置**: `src/app/core/mock/mock-backend.service.ts`

- ✅ 完整的假資料
  - 使用者資料（admin, manager, employee）
  - 審批請求（4 筆範例）
  - 功能旗標（4 筆範例）
  - 事件記錄
  - 稽核記錄
- ✅ 模擬 SSE 串流
  - 隨機產生事件
  - 可設定間隔時間

### ✅ 9. 單元測試

**檔案位置**:

- `src/app/core/auth/permission.service.spec.ts`
- `src/app/store/approvals.store.spec.ts`
- `src/app/testing/test-helpers.ts`

**測試覆蓋**:

- PermissionService 完整測試
- ApprovalsStore 狀態管理測試
- 測試工具函數

### ✅ 10. E2E 測試

**檔案位置**:

- `e2e/approvals.spec.ts`
- `playwright.config.ts`

**測試場景**:

- 審批列表顯示
- 篩選功能
- 建立新審批
- 批准/拒絕流程
- Dual-control 驗證
- 搜尋功能
- 分頁功能
- 匯出功能

### ✅ 11. 效能優化

**實現元件**:

- ✅ `virtual-scroll.component.ts` - 虛擬卷動
  - 只渲染可見區域
  - 緩衝區管理
  - 支援大型列表（10,000+ 項目）
- ✅ `data-grid.component.ts` - 進階資料表格
  - 整合虛擬卷動
  - 多選支援
  - 排序功能
- ✅ `lazy-image.directive.ts` - 延遲載入圖片
  - Intersection Observer
  - 預載佔位符
  - 錯誤處理
- ✅ `debounce.directive.ts` - 防抖動指令
  - 優化輸入事件
  - 可設定延遲時間

**使用範例**:

```typescript
// 虛擬卷動
<app-virtual-scroll
  [items]="largeDataset"
  [itemHeight]="50"
  [bufferSize]="5"
></app-virtual-scroll>

// 延遲載入圖片
<img [appLazyImage]="imageUrl" placeholder="loading.svg" />

// 防抖動
<input appDebounce [debounceTime]="500" (debounced)="onSearch($event)" />
```

### ✅ 12. UI/UX 增強

**實現元件**:

- ✅ `toast.component.ts` & `toast.service.ts` - 通知系統
  - 成功/錯誤/警告/資訊通知
  - 自動消失（可設定時間）
  - 動畫效果
- ✅ `modal.component.ts` - 對話框元件
  - 多種尺寸（sm, md, lg, xl）
  - 動畫進出
  - 鍵盤導航支援
- ✅ `spinner.component.ts` - 載入動畫
  - 多種樣式（primary, success, danger）
  - 多種尺寸（sm, md, lg）
- ✅ `skip-link.component.ts` - 無障礙跳轉連結
  - 鍵盤使用者友善
  - WCAG 2.1 符合性

**全域樣式增強** (`src/styles.css`):

- ✅ 無障礙支援
  - Screen reader only 類別
  - Focus visible 樣式
  - 高對比度模式支援
- ✅ 動畫系統
  - fadeIn, slideIn, pulse 動畫
  - 尊重使用者的減少動畫偏好
- ✅ 狀態徽章樣式
  - 審批狀態
  - 優先級
  - 旗標狀態
- ✅ 載入狀態
  - Skeleton 載入動畫
  - 自訂捲軸樣式
- ✅ 列印樣式
  - 隱藏不必要元素
  - 顯示連結 URL

**使用範例**:

```typescript
// Toast 通知
toastService.success('操作成功', '審批請求已建立');
toastService.error('操作失敗', '權限不足');

// Modal 對話框
modal.open();

// 載入動畫
<app-spinner size="lg" variant="primary" message="載入中..."></app-spinner>;
```

## 📂 完整檔案清單

### 核心服務

```
src/app/core/
├── auth/
│   ├── auth.service.ts               ✅ 認證服務
│   ├── permission.service.ts         ✅ 權限管理
│   ├── permission.service.spec.ts    ✅ 單元測試
│   └── require-perm.guard.ts         ✅ 路由守衛
├── http/
│   └── api.service.ts                ✅ HTTP 客戶端
├── interceptors/
│   ├── auth.interceptor.ts           ✅ 認證攔截器
│   └── error.interceptor.ts          ✅ 錯誤攔截器
├── logger/
│   └── logger.service.ts             ✅ 日誌服務
├── events/
│   └── events-sse.service.ts         ✅ SSE 事件服務
└── mock/
    └── mock-backend.service.ts       ✅ 假後端服務
```

### 共用元件

```
src/app/shared/
├── ui/
│   ├── button/
│   │   └── button.component.ts       ✅ 按鈕元件
│   ├── table/
│   │   └── table.component.ts        ✅ 表格元件
│   ├── virtual-scroll/
│   │   └── virtual-scroll.component.ts ✅ 虛擬卷動
│   ├── data-grid/
│   │   └── data-grid.component.ts    ✅ 進階資料表格
│   ├── spinner/
│   │   └── spinner.component.ts      ✅ 載入動畫
│   ├── toast/
│   │   ├── toast.component.ts        ✅ Toast 元件
│   │   └── toast.service.ts          ✅ Toast 服務
│   ├── modal/
│   │   └── modal.component.ts        ✅ Modal 元件
│   └── skip-link/
│       └── skip-link.component.ts    ✅ 跳轉連結
├── pipes/
│   ├── date-format.pipe.ts           ✅ 日期格式化
│   └── status-badge.pipe.ts          ✅ 狀態徽章
├── validators/
│   └── custom.validators.ts          ✅ 自訂驗證器
├── directives/
│   ├── has-perm.directive.ts         ✅ 權限指令
│   ├── has-role.directive.ts         ✅ 角色指令
│   ├── debounce.directive.ts         ✅ 防抖動指令
│   └── index.ts
└── forms/
    ├── typed-form.service.ts         ✅ 表單服務
    └── draft.service.ts              ✅ 草稿服務
```

### 狀態管理

```
src/app/store/
├── app.store.ts                      ✅ 全域狀態
├── approvals.store.ts                ✅ 審批狀態
├── approvals.store.spec.ts           ✅ 單元測試
├── flags.store.ts                    ✅ 旗標狀態
├── events.store.ts                   ✅ 事件狀態
└── index.ts
```

### 功能模組

```
src/app/features/
├── dashboard/
│   ├── dashboard.component.ts        ✅ 儀表板
│   └── index.ts
├── approvals/
│   ├── approvals-list/
│   │   └── approvals-list.component.ts ✅ 審批列表
│   ├── services/
│   │   └── dual-control.service.ts   ✅ Dual-control 服務
│   └── approvals.routes.ts           ✅ 路由
├── flags/
│   ├── flags-list/
│   │   └── flags-list.component.ts   ✅ 旗標列表
│   └── flags.routes.ts               ✅ 路由
├── events/
│   ├── events-monitor/
│   │   └── events-monitor.component.ts ✅ 事件監控
│   └── events.routes.ts              ✅ 路由
├── settings/
│   └── settings.routes.ts            ✅ 路由
└── audit/
    ├── audit-list/
    │   └── audit-list.component.ts   ✅ 稽核列表
    └── audit.routes.ts               ✅ 路由
```

### 測試

```
src/app/testing/
└── test-helpers.ts                   ✅ 測試工具

e2e/
└── approvals.spec.ts                 ✅ E2E 測試

playwright.config.ts                  ✅ Playwright 設定
karma.conf.js                         ✅ Karma 設定
```

### 共用 SDK

```
src/shared/sdk/
├── types.ts                          ✅ 型別定義
├── client.ts                         ✅ SDK 客戶端
└── index.ts
```

## 🧪 測試指南

### 單元測試

```bash
# 執行所有測試
pnpm test

# Watch 模式
pnpm test:watch

# 產生覆蓋率報告
pnpm test:coverage
```

**覆蓋率目標**:

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

### E2E 測試

```bash
# 執行所有 E2E 測試
pnpm e2e

# UI 模式（互動式）
pnpm e2e:ui

# Debug 模式
pnpm e2e:debug
```

**測試瀏覽器**:

- Desktop: Chrome, Firefox, Safari
- Mobile: Pixel 5, iPhone 12

## ⚡ 效能優化策略

### 1. 虛擬卷動

- 使用 `VirtualScrollComponent` 或 `DataGridComponent`
- 適用於 1,000+ 筆資料
- 減少 DOM 節點數量

### 2. 懶加載

- 圖片使用 `appLazyImage` directive
- 路由使用 `loadChildren`
- 預載策略：`PreloadAllModules`

### 3. Change Detection 優化

- 使用 `OnPush` 策略（在需要的元件）
- Signals 自動優化變更偵測
- 避免在模板中使用函數呼叫

### 4. 防抖動與節流

- 搜尋輸入使用 `appDebounce`
- API 呼叫快取
- 草稿自動保存節流

## ♿ 無障礙支援

### ARIA 屬性

- 所有互動元素有適當的 `aria-label`
- Modal 使用 `role="dialog"`, `aria-modal="true"`
- 表格使用語意化 HTML

### 鍵盤導航

- ✅ Tab 鍵導航
- ✅ Enter/Space 觸發按鈕
- ✅ Escape 關閉 Modal
- ✅ Skip Link 快速跳轉

### 視覺支援

- ✅ Focus visible 樣式
- ✅ 高對比度模式
- ✅ 尊重減少動畫偏好
- ✅ Screen reader only 類別

## 🎨 動畫系統

### 全域動畫

```css
.fade-in    /* 淡入 */
/* 淡入 */
.slide-in; /* 滑入 */
```

### 元件動畫

- Toast: 滑入/滑出
- Modal: 縮放進入/退出
- Spinner: 旋轉動畫
- Loading: Skeleton 動畫

### 尊重使用者偏好

```css
@media (prefers-reduced-motion: reduce) {
  /* 所有動畫減速至幾乎靜止 */
}
```

## 🚀 下一步開發建議

### Phase 1: 完善功能元件

1. ✅ Approvals List
2. ⏳ Approval Form
3. ⏳ Approval Detail
4. ✅ Flags List
5. ⏳ Flag Form
6. ⏳ Flag Detail
7. ⏳ Flag Compare
8. ✅ Events Monitor
9. ⏳ Event Detail
10. ⏳ Settings Dashboard
11. ✅ Audit List
12. ⏳ Audit Detail

### Phase 2: 後端整合

1. 替換 Mock 資料為真實 API
2. 實現 SSE 後端端點
3. 實現 WebSocket 作為 SSE 備援
4. 整合稽核記錄到資料庫

### Phase 3: 增強測試

1. 增加元件測試覆蓋率至 >80%
2. 增加更多 E2E 測試場景
3. 建立效能測試
4. 建立視覺回歸測試

### Phase 4: 生產準備

1. 環境變數設定
2. CI/CD 管道
3. Docker 容器化
4. 監控與錯誤追蹤

## 📊 技術指標

### 效能指標（目標）

- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

### Bundle 大小（預估）

- Initial Bundle: ~150-200 KB (gzipped)
- Lazy Chunks: ~20-50 KB each

### 測試覆蓋率

- Unit Tests: 目標 80%+
- E2E Tests: 主要用戶流程 100%

## 🔧 故障排除

### 常見問題

**Q: 編譯錯誤 - 找不到模組**

```bash
# 重新安裝依賴
pnpm install

# 清除快取
rm -rf node_modules/.cache
pnpm build
```

**Q: 權限檢查失效**

```typescript
// 檢查權限是否正確載入
console.log(this.permissionService.getAllPermissions());

// 檢查快取是否過期
console.log(this.permissionService.isCacheExpired());
```

**Q: SSE 連線失敗**

```typescript
// 檢查連線狀態
console.log(this.eventsSse.isConnected());

// 手動重連
this.eventsSse.reconnect(url);
```

**Q: 測試失敗**

```bash
# 清除測試快取
pnpm test -- --no-cache

# 以 debug 模式執行
pnpm test -- --browsers=ChromeDebug
```

## 📝 程式碼風格

使用 Prettier 格式化：

```bash
# 格式化所有檔案
pnpm exec prettier --write "src/**/*.{ts,html,css}"
```

設定已包含在 `package.json`:

```json
{
  "prettier": {
    "printWidth": 100,
    "singleQuote": true
  }
}
```

## 🎓 學習資源

### Angular Signals

- [Official Signals Guide](https://angular.dev/guide/signals)
- [Signal-based Components](https://angular.dev/guide/components)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Advanced Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html)

### Accessibility

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Angular A11y Guide](https://angular.dev/best-practices/a11y)

### Testing

- [Jasmine Documentation](https://jasmine.github.io/)
- [Playwright Documentation](https://playwright.dev/)

## 🤝 貢獻

本專案歡迎貢獻！請確保：

1. 所有測試通過
2. 程式碼覆蓋率維持在 80% 以上
3. 遵循 Angular 風格指南
4. 更新相關文檔

## 📄 授權

MIT License
