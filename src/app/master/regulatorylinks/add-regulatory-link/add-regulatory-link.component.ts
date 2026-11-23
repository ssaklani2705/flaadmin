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
  selector: 'app-add-regulatory-link',
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
  templateUrl: './add-regulatory-link.component.html',
  styleUrl: './add-regulatory-link.component.scss'
})
export class AddRegulatoryLinkComponent {


  gallery: any = {};

    currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;

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




  }


  



  validateBankName(): void {
    const result = ValidationUtils.validateForName(this.gallery.name);
    this.nameError = result.valid ? '' : result.message;
  }


   onSubmit(form: any) {
  // Basic validation
  this.validateBankName();
  if (this.nameError) return;

  // Set the userId
  // this.gallery.userId = this.userId;
this.gallery.userId = this.userId ? Number(this.userId) : null;
  // Call API
  this.dataprovider.addRegulatoryLink(this.gallery).subscribe({
    next: (res: any) => {
      alert(res.message || 'Link added successfully');
      this.onReset();  // clear form
      this.backToIndexPage(); // navigate back to list
    },
    error: (err: any) => {
      console.error(err);
      alert(err.error?.message || 'Error adding link');
    }
  });
}


  onReset() {
    this.gallery = {};
    this.nameError = '';
  }



 backToIndexPage() {
    this.router.navigate(['/regulatorylinks'], {
      queryParams: {
         currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size || 5
      }
    });
  }

validateSequence(event: Event) {
  const input = event.target as HTMLInputElement;

  // ✅ Allow blank value
  if (input.value === '') {
    this.gallery.sequence = null;
    return;
  }

  let value = Number(input.value);

  // Ignore invalid numbers
  if (isNaN(value)) {
    return;
  }

  // Enforce range only when value exists
  if (value < 1) {
    value = 1;
  } else if (value > 100) {
    value = 100;
  }

  input.value = value.toString();
  this.gallery.sequence = value;
}

}
