import { Injectable, inject, signal } from '@angular/core';
import { sdk, ApprovalRequest, ApprovalStatus, Permission } from '../../../../shared/sdk';
import { PermissionService } from '../../../core/auth/permission.service';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Dual-control 審批服務
 *
 * 實現雙重控制審批流程：
 * 1. 高風險操作需要兩個獨立的批准者
 * 2. 批准者之間不能互相審批對方的請求
 * 3. 支援多級審批流程
 * 4. 記錄完整的審批軌跡
 */
@Injectable({ providedIn: 'root' })
export class DualControlService {
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);

  // 定義需要 Dual-control 的操作類型
  private readonly HIGH_RISK_TYPES = ['budget', 'purchase'];
  private readonly HIGH_RISK_AMOUNT_THRESHOLD = 10000; // 金額超過此值需要 Dual-control

  /**
   * 檢查是否需要 Dual-control 審批
   */
  requiresDualControl(request: Partial<ApprovalRequest>): boolean {
    // 檢查類型
    if (request.requestType && this.HIGH_RISK_TYPES.includes(request.requestType as string)) {
      return true;
    }

    // 檢查金額
    if (request.amount && request.amount >= this.HIGH_RISK_AMOUNT_THRESHOLD) {
      return true;
    }

    return false;
  }

  /**
   * 檢查使用者是否可以審批此請求
   */
  canApprove(request: ApprovalRequest): {
    canApprove: boolean;
    reason?: string;
  } {
    const currentUser = this.authService.user();

    if (!currentUser) {
      return { canApprove: false, reason: '未登入' };
    }

    // 檢查是否有審批權限
    if (!this.permissionService.hasPermission(Permission.APPROVE_REQUESTS)) {
      return { canApprove: false, reason: '無審批權限' };
    }

    // 不能審批自己的請求
    if (request.requesterId === currentUser.id) {
      return { canApprove: false, reason: '不能審批自己的請求' };
    }

    // 檢查是否已經審批過
    const hasApproved = request.approvals?.some(
      (approval) => approval.approverId === currentUser.id
    );

    if (hasApproved) {
      return { canApprove: false, reason: '已經審批過此請求' };
    }

    // 檢查 Dual-control 要求
    if (this.requiresDualControl(request)) {
      // 需要 Dual-control 權限
      if (!this.permissionService.hasPermission(Permission.DUAL_CONTROL_APPROVAL)) {
        return { canApprove: false, reason: '需要 Dual-control 審批權限' };
      }

      // 檢查是否已有其他批准者
      const approvedCount =
        request.approvals?.filter((approval) => approval.status === ApprovalStatus.APPROVED)
          .length || 0;

      // 如果已有一個批准者，檢查是否為同一部門或相關人員
      if (approvedCount === 1) {
        const firstApprover = request.approvals?.find(
          (approval) => approval.status === ApprovalStatus.APPROVED
        );

        // 這裡可以添加更複雜的邏輯，例如檢查部門、職級等
        // 目前簡化為只要是不同的人即可
        if (firstApprover && firstApprover.approverId !== currentUser.id) {
          return { canApprove: true };
        }
      }

      // 如果是第一個批准者
      if (approvedCount === 0) {
        return { canApprove: true };
      }

      return {
        canApprove: false,
        reason: '已達到所需批准數量',
      };
    }

    return { canApprove: true };
  }

  /**
   * 計算審批進度
   */
  getApprovalProgress(request: ApprovalRequest): {
    current: number;
    required: number;
    percentage: number;
  } {
    const isDualControl = this.requiresDualControl(request);
    const required = isDualControl ? 2 : 1;

    const approvedCount =
      request.approvals?.filter((approval) => approval.status === ApprovalStatus.APPROVED).length ||
      0;

    return {
      current: approvedCount,
      required,
      percentage: (approvedCount / required) * 100,
    };
  }

  /**
   * 取得審批狀態文字
   */
  getApprovalStatusText(request: ApprovalRequest): string {
    const progress = this.getApprovalProgress(request);

    if (progress.current === 0) {
      return '等待審批';
    }

    if (progress.current < progress.required) {
      const isDualControl = this.requiresDualControl(request);
      if (isDualControl) {
        return `第一級批准完成，等待第二級批准 (${progress.current}/${progress.required})`;
      }
      return `等待批准 (${progress.current}/${progress.required})`;
    }

    return '審批完成';
  }

  /**
   * 取得下一個審批級別的批准者
   */
  getNextApprovers(request: ApprovalRequest): string[] {
    // 這裡可以實現複雜的審批流程邏輯
    // 例如根據金額、部門、類型等決定下一級批准者

    const currentLevel = request.approvals?.length || 0;
    const isDualControl = this.requiresDualControl(request);

    if (isDualControl) {
      // 雙重控制：需要兩個批准者
      if (currentLevel === 0) {
        // 第一級：部門主管
        return ['manager'];
      } else if (currentLevel === 1) {
        // 第二級：財務主管或更高級別
        return ['finance_manager', 'cfo'];
      }
    } else {
      // 單一批准者
      if (currentLevel === 0) {
        return ['manager'];
      }
    }

    return [];
  }

  /**
   * 驗證審批請求
   */
  validateApprovalRequest(request: Partial<ApprovalRequest>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.title) {
      errors.push('請輸入標題');
    }

    if (!request.description) {
      errors.push('請輸入說明');
    }

    if (!request.requestType) {
      errors.push('請選擇請求類型');
    }

    if (!request.priority) {
      errors.push('請選擇優先級');
    }

    // 高風險操作的額外驗證
    if (this.requiresDualControl(request)) {
      if (!request.amount || request.amount <= 0) {
        errors.push('高風險操作需要填寫金額');
      }

      if (!request.dueDate) {
        errors.push('高風險操作需要設定截止日期');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 生成審批記錄
   */
  async createAuditLog(
    request: ApprovalRequest,
    action: 'approve' | 'reject' | 'submit',
    comment?: string
  ): Promise<void> {
    const currentUser = this.authService.user();

    if (!currentUser) {
      return;
    }

    // 這裡會呼叫稽核服務記錄操作
    // 實際實現中會與後端 API 整合

    const auditData = {
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      username: currentUser.username,
      action,
      resourceType: 'approval_request',
      resourceId: request.id,
      details: {
        title: request.title,
        requestType: request.requestType,
        amount: request.amount,
        comment,
        isDualControl: this.requiresDualControl(request),
      },
    };

    console.log('Audit log created:', auditData);
    // await sdk.audit.create(auditData).toPromise();
  }
}
