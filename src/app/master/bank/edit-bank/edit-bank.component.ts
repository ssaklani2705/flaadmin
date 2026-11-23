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
  selector: 'app-edit-bank',
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
  templateUrl: './edit-bank.component.html',
  styleUrl: './edit-bank.component.scss'
})
export class EditBankComponent {

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
    this.bankId = +this.route.snapshot.paramMap.get('bankId')!;
         const queryParams = this.route.snapshot.queryParamMap;
  this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage -1;
    this.size = Number(queryParams.get('size')) || 5;

 // Load bank types from session or fetch if missing
  const stored = sessionStorage.getItem('bankTypes');
  if (stored) {
    this.bankTypes = JSON.parse(stored);
  } else {
    //this.getActiveBankTypes();
  }


  
  if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    this.getBankDetails();
  }


   getBankDetails() {
    this.dataprovider.getBankById(this.bankId).subscribe({
      next: (response) => {
        console.log(response);
        this.bank = {
          bankId: response.bankId,
          name: response.name,
          status: response.status,
          bankType: response.bankType,
          typeId: response.typeId,
        };

        

      },
      error: (err) => {
        console.error('Failed to fetch Bank details', err);
      }
    });
  }


  getActiveBanks() {
    // alert("in");
    // Check if already in session
    sessionStorage.removeItem('banks');
    
  
    // Otherwise fetch from backend
    this.dataprovider.getAllBank().subscribe(
      (response: Bank[]) => {
        // this.banks = response;
        // // Store in session
        sessionStorage.setItem('banks', JSON.stringify(response));
      },
      (error) => {
        console.error('Error fetching bank Bankss:', error);
      }
    );
  }

onReset(){
  this.bank = {};
  this.nameError = '';
  this.getBankDetails();
}


  validateBankName(): void {
    const result = ValidationUtils.validateForName(this.bank.name);
    this.nameError = result.valid ? '' : result.message;
  }

onSubmit(form: any) {
  if (form.invalid) {
    form.control.markAllAsTouched();  // force validation messages to show
    return;
  }

 // Custom validation
  this.validateBankName();

  // If there is a validation error, stop submission
  if (this.nameError) {
    return;
  }


  console.log('Form valid, submitting', this.bank);

      this.bank.userId = this.userId ? Number(this.userId) : null;

  // Call API to save changes
  this.dataprovider.updateBank(this.bank).subscribe({
    next: (response) => {
      if (response.success) {
        console.log(response.message); // "Bank updated successfully"
        alert(response.message);       // show success
        this.getActiveBanks();
        this.backToIndexPage();
      } else {
        console.error(response.message);
        alert(response.message);       // show backend error
      }
    },
    error: (err) => {
      console.error('API error:', err);
      alert(err.error?.message || 'Unexpected error occurred');
    }
  });
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
