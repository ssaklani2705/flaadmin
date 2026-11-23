import { Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {  FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {  MatNativeDateModule } from '@angular/material/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { DataProviderService } from '../../../service/data-provider.service';
import { Bank, BankType } from '../../../classes/banktype';
import { ValidationUtils } from '../../../classes/ValidationUtils';


@Component({
  selector: 'app-add-bank',
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
  templateUrl: './add-bank.component.html',
  styleUrl: './add-bank.component.scss'
})
export class AddBankComponent {

  bankId!: number;
  bank: any = {};

    currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
bankTypes: BankType[] = [];
 nameError: string = ''; 
 userId:any;

  constructor(
      private route: ActivatedRoute,
      private dataprovider: DataProviderService,
      @Inject(PLATFORM_ID) private platformId: Object,
      private router: Router
    ) {  
      
    }

    ngOnInit(): void {
          const queryParams = this.route.snapshot.queryParamMap;
    this.currentPage = Number(queryParams.get('currentPage')) || 1;
      this.searchText = queryParams.get('searchText') || '';
      this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
      this.page = Number(queryParams.get('page')) || this.currentPage -1;
      this.size = Number(queryParams.get('size')) || 5;

  if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

 // Load bank types from session or fetch if missing
  const stored = sessionStorage.getItem('bankTypes');
  if (stored) {
    this.bankTypes = JSON.parse(stored);
  } else {
    //this.getActiveBankTypes();
  }


  }


  getActiveBanks() {
      // Check if already in session
      sessionStorage.removeItem('banks');
      
      // Otherwise fetch from backend
      this.dataprovider.getAllBank().subscribe(
        (response: Bank[]) => {
          sessionStorage.setItem('banks', JSON.stringify(response));
        },
        (error) => {
          console.error('Error fetching bank Bankss:', error);
        }
      );
    }



  validateBankName(): void {
    // const result = ValidationUtils.validateBankName(this.bank.name);
    const result = ValidationUtils.validateForName(this.bank.name);
    this.nameError = result.valid ? '' : result.message;
  }


    onSubmit(form: any) {
      // Angular required/minlength validation
      if (form.invalid) {
        form.control.markAllAsTouched();
        return;
      }

      // Custom regex validation
      this.validateBankName();
      if (this.nameError) return;  // Stop submission if invalid

      this.bank.userId = this.userId ? Number(this.userId) : null;

      // API call to save bank
      this.dataprovider.saveBank(this.bank).subscribe({
  next: (response) => {
    if (response.success) {
      alert(response.message);  // Success message
      this.getActiveBanks();
      this.backToIndexPage();
    } else {
      alert(response.message);  // Backend error returned with 200
    }
  },
  error: (err) => {
    // The backend returns ApiResponse even on 400, so extract 'message' from err.error.message
    const errorMsg = err.error?.message || err.error?.message || 'Unexpected error occurred';
    alert(errorMsg);
  }
});

    }

  onReset() {
    this.bank = {};
    this.nameError = '';
  }



 backToIndexPage() {
    this.router.navigate(['/bank'], {
      queryParams: {
         currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size || 5
      }
    });
  }
}
