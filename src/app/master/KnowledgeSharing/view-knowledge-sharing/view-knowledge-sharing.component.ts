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
  selector: 'app-view-knowledge-sharing',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    SafeUrlPipe,
    MatTableModule
  ],
  templateUrl: './view-knowledge-sharing.component.html',
  styleUrls: ['./view-knowledge-sharing.component.scss']
})
export class ViewKnowledgeSharingComponent implements OnInit {

  gallery: any = {};
  knowledgeId!: number;

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
    this.knowledgeId = +this.route.snapshot.paramMap.get('knowledgeId')!;
    const queryParams = this.route.snapshot.queryParamMap;
    this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;

    this.getUserDetails();
  }

  getUserDetails() {
    this.dataprovider.getKnowledgeSharing(this.knowledgeId).subscribe({
      next: (response: any) => {
        console.log(response);

        const fileExtension = response.filename?.split('.').pop()?.toLowerCase();

        if (['png','jpg','jpeg'].includes(fileExtension)) {
          this.dataprovider.getKnowledgeSharingDocById(this.knowledgeId).subscribe(blob => {
            this.gallery = {
              name: response.name,
              source: response.source,
              type: 'image',
              url: URL.createObjectURL(blob),
              caption: response.name || '',
              status: response.status || 0,
              regDate: response.regDate
            };
          });
        } else if (fileExtension === 'pdf') {
          this.dataprovider.getKnowledgeSharingDocById(this.knowledgeId).subscribe(blob => {
            this.gallery = {
              name: response.name,
              source: response.source,
              type: 'pdf',
              url: URL.createObjectURL(blob),
              caption: response.name || '',
              status: response.status || 0,
              regDate: response.regDate
            };
          });
        } else {
          console.warn('Unsupported file type:', fileExtension);
          this.gallery = null;
        }

        // Transaction history: no sorting
        this.transactionhistory = response.transactionhistory || [];
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
    this.router.navigate(['/knowledgesharing'], {
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
      case 1: return 'Active';
      case 2: return 'Inactive';
      case 3: return 'Deleted';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: number | string): string {
    switch (+status) {
      case 1: return 'status-badge active';
      case 2: return 'status-badge inactive';
      case 3: return 'status-badge deleted';
      default: return 'status-badge';
    }
  }
}
