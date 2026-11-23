import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { DataProviderService } from '../../../service/data-provider.service';
import { MatRadioModule } from '@angular/material/radio';
import { ValidationUtils } from '../../../classes/ValidationUtils';
import { MyDateAdapter } from '../../../classes/my-date-adapter';


export const MY_DATE_FORMATS = {
  parse: { dateInput: 'DD-MM-YYYY' },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-add-knowledge-sharing',
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
    MatSelectModule,
    MatRadioModule
  ],
  templateUrl: './add-knowledge-sharing.component.html',
  styleUrl: './add-knowledge-sharing.component.scss',
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class AddKnowledgeSharingComponent {

Knowledge = {
  title: '',
  file: null,
  source: '',
  sourceUrl: '',
  date: new Date(),
};

  @ViewChild('fileInput') fileInput!: ElementRef;

fileError: string = '';

  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
  nameError: string = '';
  userId: any;
  username:any;

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
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
      this.username = sessionStorage.getItem('username');
    }


  }

formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

onSubmit(form: any) {
  if (form.invalid || !this.Knowledge.file) {
    form.control.markAllAsTouched();
    if (!this.Knowledge.file) this.fileError = 'File is required.';
    return;
  }

  const formData = new FormData();
  formData.append('title', this.Knowledge.title);
  formData.append('source', this.Knowledge.source);
  formData.append('iUserId', this.userId);
  formData.append('sUsername', this.username);
  formData.append('file', this.Knowledge.file);
  formData.append('knowledgedata', `${this.formatDateToISO(this.Knowledge.date)}T00:00`);

  this.dataprovider.addKnowledgeSharing(formData).subscribe({
    next: (res: any) => {
      alert(res.message || 'Knowledge Sharing added successfully');
      this.backToIndexPage();
    },
    error: (err) => {
      console.error('Submission error:', err);
      alert('Failed to submit: ' + (err.error?.message || 'Unknown error'));
    }
  });
}

//  onFileSelected(event: any) {
//   const file = event.target.files[0];
//   if (file) {
//     this.gallery.file = file;
//   }
// }


onFileSelected(event: any) {
  const file = event.target.files[0];
  this.fileError = '';

   

  if (file) {
    // File type check
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Only JPG, JPEG, PNG, or PDF files are allowed.';
      this.Knowledge.file = null;
      return;
    }

    // File size check (5 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.fileError = 'File size must be less than 10 MB.';
      this.Knowledge.file = null;
      return;
    }

    this.Knowledge.file = file;
  } else {
    this.fileError = 'File is required.';
  }
}

  onReset() {
    // Clear Knowledge fields
    this.Knowledge = {
      title: '',
      source: '',
      file: null,
      sourceUrl: '',
      date: new Date()
    };

    // Clear file error
    this.fileError = '';

    // Reset file input manually
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  backToIndexPage() {
    this.router.navigate(['/knowledgesharing'], {
      queryParams: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size || 5
      }
    });
  }

 validateBankName(): void {
    // const result = ValidationUtils.validateBankName(this.bank.name);
    const result = ValidationUtils.validateForName(this.Knowledge.title);
    this.nameError = result.valid ? '' : result.message;
  }

}
