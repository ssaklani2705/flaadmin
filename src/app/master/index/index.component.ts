import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { DataProviderService } from '../../service/data-provider.service';
import { Common } from '../../classes/common';
import { MatCardModule } from '@angular/material/card';
import { Bank } from '../../classes/banktype';

interface User {
  bankUserId: number;
  name: string;
  email: string;
  contactNo: string;
  status: number | string;
  bankName: string;
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
  selector: 'app-index',
   imports: [CommonModule, FormsModule, RouterModule,MatCardModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {
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

  common = new Common(); 
  banks: Bank[] = [];  

  bankuser: any = {};
   userId:any;

   moduleName: string = '';
  showHeaderBar: boolean = true;

  constructor(private dataprovider: DataProviderService,@Inject(PLATFORM_ID) private platformId: Object,private router: Router,private route: ActivatedRoute) {}

  ngOnInit() {

this.route.queryParams.subscribe(params => {

      this.currentPage = +((params['currentPage'] ?? this.currentPage)) || 1;
      this.page = this.currentPage - 1; 

      this.statusIndex = +((params['statusIndex'] ?? this.statusIndex)) || 0;
      this.search = (params['searchText'] ?? this.search) || '';

      const incomingSize = +((params['size'] ?? this.size)) || this.size;
      this.size = incomingSize;
      this.recordsPerPage = this.size; 

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

     this.getUserDetails();
     this.getActiveBanks();
    });
  
  }

  getUserDetails() {
    
    this.dataprovider.getUserDetails(this.page, this.size, this.statusIndex, this.search).subscribe(
      (response) => {
        this.apiResponseUserDetails = response;
        this.users = response.data;

      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }


  getActiveBanks() {
    // alert("in");
    // Check if already in session
    const stored = sessionStorage.getItem('banks');
    // alert(stored);
    if (stored) {
      this.banks = JSON.parse(stored);
      return;
    }
  
    // Otherwise fetch from backend
    this.dataprovider.getAllBank().subscribe(
      (response: Bank[]) => {
        this.banks = response;
        // Store in session
        sessionStorage.setItem('banks', JSON.stringify(response));
      },
      (error) => {
        console.error('Error fetching bank Bankss:', error);
      }
    );
  }

  get paginatedUsers(): User[] {
    return this.users;
  }


  goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;

    this.currentPage = pageNumber;
    this.page = pageNumber - 1; 
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

onDeleteBankUser(bankUserId:any) {
   this.bankuser.bankUserId = bankUserId;
   this.bankuser.userId = this.userId ? Number(this.userId) : null;
  if (confirm('Are you sure you want to delete this bank user?')) {
    this.dataprovider.deleteBankUser(this.bankuser).subscribe({
      next: (response) => {
       if (response.success) {
          alert(response.message);  // Success message
          this.getActiveBanks();
          this.getUserDetails();
        } else {
          alert(response.message);  // Backend error message
        }
       // Refresh the list
      },
      error: (error) => {
        console.error('Error deleting Bank user:', error);
      }
    });
  }
}

viewUser(userId: any) {
  console.log('View', userId);
  this.router.navigate(['/view-user', userId], {
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
  this.router.navigate(['/editUser', userId], {
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

  this.router.navigate(['/addUser'], {
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
