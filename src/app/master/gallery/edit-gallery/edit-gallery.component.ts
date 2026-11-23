import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SafeUrlPipe } from '../../../classes/SafeUrlPipe';
import { DataProviderService, GroupDTO } from '../../../service/data-provider.service';
import { Common } from '../../../classes/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    SafeUrlPipe,
    MatCardModule,
    FormsModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './edit-gallery.component.html',
  styleUrl: './edit-gallery.component.scss'
})
export class EditGalleryComponent implements OnInit {
  gallery: any = { caption: '' };   // 👈 ensure caption is always a string
  galleryId!: number;

  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;

  userId: any;
  transactionhistory: any[] = [];
  common = new Common();

  fileError: string | null = null;
  videoTouched = false;


  groups: GroupDTO[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.galleryId = +this.route.snapshot.paramMap.get('galleryId')!;
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
    this.getUserDetails();
  }

  getUserDetails() {
    this.dataprovider.getGalleryById(this.galleryId).subscribe({
      next: (response) => {
        if (response.iType === 1) {
          this.dataprovider.getGalleryImage(response.iGalleryId).subscribe(blob => {
            const objectURL = URL.createObjectURL(blob);
            this.gallery = {
              galleryId: response.iGalleryId,
              type: response.iType,
              imageUrl: objectURL,
              caption: response.sCaption || '',
              status: response.iStatus,
              regDate: response.tsRegDate,
              groupId: response.groupId
            };
          });
        } else {
          this.gallery = {
            galleryId: response.iGalleryId,
            type: response.iType,
            videoUrl: response.videoUrl,
            caption: response.sCaption || '',
            status: response.iStatus,
            regDate: response.tsRegDate,
            groupId: response.groupId
          };
        }

        this.transactionhistory = (response.history || []).sort((a: any, b: any) => {
          const dateA = this.common.parseEntryDate(a.entryDate);
          const dateB = this.common.parseEntryDate(b.entryDate);
          return dateB.getTime() - dateA.getTime();
        });
      },
      error: (err) => {
        console.error('Failed to fetch gallery details', err);
      }
    });
  }

  get hasTransactionHistory(): boolean {
    return Array.isArray(this.transactionhistory) && this.transactionhistory.length > 0;
  }

  backToIndexPage() {
    this.router.navigate(['/gallery'], {
      queryParams: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size || 5
      }
    });
  }


  onSubmit(form: any) {
    if (form.invalid || this.fileError) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.gallery.groupId == "0") {
      alert("Please Select Group");
      return;
    }


    const formData = new FormData();
    formData.append('iGalleryId', this.gallery.galleryId);
    formData.append('sCaption', this.gallery.caption);
    formData.append('iType', this.gallery.type);
    formData.append('iUserId', this.userId);
    formData.append('iStatus', this.gallery.status);
    formData.append('groupId', this.gallery.groupId || '');

    if (this.gallery.file) {
      formData.append('file', this.gallery.file);
    }

    if (this.gallery.type === 2 && this.gallery.videoUrl) {
      // ✅ Add ?rel=0 if missing
      let cleanUrl = this.gallery.videoUrl.trim();
      if (!cleanUrl.includes('?rel=0')) {
        cleanUrl += cleanUrl.includes('?') ? '&rel=0' : '?rel=0';
      }

      formData.append('videoUrl', cleanUrl);



    }

    this.dataprovider.updateGallery(formData).subscribe({
      next: (res) => {
        alert(res.message);
        this.backToIndexPage();
      },
      error: (err) => {
        alert(err.error.message || 'Error occurred');
      }
    });
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


  onReset(form: any) {
    form.resetForm();
    this.getUserDetails();
    this.gallery.file = null;
    this.fileError = null;
    this.videoTouched = false;

    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    this.fileError = null;

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Only .jpg, .jpeg, .png files are allowed.';
        this.gallery.file = null;
        input.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.fileError = 'File size must not exceed 5 MB.';
        this.gallery.file = null;
        input.value = '';
        return;
      }

      this.gallery.file = file;

      // const reader = new FileReader();
      // reader.onload = (e: any) => {
      //   this.gallery.imageUrl = e.target.result;
      // };
      // reader.readAsDataURL(file);
    }
  }
}
