import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  captchaValue!: string;
  errorMessage: string = '';

  imgUrl: any = environment.imgUrl;

  isProcessingForgotPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      captcha: ['', Validators.required],
    });
    this.loadCaptcha();
  }

  loadCaptcha() {
    this.loginService.getCaptcha().subscribe({
      next: (res: { success: boolean; message: string; data: string }) => {
        if (res.success) {
          this.captchaValue = res.data;
        }
      },
      error: (err: any) => {
        console.error('Error loading captcha:', err);
      },
    });
  }

  onSubmit() {
    const email = this.loginForm.get('email')?.value?.trim();
    const password = this.loginForm.get('password')?.value?.trim();
    const captcha = this.loginForm.get('captcha')?.value?.trim();

    if (!email && !password && !captcha) {
      this.errorMessage = 'Please enter user name, password, captcha.';
      return;
    } else if (!email && !password) {
      this.errorMessage = 'Please enter user name, password.';
      return;
    } else if (!email && !captcha) {
      this.errorMessage = 'Please enter user name, captcha.';
      return;
    } else if (!password && !captcha) {
      this.errorMessage = 'Please enter password, captcha.';
      return;
    } else if (!email) {
      this.errorMessage = 'Please enter user name.';
      return;
    } else if (!password) {
      this.errorMessage = 'Please enter password.';
      return;
    } else if (!captcha) {
      this.errorMessage = 'Please enter captcha.';
      return;
    }

    this.errorMessage = '';

    const payload = {
      username: email,
      password: password,
      captcha: captcha,
      captchaAns: this.captchaValue,
    };
    this.loginService.checkLogin(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          sessionStorage.setItem('authToken', res.data.token);
          sessionStorage.setItem('username', res.data.username);
          sessionStorage.setItem('userId', res.data.userId);
          sessionStorage.setItem('sessionId', res.data.sessionId);
          sessionStorage.setItem('modules', JSON.stringify(res.data.modules));
          sessionStorage.removeItem('bankTypes');
          sessionStorage.removeItem('banks');
          sessionStorage.removeItem('selectedModuleDetail');
          // this.router.navigate(['/IBAESG']);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message || 'Invalid login credentials';
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message;
        // this.errorMessage = "Server Error";
      },
    });
  }

  onForgotPassword() {
    const email = this.loginForm.get('email')?.value?.trim();
    if (!email) {
      this.errorMessage = 'Please enter Email Id.';
      return;
    }

    this.isProcessingForgotPassword = true;

    this.loginService.forgotPasswordMail(email).subscribe({
      next: (res) => {
        if (res.success) {
          alert(res.message || 'Password reset email sent successfully.');
        } else {
          alert(res.message || 'Unable to send password reset email.');
        }
        this.isProcessingForgotPassword = false;
      },
      error: (err) => {
        console.error('Forgot password error:', err);
        alert(err);
        this.isProcessingForgotPassword = false;
      },
    });
  }

  currentYear = new Date().getFullYear();
}
