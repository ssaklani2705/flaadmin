  import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
  import { CommonModule, isPlatformBrowser } from '@angular/common';
  import { ActivatedRoute, Router } from '@angular/router';
  import { MatCardModule } from '@angular/material/card';
  import { MatFormFieldModule } from '@angular/material/form-field';
  import { MatInputModule } from '@angular/material/input';
  import { MatButtonModule } from '@angular/material/button';
  import { MatIconModule } from '@angular/material/icon';
  import { MatTableModule } from '@angular/material/table';
  import { MatSortModule } from '@angular/material/sort';
  import { MatListModule } from '@angular/material/list';
  import { Common } from '../../../classes/common';
  import { DataProviderService } from '../../../service/data-provider.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MediaPreviewDialogComponent } from '../../../pages/media-preview-dialog/media-preview-dialog.component';
import { SafeUrlPipe } from '../../../classes/SafeUrlPipe';


  // safeDescription!: SafeHtml;
  @Component({
    selector: 'app-view-event-and-webinar',
    imports: [
      CommonModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatIconModule,
      MatTableModule,
      MatSortModule,
      MatListModule, 
       MatTabsModule,
       MatRadioModule,
       FormsModule,
       MatDialogModule,
       MatDialogModule,
       SafeUrlPipe
    ],
    templateUrl: './view-event-and-webinar.component.html',
    styleUrl: './view-event-and-webinar.component.scss'
  })
  export class ViewEventAndWebinarComponent {

safeDescription!: SafeHtml;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    
  eventId:any;
    currentPage = 0;
    searchText = '';
    statusIndex = 0;
    page = 0;
    size = 0;
    bank: any = {};
    transactionhistory: any[] = []; // ✅ initialized to avoid undefined error
    common = new Common();  
    eventImageUrl: string | null = null;  // store image URL/base64

    
    userId: any;
    username: any;

  addPer: string = "N";
  editPer: string = "N";
  deletePer: string = "N";
  viewPer: string = "N";
  approvePer: string = "N";
  adminApprovePer: string = "N";
  moduleName: string = '';

    constructor(
      private route: ActivatedRoute,
      private dataprovider: DataProviderService,
      private router: Router,
      private sanitizer: DomSanitizer,
      @Inject(PLATFORM_ID) private platformId: Object,
      private dialog: MatDialog
    ) {}

// galleryImages: string[] = [
//   'assets/gallery/img1.jpg',
//   'assets/gallery/img2.jpg',
//   'assets/gallery/img3.jpg'
// ];



    ngOnInit(): void {
      this.eventId = +this.route.snapshot.paramMap.get('eventId')!;
      const queryParams = this.route.snapshot.queryParamMap;
    this.currentPage = Number(queryParams.get('currentPage')) || 1;
      this.searchText = queryParams.get('searchText') || '';
      this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
      this.page = Number(queryParams.get('page')) || this.currentPage -1;
      this.size = Number(queryParams.get('size')) || 5;
    
      this.getEventWebinar();

        if (isPlatformBrowser(this.platformId)) {
        this.userId = sessionStorage.getItem('userId');
        this.username = sessionStorage.getItem('username');
      }

if (isPlatformBrowser(this.platformId)) {
    const storedModules = sessionStorage.getItem('selectedModuleDetail');
    if (storedModules) {
      const parsed = JSON.parse(storedModules);

      this.moduleName = parsed.name ?? '';

        // Assign values if found, else keep "N"
        this.addPer = parsed.addPer ?? "N";
        this.editPer = parsed.editPer ?? "N";
        this.deletePer = parsed.deletePer ?? "N";
        this.viewPer = parsed.viewPer ?? "N";
        this.approvePer = parsed.approvePer ?? "N";
        this.adminApprovePer = parsed.adminApprovePer ?? "N";
    }
  }

     this.loadGallery();
      
    }


    getEventWebinar() {
    this.dataprovider.getEventWebinar(this.eventId).subscribe({
      next: (response) => {
        console.log(response);

        // Always call image API
        this.dataprovider.getEventImageById(response.eventId).subscribe({
          next: (blob) => {
            const objectURL = URL.createObjectURL(blob);
            this.bank = {
              title: response.title,
              eventDate: response.eventDate,
              time: response.eventtime,
              type: response.type === 1 ? 'event' : 'webinar',
              imageUrl: objectURL,                  // For <img>
              videoUrl: response.videoUrl || null,  // Only for webinars
              location: response.location || '',
              link: response.link || '',
              shortDescription: response.shortDesc || '',
              description: response.description || '',
              status: response.status,
              addedBy: response.addedBy,
              bankName: response.name,
              filename: response.filename,
              durationHours: response.durationHours,
              durationMinutes: response.durationMinutes

            };
             // ✅ Sanitize description for safe rendering
          this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(
            response.description || ''
          );
          },
          error: (err) => {
            console.error('Failed to fetch event image', err);
          }
        });

        // ✅ Common history sorting
        this.transactionhistory = (response.history || []).sort((a: any, b: any) => {
          const dateA = this.common.parseEntryDate(a.entryDate);
          const dateB = this.common.parseEntryDate(b.entryDate);
          return dateB.getTime() - dateA.getTime();
        });
      },
      error: (err) => {
        console.error('Failed to fetch Event/Webinar details', err);
      }
    });
  }


    formatTime(date: Date): string {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }


  get hasTransactionHistory(): boolean {
    return Array.isArray(this.transactionhistory) && this.transactionhistory.length > 0;
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


getStatusLabel(status: number | string): string {
      switch (+status) {
        case 1:
          return 'Active';
        case 2:
          return 'Inactive';
        case 3:
          return 'Deleted';
        default:
          return 'Unknown';
      }
    }
  
    getStatusClass(status: number | string): string {
      switch (+status) {
        case 1:
          return 'status-badge active';
        case 2:
          return 'status-badge inactive';
        case 3:
          return 'status-badge deleted';
        default:
          return 'status-badge';
      }
    }


    //Evente Gallery 
   
  uploadType: string = '1'; // '1' = Image, '2' = Video
  selectedFile!: File;
  videoUrl: string = '';
  caption: string = '';
  galleryImages: any[] = [];
  selectedImage: any;



  // onFileSelected(event: any) {
  //   if (event.target.files.length > 0) {
  //     this.selectedFile = event.target.files[0];
  //   }
  // }

 selectedFileName = '';
  onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    this.selectedFileName = file.name;
  } else {
    this.selectedFile = null!;
    this.selectedFileName = '';
  }
}

onUploadTypeChange() {
  this.selectedFile = null!;
  this.selectedFileName = '';
  this.videoUrl = '';

  // reset the hidden file input if it exists
  const fileInput = document.querySelector<HTMLInputElement>('#fileInput');
  if (fileInput) {
    fileInput.value = '';
  }
}

  uploadContent() {

      if (this.uploadType === '1' && !this.selectedFile) {
    alert('Please select an image');
    return;
  }

  if (this.uploadType === '2') {
    if (!this.videoUrl) {
      alert('Please enter video URL');
      return;
    }

    // // ✅ Strict pattern check (embed links only)
    // const youtubePattern = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/;
    // if (!youtubePattern.test(this.videoUrl)) {
    //   alert('Please enter a valid YouTube embed URL');
    //   return;
    // }
     // ✅ Accepts normal, short, and embed YouTube URLs
  const ytPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/).+/;
  if (!ytPattern.test(this.videoUrl.trim())) {
    alert('Please enter a valid YouTube URL');
    return;
  }
  }

  // if (!this.caption || this.caption.trim() === '') {
  //   alert('Please enter Caption');
  //   return;
  // }

    const formData = new FormData();
    formData.append('type', this.uploadType);
    formData.append('caption', this.caption);
    formData.append('eventId', this.eventId);
    // formData.append('userId', '1'); // Replace with actual user ID

    if (this.uploadType === '1') {
      formData.append('file', this.selectedFile);
    } else if (this.uploadType === '2') {
      
  // ✅ Append rel=0 if not present
  let url = this.videoUrl.trim();
  if (!/[?&]rel=0/.test(url)) {
    url += url.includes('?') ? '&rel=0' : '?rel=0';
  }
  formData.append('videoUrl', url);
      // formData.append('videoUrl', this.videoUrl);
    }
    formData.append('userId', this.userId);
    formData.append('username', this.username);

    this.dataprovider.addImgOrVideo(formData).subscribe({
      next: (res: any) => {
        alert(res.message);
       this.loadGallery(); // Reload gallery after upload
        // Clear inputs after successful upload
      this.selectedFile = null!;
      this.videoUrl = '';
      this.caption = '';
      this.selectedImage = null;
      // Optionally reset upload type to default
      this.uploadType = '1';

        // Clear after successful upload
    if (this.uploadType === '1') {
      this.fileInput.nativeElement.value = '';
      this.selectedFileName = '';
      this.selectedFile = null!;
    }

      // Reset file input element
      // const fileInput = document.querySelector<HTMLInputElement>('#fileInput');
      // if (fileInput) {
      //   fileInput.value = '';
      //    this.selectedFileName='';
      // }
      },
      error: (err) => {
        console.error(err);
        alert('Upload failed');
      }
    });
  }

  // loadGallery() {
  //   this.dataprovider.getEventGalleyByAddedBy(this.userId).subscribe({ 
  //     next: (res: any) => {
  //       this.galleryImages = res;
  //     }
  //   });
  // }

  loadGallery() {
  this.dataprovider.getEventGalleyByAddedBy(this.userId,this.eventId).subscribe({ 
    next: (res: any) => {
      this.galleryImages = res;

      // Loop through each item and load the actual media URL
      this.galleryImages.forEach((item: any) => {
        if (item.type === 1) { // Image
          this.dataprovider.getEventGalleryById(item.id).subscribe({
            next: (blob: Blob) => {
              item.url = URL.createObjectURL(blob); // assign blob URL
            },
            error: (err) => {
              console.error('Failed to load image for item id', item.id, err);
              item.url = ''; // fallback if failed
            }
          });
        } else if (item.type === 2) { // Video
          // If your API gives video URL or filename, bind it directly
          item.url = item.filename; 
        }
      });
    },
    error: (err) => {
      console.error('Failed to fetch gallery list', err);
    }
  });
}


  openLightbox(item: any) {
    this.selectedImage = item;
  }

  closeLightbox() {
    this.selectedImage = null;
  }


// viewInLightbox(item: any) {
//   this.selectedImage = item;
// }



approveItem(item: any) {
  // Call your API to approve
  console.log('Approved:', item);
  alert('Approved successfully');
}


// viewInLightbox(item: any) {
//   this.dataprovider.getEventGalleryById(item.id).subscribe({
//     next: (blob: Blob) => {
//       const mediaUrl = URL.createObjectURL(blob);

//       this.dialog.open(MediaPreviewDialogComponent, {
//         width: '700px',
//         // height: '500px',
//         data: { 
//           ...item, 
//           url: mediaUrl   // ✅ now coming from Blob
//         }
//       });
//     },
//     error: (err) => {
//       console.error('Failed to load media:', err);
//       alert('Could not load media.');
//     }
//   });
// }

viewInLightbox(item: any) {
  // If type is YouTube video (type=2 and filename is a URL starting with "http")
  if (item.type === 2 && item.filename?.startsWith('http')) {
    this.dialog.open(MediaPreviewDialogComponent, {
      width: '1000px',
      data: {
        ...item,
        url: item.filename // direct URL
      }
    });
    return;
  }

  // Otherwise, fetch media as Blob (uploaded image/video)
  this.dataprovider.getEventGalleryById(item.id).subscribe({
    next: (blob: Blob) => {
      const mediaUrl = URL.createObjectURL(blob);

      this.dialog.open(MediaPreviewDialogComponent, {
        width: '1000px',
        data: {
          ...item,
          url: mediaUrl
        }
      });
    },
    error: (err) => {
      console.error('Failed to load media:', err);
      alert('Could not load media.');
    }
  });
}



onApproveEventGallery(eventGalleryId: number) {
  if (confirm('Are you sure you want to Approve this Event & Webinar Gallery?')) {
    this.dataprovider.onApproveEventGallery(eventGalleryId, this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          alert(response.message);
          this.loadGallery(); // refresh list
        } else {
          alert(response.message); // show backend error
        }
      },
      error: (error) => {
        console.error('Error Approving event/webinar Gallery:', error);
      }
    });
  }
}

onRevertEventGallery(eventGalleryId: number) {
  if (confirm('Are you sure you want to Revert this Event & Webinar Gallery to Pending?')) {
    this.dataprovider.onRevertEventGallery(eventGalleryId, this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          alert(response.message);
          this.loadGallery(); // refresh list
        } else {
          alert(response.message); // show backend error
        }
      },
      error: (error) => {
        console.error('Error reverting event/webinar Gallery:', error);
      }
    });
  }
}



onDeleteGallery(eventGalleryId: number) {
  if (confirm('Are you sure you want to delete this Event & Webinar Gallery?')) {
    this.dataprovider.deleteEventGallery(eventGalleryId).subscribe({
      next: (response) => {
        if (response.message) {
          alert(response.message);
          this.loadGallery(); // refresh the gallery list
        }
      },
      error: (error) => {
        console.error('Error deleting gallery:', error);
        alert('Failed to delete gallery');
      }
    });
  }
}


  }
