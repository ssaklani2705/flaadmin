import { Component, Inject } from '@angular/core';
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
export class AddBankUserDialogComponent {
  user: any = {};
  nameError = '';
  isSubmitting = false;
  userId: any = sessionStorage.getItem('userId');

  constructor(
    private dataprovider: DataProviderService,
    private dialogRef: MatDialogRef<AddBankUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { bankId: number; bankName: string }
  ) {}

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
      bankUserId: -1,
      name: this.user.name,
      email: this.user.email,
      contactNo: this.user.mobile,
      status: this.user.status,
      bankId: this.data.bankId,
      userId: this.userId ? Number(this.userId) : null
    };

    this.dataprovider.updateBankUser(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          alert(res.message);
          this.dialogRef.close(true);   // tells View Bank to refresh
        } else {
          alert('Error: ' + res.message);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err.error?.message || 'Unexpected error occurred');
      }
    });
  }
}