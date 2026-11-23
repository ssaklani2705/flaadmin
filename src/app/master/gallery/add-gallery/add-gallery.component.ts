import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { DataProviderService, GroupDTO } from '../../../service/data-provider.service';

interface Gallery {
  type: number;
  file: File | null;
  videoUrl: string;
  caption: string;
  groupId: string;
}

@Component({
  selector: 'app-add-gallery',
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
  templateUrl: './add-gallery.component.html',
  styleUrls: ['./add-gallery.component.scss']
})
export class AddGalleryComponent implements OnInit {
  gallery: Gallery = { type: 1, file: null, videoUrl: '', caption: '' , groupId: ''};
  fileTouched = false;
  videoTouched = false;
  captionTouched = false;

  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
  userId: string | null = null;

  maxFileSize = 6 * 1024 * 1024; // 5 MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    groups: GroupDTO[] = [];

  @ViewChild('fileInputRef') fileInputRef?: ElementRef<HTMLInputElement>;

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
    }

     this.loadGroups();
  }

  

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    if (file) {
      this.gallery.file = file;
      this.fileTouched = true;
    }
  }

  onTypeChange(): void {
    this.gallery.file = null;
    this.gallery.videoUrl = '';
    this.fileTouched = false;
    this.videoTouched = false;

    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  loadGroups(): void {
    this.dataprovider.getActiveGroups().subscribe({
      next: (res) => {
        this.groups = res;
      },
      error: (err) => {
        console.error('Error loading groups', err);
      }
    });
  }

onSubmit(form: any): void {
  this.captionTouched = true;
  this.fileTouched = true;
  this.videoTouched = true;

  if (form.invalid) {
    form.control.markAllAsTouched();
    return;
  }

  if (this.gallery.type === 1) {
    if (!this.gallery.file) {
      alert('Please select an image file.');
      return;
    }
    if (!this.allowedTypes.includes(this.gallery.file.type.toLowerCase())) {
      alert('Only JPG, PNG, and JPEG images are allowed.');
      return;
    }
    if (this.gallery.file.size > this.maxFileSize) {
      alert('File size exceeds 6 MB.');
      return;
    }
  } else if (this.gallery.type === 2) {
    if (!this.gallery.videoUrl || this.gallery.videoUrl.trim() === '') {
      alert('Please enter a video URL.');
      return;
    }

    // ✅ Ensure ?rel=0 is appended
    let cleanUrl = this.gallery.videoUrl.trim();
    if (!cleanUrl.includes('?rel=0')) {
      cleanUrl += cleanUrl.includes('?') ? '&rel=0' : '?rel=0';
    }
    this.gallery.videoUrl = cleanUrl;
  }

  const formData = new FormData();
  formData.append('sCaption', this.gallery.caption);
  formData.append('iUserId', this.userId || '');
  formData.append('iType', this.gallery.type.toString());

  if (this.gallery.type === 1 && this.gallery.file) {
    formData.append('file', this.gallery.file);
  }
  if (this.gallery.type === 2 && this.gallery.videoUrl.trim() !== '') {
    formData.append('videoUrl', this.gallery.videoUrl.trim());
  }

  formData.append('groupId', this.gallery.groupId || '');

  this.dataprovider.uploadGallery(formData).subscribe({
    next: (res) => {
      alert(res.message);
      this.backToIndexPage();
    },
    error: (err) => {
      alert(err.error?.message || 'Error occurred');
    }
  });
}


  onReset(form?: any): void {
    this.gallery = { type: 1, file: null, videoUrl: '', caption: '' , groupId: ''};
    this.fileTouched = false;
    this.videoTouched = false;
    this.captionTouched = false;

    if (form) {
      form.resetForm({ type: 1 });
    }

    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  backToIndexPage(): void {
    this.router.navigate(['/gallery'], {
      queryParams: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size || 5
      }
    });
  }

  isValidYoutubeEmbedUrl(url: string): boolean {
    const pattern = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/;
    return pattern.test(url);
  }
}
