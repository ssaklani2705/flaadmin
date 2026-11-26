import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { environment } from '../../../environments/environment';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DataProviderService } from '../../service/data-provider.service';
import { CryptoService } from '../../service/CryptoService';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule,MatIconModule, MatButtonModule,
    ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent { 
  @Output() toggleSidebar = new EventEmitter<void>();

  /** Collapse state from parent */
  @Input() isCollapsed = false;

  /** Dropdown open/close state */
  isVipulDropdownOpen = false;

   changePasswordForm!: FormGroup;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isChangingPassword = false;

  emailId: string = '';
  userId: any;

  constructor(private router: Router, private loginService: LoginService,private eRef: ElementRef,private dataProvider: DataProviderService,
    private cryptoService: CryptoService,
    private fb: FormBuilder,
  ) { }

  username: string | null = null;

  imgUrl: any = environment.imgUrl;

  // ngOnInit() {
  //   // this.username = sessionStorage.getItem('username');
  //   if (typeof window !== 'undefined' && sessionStorage) {
  //     this.username = sessionStorage.getItem('username');
  //   }
  // }

    ngOnInit() {
    if (typeof window !== 'undefined' && sessionStorage) {
      this.username = sessionStorage.getItem('username');
      this.emailId = sessionStorage.getItem('emailId') || '';
      this.userId = sessionStorage.getItem('userId') || '';
    }

    this.changePasswordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: [
          this.passwordMismatchValidator,
          this.differentPasswordValidator,
        ],
      },
    );
  }

  /** Toggle sidebar: instantly collapse logo + inform parent */
  onToggleClick() {
    this.isCollapsed = !this.isCollapsed; // instant logo change
    this.toggleSidebar.emit();            // tell parent to toggle sidebar
  }

  /** Toggle profile dropdown */
  toggleVipulDropdown() {
    this.isVipulDropdownOpen = !this.isVipulDropdownOpen;
  }

  /** Reload home route */
  reloadHome() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  onLogout() {
    const logoutRequest = this.loginService.logout();

    if (!logoutRequest) {
      this.loginService.clearSession();
      this.router.navigate(['/login']);
      return;
    }

    logoutRequest.subscribe({
      next: () => {
        this.loginService.clearSession();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loginService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }
// onLogout() {
//   this.router.navigate(['/login']);
// }


 /** ✅ Close dropdown when clicking outside */
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (
      this.isVipulDropdownOpen &&
      !this.eRef.nativeElement.contains(event.target)
    ) {
      this.isVipulDropdownOpen = false;
    }
  }


  showChangePasswordModal = false;

  changePasswordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  onChangePasswordClick(): void {
    this.resetChangePasswordForm();
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal(): void {
    if (this.isChangingPassword) {
      return;
    }

    this.showChangePasswordModal = false;
    this.resetChangePasswordForm();
  }

  resetChangePasswordForm(): void {
    if (this.changePasswordForm) {
      this.changePasswordForm.reset({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      this.changePasswordForm.markAsPristine();
      this.changePasswordForm.markAsUntouched();
      this.changePasswordForm.updateValueAndValidity();
    }

    this.showOldPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;

    this.isChangingPassword = false;
  }

  submitChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const formValue = this.changePasswordForm.getRawValue();

    const request = {
      oldPassword: this.cryptoService.cipher(formValue.oldPassword),
      newPassword: this.cryptoService.cipher(formValue.newPassword),
      username: this.cryptoService.cipher(this.emailId),
      userId: this.cryptoService.cipher(String(this.userId)),
    };

    this.dataProvider.updatePassword(request).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          Swal.fire('Success', response.message, 'success');
          this.resetChangePasswordForm();
          this.showChangePasswordModal = false;
        } else {
          const errorMessage =
            response?.data || response?.message || 'Unable to change password.';

          Swal.fire('Error', errorMessage, 'error');
        }
      },
      error: (error: any) => {
        console.error('Error changing password:', error);

        const errorMessage =
          error?.error?.data ||
          error?.error?.message ||
          error?.message ||
          'Something went wrong.';
        Swal.fire('Error', errorMessage, 'error');
      },
    });
  }

  private passwordMismatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private differentPasswordValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const oldPassword = control.get('oldPassword')?.value;
    const newPassword = control.get('newPassword')?.value;

    if (!oldPassword || !newPassword) {
      return null;
    }

    return oldPassword === newPassword ? { samePassword: true } : null;
  }

}
