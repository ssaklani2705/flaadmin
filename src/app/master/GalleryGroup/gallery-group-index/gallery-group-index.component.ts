import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Common } from '../../../classes/common';
import { DataProviderService } from '../../../service/data-provider.service';
import { BankType } from '../../../classes/banktype';

interface Bank {
  groupId: number;
  name: string;
  status: number;
  date: string;
}

@Component({
  selector: 'app-gallery-group-index',
  imports: [CommonModule, FormsModule, RouterModule,MatCardModule],
  templateUrl: './gallery-group-index.component.html',
  styleUrl: './gallery-group-index.component.scss'
})
export class GalleryGroupIndexComponent {
 banks: Bank[] = [];
  apiResponseBankDetails: any = {};
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


  selectedmodules: any[] = [];

  createdBy:any;

  common = new Common(); 
  bankTypes: BankType[] = [];  
  group: any = {};
  userId:any;

  addPer: string = "N";
  editPer: string = "N";
  deletePer: string = "N";
  viewPer: string = "N";
  approvePer: string = "N";
  adminApprovePer: string = "N";
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

     this.getGalleryGroupDetails();
    //  this.getActiveBankTypes();
    });
  
  }

  getGalleryGroupDetails() {
    this.dataprovider.getGalleryGroupDetails(this.page, this.size, this.statusIndex, this.search).subscribe(
      (response) => {
        this.apiResponseBankDetails = response;
        this.banks = response.data;
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

getActiveBankTypes() {
  // alert("in");
  // Check if already in session
  const stored = sessionStorage.getItem('bankTypes');
  // alert(stored);
  if (stored) {
    this.bankTypes = JSON.parse(stored);
    return;
  }

  // Otherwise fetch from backend
  this.dataprovider.getBankType().subscribe(
    (response: BankType[]) => {
      this.bankTypes = response;
      // Store in session
      sessionStorage.setItem('bankTypes', JSON.stringify(response));
    },
    (error) => {
      console.error('Error fetching bank types:', error);
    }
  );
}

  get paginatedBanks(): Bank[] {
    return this.banks;
  }


  goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;

    this.currentPage = pageNumber;
    this.page = pageNumber - 1; 
    this.getGalleryGroupDetails();
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
    this.getGalleryGroupDetails();
  }

  onChangeRecordsPerPage(): void {
    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;
    this.currentPage = 1;
    this.page = 0;
    this.getGalleryGroupDetails();
  }

onDeleteBank(groupId:any) {
   this.group.groupId = groupId;
   this.group.userId = this.userId ? Number(this.userId) : null;
  if (confirm('Are you sure you want to delete this Group?')) {
    this.dataprovider.deleteGroup(this.group).subscribe({
      next: (response) => {
       if (response.success) {
          alert(response.message);  // Success message
          this.getGalleryGroupDetails(); 
        } else {
          alert(response.message);  // Backend error message
        }
       // Refresh the list
      },
      error: (error) => {
        console.error('Error deleting Group:', error);
      }
    });
  }
}

getActiveBanks() {
      sessionStorage.removeItem('banks');
      // Otherwise fetch from backend
      this.dataprovider.getAllBank().subscribe(
        (response: Bank[]) => {
          sessionStorage.setItem('banks', JSON.stringify(response));
        },
        (error) => {
          console.error('Error fetching Banks:', error);
        }
      );
    }

viewBank(bankId: any) {
  console.log('View', bankId);
  this.router.navigate(['/view-gallery-group', bankId], {
    queryParams: {
      currentPage: this.currentPage,
        statusIndex: this.statusIndex || null,
        searchText: this.search || null,
        //page: this.page,
        size: this.size || 5
    }
  });
}

editBank(groupId: any) {
  console.log('Edit', groupId);
  this.router.navigate(['/edit-gallery-group', groupId], {
    queryParams: {
       currentPage: this.currentPage,
       statusIndex: this.statusIndex || null,
        searchText: this.search || null,
        //page: this.page,
        size: this.size || 5
    }
  });
}

addBank() {

  this.router.navigate(['/add-gallery-group'], {
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
    const totalRecords = this.apiResponseBankDetails.totalElements || 0;
    const startRecord = totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    const endRecord = Math.min(this.currentPage * this.recordsPerPage, totalRecords);
    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} record${totalRecords > 1 ? 's' : ''})`;
  }
  get totalPages(): number {
    const total = this.apiResponseBankDetails.totalElements || 0;
    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

}
