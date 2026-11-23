import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SafeUrlPipe } from '../../../classes/SafeUrlPipe';
import { DataProviderService } from '../../../service/data-provider.service';
import { Common } from '../../../classes/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-view-gallery',
  imports: [  CommonModule,MatFormFieldModule,MatInputModule,MatButtonModule,SafeUrlPipe,
     MatInputModule,
    MatButtonModule,
    MatCardModule,
      MatTableModule,   // 👈 add this
    // MatSortModule,    // 👈 add if using mat-sort-header
  ],
  templateUrl: './view-gallery.component.html',
  styleUrl: './view-gallery.component.scss'
})
export class ViewGalleryComponent {
 gallery: any = {};
 galleryId!: number;

  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;

    transactionhistory: any[] = []; 
    common = new Common(); 

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router
  ) {}
  ngOnInit(): void {
     this.galleryId = +this.route.snapshot.paramMap.get('galleryId')!;
     const queryParams = this.route.snapshot.queryParamMap;
     this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;
    // For demo: fetch gallery object from API or route resolver
    // this.gallery = {
    //   type: 1, // 1 = Image, 2 = Video
    //   imageUrl: 'assets/logo/logo.jpg',
    //   videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    //   caption: 'Sample caption for gallery'
    // };

    this.getUserDetails();
  }

// getUserDetails() {
//     this.dataprovider.getGalleryById(this.galleryId).subscribe({
//       next: (response) => {
//         console.log(response);
//         this.gallery = {
//           type: response.iType,
//           videoUrl: response.videoUrl,
//           caption: response.sCaption,
//           status: response.iStatus,
//           regDate: response.tsRegDate
//         };

//       },
//       error: (err) => {
//         console.error('Failed to fetch user details', err);
//       }
//     });
//   }
getUserDetails() {
  this.dataprovider.getGalleryById(this.galleryId).subscribe({
    next: (response) => {
      console.log(response);

      if (response.iType === 1) {
        // Call image API
        this.dataprovider.getGalleryImage(response.iGalleryId).subscribe(blob => {
          const objectURL = URL.createObjectURL(blob);
          this.gallery = {
            type: response.iType,
            imageUrl: objectURL,   // Now ready for <img>
            caption: response.sCaption,
            status: response.iStatus,
            regDate: response.tsRegDate
          };
        });
      } else {
        this.gallery = {
          type: response.iType,
          videoUrl: response.videoUrl,
          caption: response.sCaption,
          status: response.iStatus,
          regDate: response.tsRegDate
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
}