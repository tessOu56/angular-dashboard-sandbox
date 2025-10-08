import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  // Email validation
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(control.value) ? null : { email: true };
  }

  // Password strength validation
  static passwordStrength(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value;
    const errors: ValidationErrors = {};

    if (value.length < 8) {
      errors['minLength'] = true;
    }

    if (!/[A-Z]/.test(value)) {
      errors['noUpperCase'] = true;
    }

    if (!/[a-z]/.test(value)) {
      errors['noLowerCase'] = true;
    }

    if (!/\d/.test(value)) {
      errors['noNumber'] = true;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors['noSpecialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Phone number validation
  static phoneNumber(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(control.value.replace(/[\s\-\(\)]/g, '')) ? null : { phoneNumber: true };
  }

  // URL validation
  static url(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    try {
      new URL(control.value);
      return null;
    } catch {
      return { url: true };
    }
  }

  // Date range validation
  static dateRange(
    startDateControl: AbstractControl,
    endDateControl: AbstractControl
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = startDateControl.value;
      const endDate = endDateControl.value;

      if (!startDate || !endDate) return null;

      const start = new Date(startDate);
      const end = new Date(endDate);

      return start <= end ? null : { dateRange: true };
    };
  }

  // Future date validation
  static futureDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const date = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date > today ? null : { futureDate: true };
  }

  // Past date validation
  static pastDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const date = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return date < today ? null : { pastDate: true };
  }

  // File type validation
  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const file = control.value as File;
      const fileType = file.type;

      return allowedTypes.includes(fileType)
        ? null
        : { fileType: { allowedTypes, actualType: fileType } };
    };
  }

  // File size validation
  static fileSize(maxSizeInBytes: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const file = control.value as File;

      return file.size <= maxSizeInBytes
        ? null
        : { fileSize: { maxSize: maxSizeInBytes, actualSize: file.size } };
    };
  }

  // Array minimum length validation
  static arrayMinLength(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) return null;

      return control.value.length >= minLength
        ? null
        : { arrayMinLength: { minLength, actualLength: control.value.length } };
    };
  }

  // Array maximum length validation
  static arrayMaxLength(maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) return null;

      return control.value.length <= maxLength
        ? null
        : { arrayMaxLength: { maxLength, actualLength: control.value.length } };
    };
  }

  // Unique values in array validation
  static uniqueValues(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !Array.isArray(control.value)) return null;

    const values = control.value;
    const uniqueValues = new Set(values);

    return values.length === uniqueValues.size ? null : { uniqueValues: true };
  }

  // Conditional validation
  static conditional(
    condition: (control: AbstractControl) => boolean,
    validator: ValidatorFn
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!condition(control)) return null;

      return validator(control);
    };
  }

  // Custom regex validation
  static pattern(regex: RegExp, errorKey: string = 'pattern'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      return regex.test(control.value) ? null : { [errorKey]: true };
    };
  }

  // Business logic validators
  static businessHours(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const date = new Date(control.value);
    const hour = date.getHours();
    const day = date.getDay();

    // Monday to Friday, 9 AM to 5 PM
    if (day >= 1 && day <= 5 && hour >= 9 && hour < 17) {
      return null;
    }

    return { businessHours: true };
  }

  // Credit card validation (Luhn algorithm)
  static creditCard(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.replace(/\s/g, '');

    if (!/^\d{13,19}$/.test(value)) {
      return { creditCard: true };
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0 ? null : { creditCard: true };
  }

  // JSON validation
  static json(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    try {
      JSON.parse(control.value);
      return null;
    } catch {
      return { json: true };
    }
  }

  // IP address validation
  static ipAddress(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(control.value) ? null : { ipAddress: true };
  }

  // Alphanumeric validation
  static alphanumeric(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(control.value) ? null : { alphanumeric: true };
  }

  // No spaces validation
  static noSpaces(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    return !/\s/.test(control.value) ? null : { noSpaces: true };
  }

  // Minimum age validation
  static minAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      const actualAge =
        monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

      return actualAge >= minAge ? null : { minAge: { minAge, actualAge } };
    };
  }
}
