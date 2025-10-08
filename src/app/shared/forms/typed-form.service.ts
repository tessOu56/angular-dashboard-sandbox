import { Injectable, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  AbstractControl,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { FormField, FormFieldType, FormValidation, FormConditional } from '../../../shared/sdk';

@Injectable({ providedIn: 'root' })
export class TypedFormService {
  private fb = inject(FormBuilder);

  /**
   * 根據 schema 建立表單
   * @param fields 表單欄位定義
   * @param initialValues 初始值
   * @returns 建立的表單群組
   */
  createForm(fields: FormField[], initialValues: any = {}): FormGroup {
    const formControls: { [key: string]: AbstractControl } = {};

    fields.forEach((field) => {
      const value =
        initialValues[field.name] ?? field.defaultValue ?? this.getDefaultValue(field.type);
      const validators = this.buildValidators(field.validation);

      formControls[field.name] = new FormControl(value, validators);
    });

    return this.fb.group(formControls);
  }

  /**
   * 建立動態表單陣列
   * @param fields 表單欄位定義
   * @param initialValues 初始值陣列
   * @returns 表單陣列
   */
  createFormArray(fields: FormField[], initialValues: any[] = []): FormArray {
    const formGroups = initialValues.map((values) => this.createForm(fields, values));
    return this.fb.array(formGroups);
  }

  /**
   * 根據條件顯示/隱藏欄位
   * @param form 表單群組
   * @param fieldName 欄位名稱
   * @param conditional 條件設定
   */
  applyConditionalLogic(form: FormGroup, fieldName: string, conditional: FormConditional): void {
    const targetControl = form.get(conditional.field);
    const currentControl = form.get(fieldName);

    if (!targetControl || !currentControl) return;

    const checkCondition = () => {
      const targetValue = targetControl.value;
      const conditionMet = this.evaluateCondition(
        targetValue,
        conditional.operator,
        conditional.value
      );

      switch (conditional.action) {
        case 'show':
        case 'hide':
          // 這裡可以與 UI 層面配合，暫時只處理 enable/disable
          break;
        case 'enable':
          if (conditionMet) {
            currentControl.enable();
          } else {
            currentControl.disable();
          }
          break;
        case 'disable':
          if (conditionMet) {
            currentControl.disable();
          } else {
            currentControl.enable();
          }
          break;
      }
    };

    // 初始檢查
    checkCondition();

    // 監聽目標欄位變化
    targetControl.valueChanges.subscribe(() => {
      checkCondition();
    });
  }

  /**
   * 建立交叉驗證器
   * @param fields 需要交叉驗證的欄位
   * @param validator 驗證函數
   * @returns 驗證器函數
   */
  createCrossValidator(fields: string[], validator: (values: any) => any): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.parent) return null;

      const values: any = {};
      fields.forEach((field) => {
        values[field] = control.parent!.get(field)?.value;
      });

      return validator(values);
    };
  }

  /**
   * 驗證表單並回傳錯誤
   * @param form 表單群組
   * @returns 驗證錯誤物件
   */
  validateForm(form: FormGroup): { [key: string]: any } {
    const errors: { [key: string]: any } = {};

    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });

    return errors;
  }

  /**
   * 取得表單值（包含嵌套物件）
   * @param form 表單群組
   * @returns 表單值
   */
  getFormValue(form: FormGroup): any {
    return form.value;
  }

  /**
   * 設定表單值
   * @param form 表單群組
   * @param value 要設定的值
   */
  setFormValue(form: FormGroup, value: any): void {
    form.patchValue(value);
  }

  /**
   * 重設表單
   * @param form 表單群組
   * @param value 重設值（可選）
   */
  resetForm(form: FormGroup, value?: any): void {
    form.reset(value);
  }

  /**
   * 標記表單為已觸碰
   * @param form 表單群組
   */
  markFormAsTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * 取得欄位預設值
   * @param type 欄位類型
   * @returns 預設值
   */
  private getDefaultValue(type: FormFieldType): any {
    switch (type) {
      case FormFieldType.CHECKBOX:
        return false;
      case FormFieldType.NUMBER:
        return 0;
      case FormFieldType.SELECT:
      case FormFieldType.MULTI_SELECT:
        return [];
      case FormFieldType.JSON:
        return {};
      default:
        return '';
    }
  }

  /**
   * 建立驗證器陣列
   * @param validation 驗證設定
   * @returns 驗證器陣列
   */
  private buildValidators(validation?: FormValidation): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (!validation) return validators;

    if (validation.required) {
      validators.push(Validators.required);
    }

    if (validation.minLength !== undefined) {
      validators.push(Validators.minLength(validation.minLength));
    }

    if (validation.maxLength !== undefined) {
      validators.push(Validators.maxLength(validation.maxLength));
    }

    if (validation.min !== undefined) {
      validators.push(Validators.min(validation.min));
    }

    if (validation.max !== undefined) {
      validators.push(Validators.max(validation.max));
    }

    if (validation.pattern) {
      validators.push(Validators.pattern(validation.pattern));
    }

    return validators;
  }

  /**
   * 評估條件
   * @param targetValue 目標值
   * @param operator 運算子
   * @param conditionValue 條件值
   * @returns 是否滿足條件
   */
  private evaluateCondition(targetValue: any, operator: string, conditionValue: any): boolean {
    switch (operator) {
      case 'equals':
        return targetValue === conditionValue;
      case 'not_equals':
        return targetValue !== conditionValue;
      case 'contains':
        return String(targetValue).includes(String(conditionValue));
      case 'starts_with':
        return String(targetValue).startsWith(String(conditionValue));
      case 'ends_with':
        return String(targetValue).endsWith(String(conditionValue));
      case 'greater_than':
        return Number(targetValue) > Number(conditionValue);
      case 'less_than':
        return Number(targetValue) < Number(conditionValue);
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(targetValue);
      case 'not_in':
        return Array.isArray(conditionValue) && !conditionValue.includes(targetValue);
      default:
        return false;
    }
  }
}
