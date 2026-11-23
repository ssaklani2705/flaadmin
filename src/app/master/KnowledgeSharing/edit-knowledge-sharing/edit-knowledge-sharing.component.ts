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
import { SafeUrlPipe } from '../../../classes/SafeUrlPipe';
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
  selector: 'app-edit-knowledge-sharing',
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
    MatRadioModule,
    SafeUrlPipe
  ],
  templateUrl: './edit-knowledge-sharing.component.html',
  styleUrl: './edit-knowledge-sharing.component.scss',
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class EditKnowledgeSharingComponent {

    @ViewChild('fileInput') fileInput!: ElementRef;


Knowledge:any = {
  title: '',
  file: null,
  source: '',
  type: '',
  caption: '',  
  url: '',
  status: 0,
  date: ''
};

fileError: string = '';

  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
  nameError: string = '';
  userId: any;
  username:any;

  knowledgeId:any;

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.knowledgeId = +this.route.snapshot.paramMap.get('knowledgeId')!;
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

    this.getKnowledgeDetails();
  }

// Knowledge: any = {};
getKnowledgeDetails() {
  this.dataprovider.getKnowledgeSharing(this.knowledgeId).subscribe({
    next: (response: any) => {
      console.log(response);

      const fileExtension = response.filename?.split('.').pop()?.toLowerCase();
      // alert(fileExtension)
      if (['png','jpg','jpeg'].includes(fileExtension)) {
        // Image handling
        this.dataprovider.getKnowledgeSharingDocById(this.knowledgeId).subscribe(blob => {
          const objectURL = URL.createObjectURL(blob);
          this.Knowledge = {
            title: response.name,
            source: response.source,
            type: 'image',             // 👈 Important for *ngIf
             url: objectURL,
            caption: response.name || '',
            status: response.status || 0,
            date: new Date(response.regDate)
            //regDate: response.regDate
          };
        });
      } else if (fileExtension === 'pdf') {
        // PDF handling
        this.dataprovider.getKnowledgeSharingDocById(this.knowledgeId).subscribe(blob => {
          const objectURL = URL.createObjectURL(blob);
          this.Knowledge = {
            title: response.name,
            source: response.source,
            type: 'pdf',
             url: objectURL,
            caption: response.name || '',
            status: response.status || 0,
            date: new Date(response.regDate)
            // regDate: response.regDate
          };
        });
      } else {
        console.warn('Unsupported file type:', fileExtension);
        this.Knowledge = null;
      }

      
    },
    error: (err) => {
      console.error('Failed to fetch gallery details', err);
    }
  });
}

onSubmit(form: any) {
  // if (form.invalid || !this.Knowledge.file) {
  //   form.control.markAllAsTouched();
  //   if (!this.Knowledge.file) this.fileError = 'File is required.';
  //   return;
  // }

  const formData = new FormData();
  formData.append('knowledgeId', this.knowledgeId);
  formData.append('title', this.Knowledge.title);
  formData.append('source', this.Knowledge.source);
  formData.append('iUserId', this.userId);
  formData.append('sUsername', this.username);
  formData.append('file', this.Knowledge.file);
  formData.append('status', this.Knowledge.status);
  formData.append('knowledgedata', `${this.formatDateToISO(this.Knowledge.date)}T00:00`);


  this.dataprovider.updateKnowledgeSharing(formData).subscribe({
    next: (res: any) => {
      alert(res.message || 'Knowledge Sharing Updated successfully');
      this.backToIndexPage();
    },
    error: (err) => {
      console.error('Submission error:', err);
      alert('Failed to submit: ' + (err.error?.message || 'Unknown error'));
    }
  });
}

formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


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

  // onReset() {
  //   // Clear Knowledge fields
  // this.Knowledge = {
  //   title: '',
  //   source: '',
  //   file: null
  // };

  // // Clear file error
  // this.fileError = '';
  // this.getKnowledgeDetails();

 
  // }


  onReset() {
    // Clear Knowledge fields
    this.Knowledge = {
      title: '',
      source: '',
      file: null,
      sourceUrl: ''
    };

    // Clear file error
    this.fileError = '';

    // Reset file input manually
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.getKnowledgeDetails();
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

}
