import { Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { Bank } from '../../classes/banktype';
import { DataProviderService } from '../../service/data-provider.service';
import { ValidationUtils } from '../../classes/ValidationUtils';


@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit {

  bankUserId!: number;
  // bank: any = {};

  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
  banksdetails: Bank[] = [];
  nameError: string = '';
  userId: any;
  user: any = {};

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.bankUserId = +this.route.snapshot.paramMap.get('bankUserId')!;
    const queryParams = this.route.snapshot.queryParamMap;
    this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;

    // Load bank types from session or fetch if missing
    const stored = sessionStorage.getItem('banks');
    if (stored) {
      this.banksdetails = JSON.parse(stored);
      console.log(this.banksdetails)
    } else {
      //this.getActiveBankTypes();
    }



    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    this.getUserDetails();
  }




  getUserDetails() {
    this.dataprovider.getUserById(this.bankUserId).subscribe({
      next: (response) => {
        console.log(response);
        this.user = {
          name: response.name,
          email: response.email,
          mobile: response.contactNo,
          status: response.status,
          bankName: response.bankName,
          bankType: response.bankType,
          bankId: response.bankId,
        };



      },
      error: (err) => {
        console.error('Failed to fetch user details', err);
      }
    });
  }




  validateBankName(): void {
    const result = ValidationUtils.validateBankName(this.user.name);
    this.nameError = result.valid ? '' : result.message;
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // Only allow digits (0–9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  backToIndexPage() {
    this.router.navigate(['/bankuser'], {
      queryParams: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size || 5
      }
    });
  }

  onReset(form?: any) {
    if (form) {
      form.resetForm();
    }
    this.user = {};       // clear model
    this.nameError = '';  // reset custom validation error
    this.getUserDetails();

  }

  isSubmitting = false;

  onSubmit(form: any) {
    if (form.invalid) {
      // Touch all controls to trigger validation messages
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched();
      });
      return;
    }

    if (this.isSubmitting) return; //  prevent multiple clicks
    this.isSubmitting = true;


    // Prepare request payload
    const payload = {
      bankUserId: this.bankUserId,
      name: this.user.name,
      email: this.user.email,
      contactNo: this.user.mobile,
      status: this.user.status,
      bankId: this.user.bankId,
      userId: this.userId ? Number(this.userId) : null
    };

    console.log('Submitting form data:', payload);

    // Call API
    this.dataprovider.updateBankUser(payload).subscribe({
      next: (res) => {
        if (res.success) {
          alert(res.message);  // show API message
          this.backToIndexPage();
        } else {
          alert("Error: " + res.message);
        }
        this.isSubmitting = false; //  re-enable submit

      },
      error: (err) => {
        console.error('Failed to update user', err);
        //alert("Something went wrong while saving Bank user.");
        const errorMsg = err.error?.message || err.error?.message || 'Unexpected error occurred';

        alert(errorMsg);
        this.isSubmitting = false; //  re-enable submit

      }
    });
  }



}