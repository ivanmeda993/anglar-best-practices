import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserAuthService } from '../../services/user-auth.service';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  inSubmission = false;
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl(
    '',
    [Validators.required, Validators.email],
    this.emailTaken.validate
  );
  age = new FormControl('', [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(20),
    Validators.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/
    ),
  ]);
  confirmPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(20),
    Validators.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/
    ),
  ]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(14),
  ]);
  showAlert = false;
  alertColor = 'blue';
  alertMessage = 'Please wait your account is being created';
  registerForm = new FormGroup(
    {
      name: this.name,
      email: this.email,
      age: this.age,
      password: this.password,
      confirmPassword: this.confirmPassword,
      phoneNumber: this.phoneNumber,
    },
    [RegisterValidators.passwordMatch('password', 'confirmPassword')]
  );

  constructor(private auth: UserAuthService, private emailTaken: EmailTaken) {}

  async registerHandler() {
    if (this.password.value !== this.confirmPassword.value) {
      this.showAlert = true;
      this.alertColor = 'red';
      this.alertMessage = 'Passwords do not match';
      return;
    }
    this.showAlert = true;
    this.alertMessage = 'Please wait your account is being created';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      await this.auth.createUser(this.registerForm.value);
    } catch (error) {
      this.showAlert = true;
      // @ts-ignore
      this.alertMessage = 'Error: ' + error?.message;
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }
    this.alertMessage = 'Account created successfully';
    this.alertColor = 'green';
  }
}
