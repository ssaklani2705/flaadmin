import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { DataProviderService } from '../../../service/data-provider.service';
import { MatCardModule } from '@angular/material/card';
interface User {
  userId: number;
  firstName: string;
  email: string;
  mobile: string;
  status: number | string;
}

interface MenuItem {
  moduleId?: number;
  label: string;
  icon?: string;
  route?: string;
  expanded?: boolean;
  children?: MenuItem[];
}


@Component({
  selector: 'app-user-management-index',
   imports: [CommonModule, FormsModule, RouterModule, MatCardModule],
  templateUrl: './user-management-index.component.html',
  styleUrl: './user-management-index.component.scss'
})  
export class UserManagementIndexComponent {

 users: User[] = [];
  apiResponseUserDetails: any = {};
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

  addPer: string = "N";
  editPer: string = "N";
  deletePer: string = "N";
  viewPer: string = "N";
  approvePer: string = "N";
  adminApprovePer: string = "N";
  createdBy:any;
  moduleName: string = '';
  showHeaderBar: boolean = true;

  constructor(private dataprovider: DataProviderService,@Inject(PLATFORM_ID) private platformId: Object,private router: Router,private route: ActivatedRoute) {}

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
        this.addPer = parsed.addPer ?? "N";
        this.editPer = parsed.editPer ?? "N";
        this.deletePer = parsed.deletePer ?? "N";
        this.viewPer = parsed.viewPer ?? "N";
        this.approvePer = parsed.approvePer ?? "N";
        this.adminApprovePer = parsed.adminApprovePer ?? "N";
    }
  }

  
  //   this.route.queryParams.subscribe(params => {
  //   this.currentPage = +params['currentPage'] || 1;
  //   // this.pageSize = +params['pageSize'] || 10;
  //   this.statusIndex = +params['statusIndex'] || 0;
  //   this.search = params['searchText'] || '';
  // });
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
     this.getUserDetails();
    });
   // this.getUserDetails();
  }




  getUserDetails() {
    //alert("page :"+this.page+" size :"+this.size);
    this.dataprovider.getUserManagementDetails(this.page, this.size, this.statusIndex, this.search).subscribe(
      (response) => {
        this.apiResponseUserDetails = response;
        this.users = response.data;

         if (isPlatformBrowser(this.platformId)) {
          // sessionStorage.setItem('userDetails', JSON.stringify(response));
          sessionStorage.setItem('processList', JSON.stringify(response.processList));
          // sessionStorage.setItem('userList', JSON.stringify(response.data));
          
        }
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  get paginatedUsers(): User[] {
    // Directly return backend-paginated users
    return this.users;
  }

  // get totalPages(): number {
  //   return Math.ceil((this.apiResponseUserDetails.totalElements || 0) / this.recordsPerPage);
  // }

  goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;

    this.currentPage = pageNumber;
    this.page = pageNumber - 1; // Convert to 0-based for backend
    this.getUserDetails();
  }



goToFirstPage() {
  this.goToPage(1);
}

goToLastPage() {
  this.goToPage(this.totalPages);
}


  onSearch() {
    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;
    this.getUserDetails();
  }

  onChangeRecordsPerPage(): void {
    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;
    this.currentPage = 1;
    this.page = 0;
    this.getUserDetails();
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

onDeleteUser(userId: number) {
  if (confirm('Are you sure you want to delete this user?')) {
    this.dataprovider.deleteUserManagement(userId,this.createdBy).subscribe({
      next: (response) => {
        alert("User deleted successfully");
        console.log('User deleted successfully:', response);
        this.getUserDetails(); // Refresh the list
      },
      error: (error) => {
        console.error('Error deleting user:', error);
      }
    });
  }
}

viewUser(userId: any) {
  console.log('View', userId);
  this.router.navigate(['/viewUserManagement', userId], {
    queryParams: {
      currentPage: this.currentPage,
        statusIndex: this.statusIndex || null,
        searchText: this.search || null,
        //page: this.page,
        size: this.size || 5
    }
  });
}

editUser(userId: any) {
  console.log('Edit', userId);
  this.router.navigate(['/editUserManagement', userId], {
    queryParams: {
       currentPage: this.currentPage,
       statusIndex: this.statusIndex || null,
        searchText: this.search || null,
        //page: this.page,
        size: this.size || 5
    }
  });
}

addUser() {
  // console.log('Edit', userId);
  this.router.navigate(['/addUserManagement'], {
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
    const totalRecords = this.apiResponseUserDetails.totalElements || 0;
    const startRecord = totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    const endRecord = Math.min(this.currentPage * this.recordsPerPage, totalRecords);
    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} record${totalRecords > 1 ? 's' : ''})`;
  }

  get totalPages(): number {
    const total = this.apiResponseUserDetails.totalElements || 0;
    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

}
