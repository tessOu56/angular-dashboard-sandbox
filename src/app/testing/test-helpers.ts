import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

/**
 * Testing Helper Functions
 *
 * 提供常用的測試工具函數
 */

/**
 * 查找元素
 */
export function findByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement {
  return fixture.debugElement.query(By.css(selector));
}

export function findAllByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement[] {
  return fixture.debugElement.queryAll(By.css(selector));
}

/**
 * 取得元素文字內容
 */
export function getTextContent<T>(fixture: ComponentFixture<T>, selector: string): string {
  const element = findByCss(fixture, selector);
  return element?.nativeElement.textContent.trim() || '';
}

/**
 * 點擊元素
 */
export function clickElement<T>(fixture: ComponentFixture<T>, selector: string): void {
  const element = findByCss(fixture, selector);
  if (element) {
    element.nativeElement.click();
    fixture.detectChanges();
  }
}

/**
 * 設定輸入值
 */
export function setInputValue<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  value: string
): void {
  const input = findByCss(fixture, selector);
  if (input) {
    input.nativeElement.value = value;
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }
}

/**
 * 等待條件
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 50
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

/**
 * 建立 Mock 使用者
 */
export function createMockUser(overrides: any = {}) {
  return {
    id: '1',
    username: 'test-user',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    department: 'IT',
    isActive: true,
    permissions: ['*'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * 建立 Mock 審批請求
 */
export function createMockApproval(overrides: any = {}) {
  return {
    id: '1',
    title: 'Test Approval',
    description: 'Test Description',
    requestType: 'expense',
    requesterId: '1',
    requesterName: 'Test User',
    department: 'IT',
    amount: 1000,
    priority: 'medium',
    status: 'pending',
    approvals: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * 建立 Mock 旗標
 */
export function createMockFlag(overrides: any = {}) {
  return {
    id: '1',
    name: 'Test Flag',
    key: 'test-flag',
    description: 'Test Description',
    type: 'boolean',
    status: 'published',
    defaultValue: false,
    isEnabled: true,
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    ...overrides,
  };
}

/**
 * 建立 Mock 事件
 */
export function createMockEvent(overrides: any = {}) {
  return {
    id: '1',
    type: 'user_login',
    timestamp: new Date().toISOString(),
    userId: '1',
    username: 'test-user',
    details: {},
    severity: 'low',
    source: 'test-service',
    ...overrides,
  };
}

/**
 * 建立 Mock 稽核記錄
 */
export function createMockAuditLog(overrides: any = {}) {
  return {
    id: '1',
    timestamp: new Date().toISOString(),
    userId: '1',
    username: 'test-user',
    action: 'create',
    resourceType: 'approval_request',
    resourceId: '1',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    ...overrides,
  };
}
