import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { DataProviderService } from '../../service/data-provider.service';
import { MatCardModule } from '@angular/material/card';

interface MailLog {
  mailLogId: number;
  userName: string;
  loginTime: any;
  logoutTime: any;
  bankName: any;
  ipAddress: any;
}



@Component({
  selector: 'app-access-report',
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule],
  templateUrl: './access-report.component.html',
  styleUrl: './access-report.component.scss'
})
export class AccessReportComponent {


  mailLog: MailLog[] = [];
  apiResponse: any = {};
  searchQuery: string = '';
  search: string = '';

  // Pagination
  currentPage: number = 1;
  page: number = 0; // backend is 0-indexed
  recordsPerPage: number = 5;
  size: number = 5;

  // Status Filter
  selectedStatus: string = '';
  statusIndex: number = 0;
  // searchText = '';

  selectedmodules: any[] = [];


  approvePer: string = "N";
  adminApprovePer: string = "N";
  createdBy: any;
  moduleName: string = '';
  showHeaderBar: boolean = true;

  constructor(private dataprovider: DataProviderService, @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      this.createdBy = sessionStorage.getItem('userId');
    }
    if (isPlatformBrowser(this.platformId)) {
      const storedModules = sessionStorage.getItem('selectedModuleDetail');
      console.log(storedModules);
      if (storedModules) {
        const parsed = JSON.parse(storedModules);

        this.moduleName = parsed.name ?? '';

        // Assign values if found, else keep "N"
        this.approvePer = parsed.approvePer ?? "N";
        this.adminApprovePer = parsed.adminApprovePer ?? "N";
      }
    }

    this.route.queryParams.subscribe(params => {
      // read params with fallbacks to current state
      this.currentPage = +((params['currentPage'] ?? this.currentPage)) || 1;
      this.page = this.currentPage - 1; // backend 0-based

      this.statusIndex = +((params['statusIndex'] ?? this.statusIndex)) || 0;
      this.search = (params['searchText'] ?? this.search) || '';

      const incomingSize = +((params['size'] ?? this.size)) || this.size;
      this.size = incomingSize;
      this.recordsPerPage = this.size; // keep UI in sync

      // keep search input and dropdown in sync with URL
      this.searchQuery = this.search;
      this.selectedStatus = this.statusIndex ? String(this.statusIndex) : '';

      // this.getReason();
      this.getUserAccessDetails();
    });
  }




  getUserAccessDetails() {
    this.dataprovider.getUserAccessDetails(this.page, this.size, this.statusIndex, this.search).subscribe(
      (response) => {
        this.apiResponse = response;
        this.mailLog = response.data;

      },
      (error) => {
        console.error('Error fetching Knowledge Sharing details:', error);
      }
    );
  }

  get paginatedUsers(): MailLog[] {
    // Directly return backend-paginated users
    return this.mailLog;
  }

  goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;

    this.currentPage = pageNumber;
    this.page = pageNumber - 1; // Convert to 0-based for backend
    this.getUserAccessDetails();
  }


  goToFirstPage() {
    this.goToPage(1);
  }

  goToLastPage() {
    this.goToPage(this.totalPages);
  }


  onSearch() {
    this.search = this.searchQuery.trim();
    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;

    this.currentPage = 1;
    this.page = 0;
    this.getUserAccessDetails();
  }

  onChangeRecordsPerPage(): void {
    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;

    // Reset search when changing status filter
    this.search = this.searchQuery.trim();
    if (!this.search) {
      this.search = '';
      this.searchQuery = '';
    }

    this.currentPage = 1;
    this.page = 0;
    this.getUserAccessDetails();
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


  pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 5;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }


  get recordSummary(): string {
    const totalRecords = this.apiResponse.totalElements || 0;
    const startRecord = totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    const endRecord = Math.min(this.currentPage * this.recordsPerPage, totalRecords);
    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} record${totalRecords > 1 ? 's' : ''})`;
  }

  get totalPages(): number {
    const total = this.apiResponse.totalElements || 0;
    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

}