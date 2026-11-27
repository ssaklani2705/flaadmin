import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Common } from '../../../classes/common';
import { DataProviderService } from '../../../service/data-provider.service';
import { BankType } from '../../../classes/banktype';

interface Bank {
  bankId: number;
  name: string;
  status: number;
  associateId: number;
  associationName: string;
}

export interface AssociationItem {
  id: number;
  name: string;
  status?: number;
}

@Component({
  selector: 'app-bank-index',
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule],
  templateUrl: './bank-index.component.html',
  styleUrl: './bank-index.component.scss',
})
export class BankIndexComponent implements OnInit, OnDestroy {
  /** sessionStorage key for this list's state */
  private readonly STATE_KEY = 'bankIndexState';
  private readonly DEFAULT_SIZE = 5;

  /**
   * Routes that belong to this module. Going to any of these keeps the saved
   * state. Going anywhere else (another module) destroys it.
   * Adjust to your real route paths.
   */
  private readonly MODULE_ROUTES = ['/view-bank', '/edit-bank', '/add-bank'];

  private routerSub?: Subscription;

  banks: Bank[] = [];
  apiResponseBankDetails: any = {};
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

  createdBy: any;

  common = new Common();
  bankTypes: BankType[] = [];
  bank: any = {};
  userId: any;

  addPer = 'N';
  editPer = 'N';
  deletePer = 'N';
  viewPer = 'N';
  approvePer = 'N';
  adminApprovePer = 'N';
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
      this.userId = sessionStorage.getItem('userId');

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

    this.getBankDetails();
    this.getActiveBankTypes();
    this.loadAssociations();
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
        this.associationId = +s.associationId || 0;
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
        associationId: this.associationId,
      }),
    );
  }

  private clearState() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.STATE_KEY);
    }
  }

  // ===== Data =====
  getBankDetails() {
    this.saveState();

    this.dataprovider
      .getBankDetails(
        this.page,
        this.size,
        this.statusIndex,
        this.search,
        this.associationId,
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
          this.apiResponseBankDetails = response;
          this.banks = response.data;
        },
        error: (error) => console.error('Error fetching bank details:', error),
      });
  }

  getActiveBankTypes() {
    if (!isPlatformBrowser(this.platformId)) return;

    const stored = sessionStorage.getItem('bankTypes');
    if (stored) {
      this.bankTypes = JSON.parse(stored);
      return;
    }

    this.dataprovider.getBankType().subscribe({
      next: (response: BankType[]) => {
        this.bankTypes = response;
        sessionStorage.setItem('bankTypes', JSON.stringify(response));
      },
      error: (error) => console.error('Error fetching bank types:', error),
    });
  }

  get paginatedBanks(): Bank[] {
    return this.banks;
  }

  // ===== Pagination =====
  goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    this.currentPage = pageNumber;
    this.page = pageNumber - 1;
    this.getBankDetails();
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
    this.getBankDetails();
  }

  onChangeRecordsPerPage(): void {
    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;
    this.associationId =
      this.selectedAssociation === '' ? 0 : +this.selectedAssociation;
    this.currentPage = 1;
    this.page = 0;
    this.getBankDetails();
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
    const totalRecords = this.apiResponseBankDetails.totalElements || 0;
    const startRecord =
      totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    const endRecord = Math.min(
      this.currentPage * this.recordsPerPage,
      totalRecords,
    );
    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} record${totalRecords > 1 ? 's' : ''})`;
  }

  get totalPages(): number {
    const total = this.apiResponseBankDetails.totalElements || 0;
    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

  // ===== Actions =====
  onDeleteBank(bankId: any) {
    this.bank.bankId = bankId;
    this.bank.userId = this.userId ? Number(this.userId) : null;

    if (!confirm('Are you sure you want to delete this bank?')) return;

    this.dataprovider.deleteBank(this.bank).subscribe({
      next: (response) => {
        alert(response.message);
        if (response.success) {
          this.getActiveBanks();
          this.getBankDetails();
        }
      },
      error: (error) => console.error('Error deleting bank:', error),
    });
  }

  getActiveBanks() {
    sessionStorage.removeItem('banks');
    this.dataprovider.getAllBank().subscribe({
      next: (response: Bank[]) => {
        sessionStorage.setItem('banks', JSON.stringify(response));
      },
      error: (error) => console.error('Error fetching banks:', error),
    });
  }

  viewBank(bankId: any) {
    this.router.navigate(['/view-bank', bankId]);
  }

  editBank(bankId: any) {
    this.router.navigate(['/edit-bank', bankId]);
  }

  addBank() {
    this.router.navigate(['/add-bank']);
  }

  associationList: AssociationItem[] = [];
  selectedAssociation = '';
  associationId = 0;

  private loadAssociations(): void {
    this.dataprovider.associationCategory().subscribe({
      next: (res: any) => {
        this.associationList = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: (e) => console.error('Error loading associations:', e),
    });
  }
  onAssociationChange(value: string): void {
    this.selectedAssociation = value;
    this.associationId = value === '' ? 0 : +value;
    this.currentPage = 1;
    this.page = 0;
    this.getBankDetails();
  }
}
