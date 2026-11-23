import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { DataProviderService } from '../../../service/data-provider.service';
import { MatCardModule } from '@angular/material/card';
interface EventsAndWebinar {
  eventId: number;
  title: any;
  location: any;
  description : any,
  eventDate: any;
  approval: any;
  bankApproval: any;
  userId: any;
  addedBy: any;
  type: any;
  bankUserId:any;
  name:any;
  status:any;
  bankId:any;
  eventtime:any
  durationHours:any
  durationMinutes:any;

}

@Component({
  selector: 'app-event-and-webinar-index',
  imports: [CommonModule, FormsModule, RouterModule,MatCardModule],
  templateUrl: './event-and-webinar-index.component.html',
  styleUrl: './event-and-webinar-index.component.scss'
})
export class EventAndWebinarIndexComponent {

  eventsAndWebinar: EventsAndWebinar[] = [];
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

    createdBy: any;
  
event: any = {};
userId:any;

  addPer: string = "N";
  editPer: string = "N";
  deletePer: string = "N";
  viewPer: string = "N";
  approvePer: string = "N";
  adminApprovePer: string = "N";
  moduleName: string = '';
  showHeaderBar: boolean = true;

    constructor(private dataprovider: DataProviderService, @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private route: ActivatedRoute) { }
  
    ngOnInit() {
  
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
  
 if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
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

        // this.getReason();
        this.getEventAndWebinar();
      });
    }
  
  
  
  
    getEventAndWebinar() {
      this.dataprovider.getEventAndWebinar(this.page, this.size, this.statusIndex, this.search).subscribe(
        (response) => {
          this.apiResponse = response;
          this.eventsAndWebinar = response.data;
  
        },
        (error) => {
          console.error('Error fetching Gallery details:', error);
        }
      );
    }
  
    get paginatedUsers(): EventsAndWebinar[] {
      // Directly return backend-paginated users
      return this.eventsAndWebinar;
    }
  
    goToPage(pageNumber: number) {
      if (pageNumber < 1 || pageNumber > this.totalPages) return;
  
      this.currentPage = pageNumber;
      this.page = pageNumber - 1; // Convert to 0-based for backend
      this.getEventAndWebinar();
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
      this.getEventAndWebinar();
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
      this.getEventAndWebinar();
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
  
    onDeleteEventAndWebinar(eventId: number) {
  if (confirm('Are you sure you want to delete this Event & Webinar?')) {
    this.dataprovider.deleteEventWebinar(eventId, this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          alert(response.message);
          this.getEventAndWebinar(); // refresh list
        } else {
          alert(response.message); // show backend error
        }
      },
      error: (error) => {
        console.error('Error deleting event/webinar:', error);
      }
    });
  }
}


onApproveEventAndWebinar(eventId: number) {
  if (confirm('Are you sure you want to Approve this Event & Webinar?')) {
    this.dataprovider.approveEventWebinar(eventId, this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          alert(response.message);
          this.getEventAndWebinar(); // refresh list
        } else {
          alert(response.message); // show backend error
        }
      },
      error: (error) => {
        console.error('Error deleting event/webinar:', error);
      }
    });
  }
}

onRevertEventAndWebinar(eventId: number) {
  if (confirm('Are you sure you want to revert this Event / Webinar to Pending?')) {
    this.dataprovider.revertEventWebinar(eventId, this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          alert(response.message);
          this.getEventAndWebinar(); // refresh list
        } else {
          alert(response.message);
        }
      },
      error: (error) => {
        console.error('Error reverting event/webinar:', error);
      }
    });
  }
}

  
    viewEventsAndWebinar(eventId: any) {
      this.router.navigate(['/viewEventsAndWebinar', eventId], {
        queryParams: {
          currentPage: this.currentPage,
            statusIndex: this.statusIndex || null,
            searchText: this.search || null,
            //page: this.page,
            size: this.size || 5
        }
      });
    }
  
    editEventsAndWebinar(eventId: any) {
      this.router.navigate(['/editEventsAndWebinar', eventId], {
        queryParams: {
           currentPage: this.currentPage,
           statusIndex: this.statusIndex || null,
            searchText: this.search || null,
            //page: this.page,
            size: this.size || 5
        }
      });
    }
  
    addEventsAndWebinar() {
      this.router.navigate(['/addEventsAndWebinar'], {
        queryParams: {
           currentPage: this.currentPage,
           statusIndex: this.statusIndex || null,
            searchText: this.search || null,
            //page: this.page,
            size: this.size || 5
        }
      });
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
