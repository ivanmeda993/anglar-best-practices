import { Component, OnInit } from '@angular/core';
import { UserAuthService } from '../../services/user-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: '',
  };
  loading = false;
  alertMsg = '';
  alertColor = 'blue';
  showAlert = false;

  constructor(private auth: UserAuthService) {}

  ngOnInit(): void {}

  async login() {
    this.alertMsg = 'Please wait while we log you in';
    this.showAlert = true;
    this.alertColor = 'blue';
    this.loading = true;
    try {
      await this.auth.login(this.credentials);
      this.loading = false;
      this.alertMsg = "You're logged in";
      this.alertColor = 'green';
    } catch (err) {
      console.error(err);
      this.loading = false;
      this.alertMsg = 'There was an error logging you in';
      this.alertColor = 'red';
    }
  }
}
