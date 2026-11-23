import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  AfterViewInit,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule
} from '@angular/material/core';
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
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'app-edit-event-and-webinar',
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
    MatSelectModule,
    MatRadioModule
  ],
  templateUrl: './edit-event-and-webinar.component.html',
  styleUrl: './edit-event-and-webinar.component.scss',
    encapsulation: ViewEncapsulation.None , // ✅ allows global styles to apply
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class EditEventAndWebinarComponent
  implements OnInit, AfterViewInit {
  @ViewChild('summernoteEditor') summernoteEditor!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  eventId!: number;
  event: any = {
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
    file: null,
    status: 1
  };

  fileError: string = '';
  existingImageUrl: string | null = null;
  descTouched = false;
  minDate: Date = new Date();

  // Pagination context
  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;

  userId: any;
  username: any;

  durationHours: number[] = Array.from({ length: 13 }, (_, i) => i); // 0 to 12
  durationMinutes: string[] = ['00', '15', '30', '45'];

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.eventId = +this.route.snapshot.paramMap.get('eventId')!;
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

    this.getEventWebinar();
  }

  // ngAfterViewInit(): void {
  //   $(this.summernoteEditor.nativeElement).summernote({
  //     height: 200,
  //     placeholder: 'Enter description here...',
  //     callbacks: {
  //       onChange: (contents: string) => {
  //         this.event.description = contents?.trim();
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
        this.event.description = cleanedText.length > 0 ? contents : '';

        // 🔑 Force Angular to notice the change in hidden input
        const inputElement = document.querySelector<HTMLInputElement>('input[name="description"]');
        if (inputElement) {
          inputElement.value = this.event.description;
          inputElement.dispatchEvent(new Event('input'));
        }
      },
      onBlur: () => {
        this.descTouched = true;
      }
    }
  });
}


  getEventWebinar() {
    this.dataprovider.getEventWebinar(this.eventId).subscribe({
      next: (response) => {
        this.event.title = response.title;
        this.event.date = new Date(response.eventDate);
        this.event.time = response.eventtime;
        this.event.durationHours = Number(response.durationHours); // convert to number
        this.event.durationMinutes = response.durationMinutes || '00';
        this.event.type = response.type === 1 ? 'event' : 'webinar';
        this.event.location = response.location || '';
        this.event.link = response.link || '';
        this.event.shortDescription = response.shortDesc || '';
        this.event.description = response.description || '';
        this.event.status = response.status;

        $(this.summernoteEditor.nativeElement).summernote(
          'code',
          this.event.description
        );

        if (response.filename) {
          this.dataprovider.getEventImageById(this.eventId).subscribe({
            next: (blob) => {
              this.existingImageUrl = URL.createObjectURL(blob);
            },
            error: (err) =>
              console.error('Failed to load existing image', err)
          });
        }
      },
      error: (err) => console.error('Failed to fetch event:', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.fileError = '';

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Only JPG, JPEG, and PNG files are allowed.';
        event.target.value = '';
        this.event.file = null;
        return;
      }

      if (file.size > maxSize) {
        this.fileError = 'File size must not exceed 5 MB.';
        event.target.value = '';
        this.event.file = null;
        return;
      }

      this.event.file = file;
    }
  }

  formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(form: NgForm) {
    this.descTouched = true;

    // if (
    //   !form.valid ||
    //   !this.event.description ||
    //   this.event.description.trim() === ''
    // ) {
    //   form.control.markAllAsTouched();
    //   return;
    // }

    if (
      !form.valid
    ) {
      form.control.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('eventId', this.eventId.toString());
    // formData.append(
    //   'dateTime',
    //   `${this.formatDateToISO(this.event.date)}T${this.event.time}`
    // );
     let dateTimeString: string;

if (this.event.time) {
  dateTimeString = `${this.formatDateToISO(this.event.date)}T${this.event.time}`;
} else {
  // default time if not selected
  dateTimeString = `${this.formatDateToISO(this.event.date)}T00:00`;
}
    formData.append('dateTime', dateTimeString);
    formData.append('title', this.event.title);
    formData.append('time', this.event.time);
    formData.append('type', this.event.type);
    formData.append(
      'location',
      this.event.type === 'event' ? this.event.location : ''
    );
    formData.append(
      'link',
      this.event.type === 'webinar' ? this.event.link : ''
    );
    formData.append('shortDescription', this.event.shortDescription);
    formData.append('description', this.event.description);

    if (this.event.file) {
      formData.append('file', this.event.file);
    }

    formData.append('iUserId', this.userId);
    formData.append('sUsername', this.username);
    formData.append('durationHours', String(this.event.durationHours));
      formData.append('durationMinutes', String(this.event.durationMinutes));
      formData.append('status', this.event.status);


    this.dataprovider.updateEventWebinar(formData).subscribe({
      next: (res: any) => {
        alert(res.message || 'Event/Webinar updated successfully');
        this.backToIndexPage();
      },
      error: (err) => {
        console.error('Update error:', err);
        alert(
          'Failed to update: ' +
          (err.error?.message || 'Unknown error')
        );
      }
    });
  }

  onReset(form?: NgForm) {
    this.fileError = '';
    this.descTouched = false;

    this.event = {
      title: '',
      date: new Date(),
      time: '',
      type: 'event',
      location: '',
      link: '',
      shortDescription: '',
      description: '',
      file: null
    };

    if (this.summernoteEditor) {
      $(this.summernoteEditor.nativeElement).summernote('reset');
    }

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    this.existingImageUrl = null;

    if (form) {
      form.resetForm({
        type: 'event',
        date: new Date()
      });
    }
    this.getEventWebinar();
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

  isPastDate(date: Date): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  }
}
