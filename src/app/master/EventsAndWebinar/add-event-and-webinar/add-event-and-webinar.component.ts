import { Component, ElementRef, OnInit, ViewChild, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { DataProviderService } from '../../../service/data-provider.service';
import { MyDateAdapter } from '../../../classes/my-date-adapter';



declare var $: any;

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
  selector: 'app-add-event-and-webinar',
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
  templateUrl: './add-event-and-webinar.component.html',
  styleUrl: './add-event-and-webinar.component.scss',
    encapsulation: ViewEncapsulation.None , // ✅ allows global styles to apply
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class AddEventAndWebinarComponent implements OnInit {
  @ViewChild('summernoteEditor') summernoteEditor!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  gallery = {
    title: '',
    date: new Date(),
    time: '',
    durationHours: 0,
    durationMinutes: '00',
    type: 'event',
    location: '',
    link: '',
    shortDescription: '',
    description: '',
    file: null
  };

  fileError: string = '';
  descTouched = false;

  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
  userId: any;
  username: any;
  minDate: Date = new Date();

  durationHours: number[] = Array.from({ length: 13 }, (_, i) => i); // 0 to 12
  durationMinutes: string[] = ['00', '15', '30', '45'];

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

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

  // ngAfterViewInit(): void {
  //   $(this.summernoteEditor.nativeElement).summernote({
  //     height: 200,
  //     placeholder: 'Enter description here...',
  //     callbacks: {
  //       onChange: (contents: string) => {
  //         this.gallery.description = contents;
  //       },
  //       onBlur: () => {
  //         this.descTouched = true;
  //       }
  //     }
  //   });
  // }


  ngAfterViewInit(): void {
  $(this.summernoteEditor.nativeElement).summernote({
    height: 200,
    placeholder: 'Enter description here...',
    callbacks: {
      onChange: (contents: string) => {
        // Strip HTML + spaces + &nbsp; to detect "real" text
        const cleanedText = contents
          .replace(/<[^>]*>/g, '')   // remove tags
          .replace(/&nbsp;/g, '')    // remove &nbsp;
          .replace(/\s+/g, '')       // remove whitespace
          .trim();

        // Only assign if text is present
        this.gallery.description = cleanedText.length > 0 ? contents : '';

        // 🔑 Force Angular to notice the change in hidden input
        const inputElement = document.querySelector<HTMLInputElement>('input[name="description"]');
        if (inputElement) {
          inputElement.value = this.gallery.description;
          inputElement.dispatchEvent(new Event('input'));
        }
      },
      onBlur: () => {
        this.descTouched = true;
      }
    }
  });
}




  onSubmit(form: NgForm) {
    this.descTouched = true;

    if (!this.gallery.file) {
      this.fileError = 'File is required.';
      return;
    }

    if (this.fileError || form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('title', this.gallery.title.trim());
    // const dateTimeString = `${this.formatDateToISO(this.gallery.date)}T${this.gallery.time}`;
    // formData.append('dateTime', dateTimeString);
    let dateTimeString: string;

if (this.gallery.time) {
  dateTimeString = `${this.formatDateToISO(this.gallery.date)}T${this.gallery.time}`;
} else {
  // default time if not selected
  dateTimeString = `${this.formatDateToISO(this.gallery.date)}T00:00`;
}
formData.append('dateTime', dateTimeString);

    formData.append('type', this.gallery.type);
    formData.append('location', this.gallery.type === 'event' ? this.gallery.location : '');
    formData.append('link', this.gallery.type === 'webinar' ? this.gallery.link : '');
    formData.append('shortDescription', this.gallery.shortDescription);
    formData.append('description', this.gallery.description);
    formData.append('time', this.gallery.time);
    formData.append('file', this.gallery.file as Blob);
    formData.append('iUserId', this.userId);
    formData.append('sUsername', this.username);
    formData.append('durationHours', String(this.gallery.durationHours));
    formData.append('durationMinutes', String(this.gallery.durationMinutes));

    this.dataprovider.addEventWebinar(formData).subscribe({
      next: (res: any) => {
        alert(res.message || 'Event/Webinar added successfully');
        this.backToIndexPage();
      },
      error: (err) => {
        console.error('Submission error:', err);
        const msg = err.error?.message || err.statusText || 'Unknown error';
        alert('Failed to submit: ' + msg);
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
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Only JPG, JPEG, and PNG files are allowed.';
        event.target.value = '';
        this.gallery.file = null;
        return;
      }

      if (file.size > maxSize) {
        this.fileError = 'File size must not exceed 5 MB.';
        event.target.value = '';
        this.gallery.file = null;
        return;
      }

      this.gallery.file = file;
    }
  }

  onReset(form?: NgForm) {
    this.fileError = '';
    this.descTouched = false;

    if (form) {
      form.resetForm({
        type: 'event',
        date: new Date()
      });
    }

    if (this.summernoteEditor) {
      $(this.summernoteEditor.nativeElement).summernote('reset');
      this.gallery.description = '';
    }

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  backToIndexPage() {
    this.router.navigate(['/eventsandwebinar'], {
      queryParams: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size || 5
      }
    });
  }
}
