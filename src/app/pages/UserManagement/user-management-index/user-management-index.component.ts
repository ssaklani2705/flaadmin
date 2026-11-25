import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { DataProviderService } from '../../../service/data-provider.service';

interface User {
  userId: number;
  firstName: string;
  email: string;
  mobile: string;
  status: number | string;
}

@Component({
  selector: 'app-user-management-index',
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule],
  templateUrl: './user-management-index.component.html',
  styleUrl: './user-management-index.component.scss',
})
export class UserManagementIndexComponent implements OnInit, OnDestroy {
  /** sessionStorage key for this list's state */
  private readonly STATE_KEY = 'userManagementIndexState';
  private readonly DEFAULT_SIZE = 5;

  /**
   * Routes that belong to this module. Going to any of these keeps the saved
   * state. Going anywhere else (another module) destroys it.
   * Adjust to your real route paths.
   */
  private readonly MODULE_ROUTES = [
    '/viewUserManagement',
    '/editUserManagement',
    '/addUserManagement',
  ];

  private routerSub?: Subscription;

  users: User[] = [];
  apiResponseUserDetails: any = {};
  searchQuery = '';
  search = '';

  // Pagination (backend is 0-indexed)
  currentPage = 1;
  page = 0;
  recordsPerPage = 5;
  size = 5;

  // Status filter
  selectedStatus = '';
  statusIndex = 0;

  selectedmodules: any[] = [];

  addPer = 'N';
  editPer = 'N';
  deletePer = 'N';
  viewPer = 'N';
  approvePer = 'N';
  adminApprovePer = 'N';
  createdBy: any;
  moduleName = '';
  showHeaderBar = true;

  constructor(
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
  ) {}

  // ===== Lifecycle =====
  ngOnInit() {
    this.loadState();

    if (isPlatformBrowser(this.platformId)) {
      this.createdBy = sessionStorage.getItem('userId');

      const storedModules = sessionStorage.getItem('selectedModuleDetail');
      if (storedModules) {
        const parsed = JSON.parse(storedModules);
        this.moduleName = parsed.name ?? '';
        this.addPer = parsed.addPer ?? 'N';
        this.editPer = parsed.editPer ?? 'N';
        this.deletePer = parsed.deletePer ?? 'N';
        this.viewPer = parsed.viewPer ?? 'N';
        this.approvePer = parsed.approvePer ?? 'N';
        this.adminApprovePer = parsed.adminApprovePer ?? 'N';
      }

      // Destroy the saved state when navigating to another module
      this.routerSub = this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          const url = event.url.split('?')[0];
          const staysInModule = this.MODULE_ROUTES.some((r) =>
            url.startsWith(r),
          );
          if (!staysInModule) {
            this.clearState();
          }
        }
      });
    }

    this.getUserDetails();
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  // ===== Session state =====
  private loadState() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const s = JSON.parse(sessionStorage.getItem(this.STATE_KEY) || '{}');
        this.currentPage = +s.currentPage || 1;
        this.statusIndex = +s.statusIndex || 0;
        this.search = s.search || '';
      } catch {
        /* ignore corrupted state */
      }
    }
    this.size = this.DEFAULT_SIZE;
    this.page = this.currentPage - 1;
    this.recordsPerPage = this.size;
    this.searchQuery = this.search;
    this.selectedStatus = this.statusIndex ? String(this.statusIndex) : '';
  }

  private saveState() {
    if (!isPlatformBrowser(this.platformId)) return;
    sessionStorage.setItem(
      this.STATE_KEY,
      JSON.stringify({
        currentPage: this.currentPage,
        size: this.size,
        statusIndex: this.statusIndex,
        search: this.search,
      }),
    );
  }

  private clearState() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.STATE_KEY);
    }
  }

  // ===== Data =====
  getUserDetails() {
    this.saveState();

    this.dataprovider
      .getUserManagementDetails(
        this.page,
        this.size,
        this.statusIndex,
        this.search,
      )
      .subscribe({
        next: (response) => {
          // If the last record of a page was deleted, step back one page
          if (
            (!response.data || response.data.length === 0) &&
            this.currentPage > 1
          ) {
            this.goToPage(this.currentPage - 1);
            return;
          }

          this.apiResponseUserDetails = response;
          this.users = response.data;

          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem(
              'processList',
              JSON.stringify(response.processList),
            );
          }
        },
        error: (error) => console.error('Error fetching user details:', error),
      });
  }

  get paginatedUsers(): User[] {
    return this.users;
  }

  // ===== Pagination =====
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

  pages(): number[] {
    const delta = 5;
    const start = Math.max(1, this.currentPage - delta);
    const end = Math.min(this.totalPages, this.currentPage + delta);
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }

  get recordSummary(): string {
    const totalRecords = this.apiResponseUserDetails.totalElements || 0;
    const startRecord =
      totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    const endRecord = Math.min(
      this.currentPage * this.recordsPerPage,
      totalRecords,
    );
    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} record${totalRecords > 1 ? 's' : ''})`;
  }

  get totalPages(): number {
    const total = this.apiResponseUserDetails.totalElements || 0;
    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

  // ===== Status helpers =====
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

  // ===== Actions =====
  onDeleteUser(userId: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.dataprovider.deleteUserManagement(userId, this.createdBy).subscribe({
      next: () => {
        alert('User deleted successfully');
        this.getUserDetails();
      },
      error: (error) => console.error('Error deleting user:', error),
    });
  }

  viewUser(userId: any) {
    this.router.navigate(['/viewUserManagement', userId]);
  }

  editUser(userId: any) {
    this.router.navigate(['/editUserManagement', userId]);
  }

  addUser() {
    this.router.navigate(['/addUserManagement']);
  }
}
