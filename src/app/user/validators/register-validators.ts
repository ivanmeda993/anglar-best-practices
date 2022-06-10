import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class RegisterValidators {
  static passwordMatch(
    controlName: string,
    controlToCompare: string
  ): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const controlToMatch = group.get(controlToCompare);
      if (!control || !controlToMatch) {
        console.error('Control not found');
        return { controlNotFound: false };
      }

      const error =
        control.value !== controlToMatch.value ? { noMatch: true } : null;
      controlToMatch.setErrors(error);

      return error;
    };
  }
}

//
