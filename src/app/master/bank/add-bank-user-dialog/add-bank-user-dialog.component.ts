import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DataProviderService } from '../../../service/data-provider.service';
import { ValidationUtils } from '../../../classes/ValidationUtils';

@Component({
  selector: 'app-add-bank-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-bank-user-dialog.component.html',
  styleUrls: ['./add-bank-user-dialog.component.scss']
})

export class AddBankUserDialogComponent implements OnInit {
  user: any = {};
  nameError = '';
  isSubmitting = false;
  isLoading = false;
  bankUserId: number | null = null;
  userId: any = sessionStorage.getItem('userId');

  get isEditMode(): boolean {
    return this.bankUserId !== null;
  }

  constructor(
    private dataprovider: DataProviderService,
    private dialogRef: MatDialogRef<AddBankUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { bankId: number; bankName: string; user?: any }
  ) {}

  ngOnInit(): void {
    if (this.data.user?.bankUserId) {
      this.bankUserId = this.data.user.bankUserId;
      this.loadUser();
    }
  }

  private loadUser(): void {
    if (this.bankUserId === null) return;
    this.isLoading = true;

    this.dataprovider.getBankUserById(this.bankUserId).subscribe({
      next: (u: any) => {
        this.isLoading = false;
        this.user = {
          name: u?.name ?? '',
          email: u?.email ?? '',
          mobile: u?.contactNo ?? u?.mobile ?? '',
          status: u?.status,
        };
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to load user details.');
        this.dialogRef.close(false);
      },
    });
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  validateBankName(): void {
    const result = ValidationUtils.validateBankName(this.user.name);
    this.nameError = result.valid ? '' : result.message;
  }

  onReset(form: any) {
    if (this.isEditMode) {
      this.nameError = '';
      this.loadUser();          // restore the saved values
      return;
    }
    form.resetForm();
    this.user = {};
    this.nameError = '';
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit(form: any) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(f => form.controls[f].markAsTouched());
      return;
    }
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const payload = {
      bankUserId: this.bankUserId ?? -1,
      name: this.user.name,
      email: this.user.email,
      contactNo: this.user.mobile,
      status: this.user.status,
      bankId: this.data.bankId,
      userId: this.userId ? Number(this.userId) : null,
    };

    this.dataprovider.updateBankUser(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          alert(res.message);
          this.dialogRef.close(true);
        } else {
          alert('Error: ' + res.message);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err.error?.message || 'Unexpected error occurred');
      },
    });
  }
}