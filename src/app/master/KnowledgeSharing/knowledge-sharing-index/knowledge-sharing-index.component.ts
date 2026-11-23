import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { DataProviderService } from '../../../service/data-provider.service';
import { MatCardModule } from '@angular/material/card';
interface KnowledgeSharing {
  knowledge: number;
  name: string;
  approval: any;
  source: any;
  regDate: any;
  status: any;
  bankId:any;
  bankUserId:any;
  bankApproval:any; 
  addedByName:any;
}


@Component({
  selector: 'app-knowledge-sharing-index',
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule],
  templateUrl: './knowledge-sharing-index.component.html',
  styleUrl: './knowledge-sharing-index.component.scss'
})
export class KnowledgeSharingIndexComponent {

  
    knowledgeSharing: KnowledgeSharing[] = [];
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
  
        // this.getReason();
        this.getKnowledgeSharingDetails();


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
  }  if (isPlatformBrowser(this.platformId)) {
    const storedModules = sessionStorage.getItem('selectedModuleDetail');
    if (storedModules) {
      const parsed = JSON.parse(storedModules);

        // Assign values if found, else keep "N"
        this.addPer = parsed.addPer ?? "N";
        this.editPer = parsed.editPer ?? "N";
        this.deletePer = parsed.deletePer ?? "N";
        this.viewPer = parsed.viewPer ?? "N";
        this.approvePer = parsed.approvePer ?? "N";
        this.adminApprovePer = parsed.adminApprovePer ?? "N";
    }
  }

      });
    }
  
  
  
  
    getKnowledgeSharingDetails() {
      this.dataprovider.getKnowledgeSharingDetails(this.page, this.size, this.statusIndex, this.search).subscribe(
        (response) => {
          this.apiResponse = response;
          this.knowledgeSharing = response.data;
  
        },
        (error) => {
          console.error('Error fetching Knowledge Sharing details:', error);
        }
      );
    }
  
    get paginatedUsers(): KnowledgeSharing[] {
      // Directly return backend-paginated users
      return this.knowledgeSharing;
    }
  
    goToPage(pageNumber: number) {
      if (pageNumber < 1 || pageNumber > this.totalPages) return;
  
      this.currentPage = pageNumber;
      this.page = pageNumber - 1; // Convert to 0-based for backend
      this.getKnowledgeSharingDetails();
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
      this.getKnowledgeSharingDetails();
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
      this.getKnowledgeSharingDetails();
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
  


  onApproveKnowledge(knowledgeId: number) {
  if (confirm('Are you sure you want to Approve this Knowledge Sharing?')) {
    this.dataprovider.approveKnowledge(knowledgeId, this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          alert(response.message);
          this.getKnowledgeSharingDetails(); // refresh list
        } else {
          alert(response.message); // show backend error
        }
      },
      error: (error) => {
        console.error('Error Approve Knowledge Sharing:', error);
      }
    });
  }
}


onRevertKnowledge(knowledgeId: number) {
  if (confirm('Are you sure you want to Pending this Knowledge Sharing to Pending?')) {
    this.dataprovider.revertKnowledge(knowledgeId, this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          alert(response.message);
          this.getKnowledgeSharingDetails(); // refresh list
        } else {
          alert(response.message); // show backend error
        }
      },
      error: (error) => {
        console.error('Error reverting Knowledge Sharing:', error);
      }
    });
  }
}

// onRevertEventAndWebinar(eventId: number) {
//   if (confirm('Are you sure you want to revert this Event / Webinar to Pending?')) {
//     this.dataprovider.revertEventWebinar(eventId, this.userId).subscribe({
//       next: (response) => {
//         if (response.success) {
//           alert(response.message);
//           this.getEventAndWebinar(); // refresh list
//         } else {
//           alert(response.message);
//         }
//       },
//       error: (error) => {
//         console.error('Error reverting event/webinar:', error);
//       }
//     });
//   }
// }



 deleteKnowledge(knowledgeId: number) {
  if (confirm('Are you sure you want to Delete this Knowledge Sharing?')) {
    this.dataprovider.deleteKnowledge(knowledgeId, this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          alert(response.message);
          this.getKnowledgeSharingDetails(); // refresh list
        } else {
          alert(response.message); // show backend error
        }
      },
      error: (error) => {
        console.error('Error Delete Knowledge Sharing:', error);
      }
    });
  }
}

    onDeleteUser(userId: number) {
      // if (confirm('Are you sure you want to delete this user?')) {
      //   this.dataprovider.deleteUser(userId,this.createdBy).subscribe({
      //     next: (response) => {
      //       alert("User deleted successfully");
      //       console.log('User deleted successfully:', response);
      //       this.getUserDetails(); // Refresh the list
      //     },
      //     error: (error) => {
      //       console.error('Error deleting user:', error);
      //     }
      //   });
      // }
    }
  
    viewKnowledgeSharing(knowledgeId: any) {
      this.router.navigate(['/viewKnowledgeSharing', knowledgeId], {
        queryParams: {
          currentPage: this.currentPage,
            statusIndex: this.statusIndex || null,
            searchText: this.search || null,
            //page: this.page,
            size: this.size || 5
        }
      });
    }
  
    editKnowledgeSharing(knowledgeId: any) {
      // alert("test");
      this.router.navigate(['/editKnowledgeSharing', knowledgeId], {
        queryParams: {
           currentPage: this.currentPage,
           statusIndex: this.statusIndex || null,
            searchText: this.search || null,
            //page: this.page,
            size: this.size || 5
        }
      });
    }
   
    addKnowledgeSharing() {
      this.router.navigate(['/addKnowledgeSharing'], {
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
