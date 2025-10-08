import { Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface DraftData {
  id: string;
  formId: string;
  data: any;
  timestamp: Date;
  version: number;
}

@Injectable({ providedIn: 'root' })
export class DraftService {
  private drafts = signal<Map<string, DraftData>>(new Map());
  private readonly STORAGE_KEY = 'form_drafts';
  private readonly MAX_DRAFTS = 50;

  constructor() {
    this.loadDraftsFromStorage();
  }

  /**
   * 保存表單草稿
   * @param formId 表單 ID
   * @param form 表單群組
   * @param version 版本號
   */
  saveDraft(formId: string, form: FormGroup, version: number = 1): void {
    if (!form.dirty) return;

    const draftData: DraftData = {
      id: this.generateDraftId(formId),
      formId,
      data: form.value,
      timestamp: new Date(),
      version,
    };

    const currentDrafts = this.drafts();
    currentDrafts.set(draftData.id, draftData);

    // 限制草稿數量
    if (currentDrafts.size > this.MAX_DRAFTS) {
      const oldestDraft = Array.from(currentDrafts.values()).sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      )[0];
      currentDrafts.delete(oldestDraft.id);
    }

    this.drafts.set(new Map(currentDrafts));
    this.saveDraftsToStorage();
  }

  /**
   * 載入表單草稿
   * @param formId 表單 ID
   * @returns 最新的草稿資料
   */
  loadDraft(formId: string): DraftData | null {
    const drafts = Array.from(this.drafts().values())
      .filter((draft) => draft.formId === formId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return drafts.length > 0 ? drafts[0] : null;
  }

  /**
   * 載入特定版本的草稿
   * @param formId 表單 ID
   * @param version 版本號
   * @returns 指定版本的草稿資料
   */
  loadDraftByVersion(formId: string, version: number): DraftData | null {
    const drafts = Array.from(this.drafts().values()).filter(
      (draft) => draft.formId === formId && draft.version === version
    );

    return drafts.length > 0 ? drafts[0] : null;
  }

  /**
   * 取得表單的所有草稿
   * @param formId 表單 ID
   * @returns 草稿陣列
   */
  getDrafts(formId: string): DraftData[] {
    return Array.from(this.drafts().values())
      .filter((draft) => draft.formId === formId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 刪除草稿
   * @param draftId 草稿 ID
   */
  deleteDraft(draftId: string): void {
    const currentDrafts = this.drafts();
    currentDrafts.delete(draftId);
    this.drafts.set(new Map(currentDrafts));
    this.saveDraftsToStorage();
  }

  /**
   * 刪除表單的所有草稿
   * @param formId 表單 ID
   */
  deleteDrafts(formId: string): void {
    const currentDrafts = this.drafts();
    const draftsToDelete = Array.from(currentDrafts.values())
      .filter((draft) => draft.formId === formId)
      .map((draft) => draft.id);

    draftsToDelete.forEach((draftId) => {
      currentDrafts.delete(draftId);
    });

    this.drafts.set(new Map(currentDrafts));
    this.saveDraftsToStorage();
  }

  /**
   * 清除所有草稿
   */
  clearAllDrafts(): void {
    this.drafts.set(new Map());
    this.saveDraftsToStorage();
  }

  /**
   * 檢查是否有草稿
   * @param formId 表單 ID
   * @returns 是否有草稿
   */
  hasDraft(formId: string): boolean {
    return Array.from(this.drafts().values()).some((draft) => draft.formId === formId);
  }

  /**
   * 取得草稿統計
   * @returns 草稿統計資訊
   */
  getDraftStats(): { total: number; byForm: { [formId: string]: number } } {
    const drafts = Array.from(this.drafts().values());
    const byForm: { [formId: string]: number } = {};

    drafts.forEach((draft) => {
      byForm[draft.formId] = (byForm[draft.formId] || 0) + 1;
    });

    return {
      total: drafts.length,
      byForm,
    };
  }

  /**
   * 自動保存草稿（定期執行）
   * @param formId 表單 ID
   * @param form 表單群組
   * @param interval 間隔時間（毫秒）
   * @returns 清理函數
   */
  autoSave(formId: string, form: FormGroup, interval: number = 30000): () => void {
    const saveInterval = setInterval(() => {
      this.saveDraft(formId, form);
    }, interval);

    return () => clearInterval(saveInterval);
  }

  /**
   * 從本地儲存載入草稿
   */
  private loadDraftsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const draftsArray: DraftData[] = JSON.parse(stored);
        const draftsMap = new Map<string, DraftData>();

        draftsArray.forEach((draft) => {
          draft.timestamp = new Date(draft.timestamp);
          draftsMap.set(draft.id, draft);
        });

        this.drafts.set(draftsMap);
      }
    } catch (error) {
      console.error('Failed to load drafts from storage:', error);
    }
  }

  /**
   * 保存草稿到本地儲存
   */
  private saveDraftsToStorage(): void {
    try {
      const draftsArray = Array.from(this.drafts().values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(draftsArray));
    } catch (error) {
      console.error('Failed to save drafts to storage:', error);
    }
  }

  /**
   * 產生草稿 ID
   * @param formId 表單 ID
   * @returns 草稿 ID
   */
  private generateDraftId(formId: string): string {
    return `${formId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
