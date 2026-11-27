import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataProviderService } from '../../../service/data-provider.service';

interface FraudData {
  dataId: number;
  entityCode: string;
  state: string;
  branchCategory: string;
  perpetratorStatus: string;
  accountType: string;
  accountTypeOther?: string;
  industrySector: string;
  areaOfOperation: string;
  fraudType: string;
  totalAmount: any;
  dateOfOccurrence: string;
  dateOfDetection: string;
  dateOfClassification: string;
  dateReportedToRbi: string;
  howDetected: string;
  status: number; // 1 = Draft, 2 = Approval Pending, 3 = Approved
  bankName?: string;
  noOfDays?: any;
}
interface BankItem {
  bankId: number;
  name: string;
}

/** Set to false once the backend API is ready */
const USE_MOCK = false;

@Component({
  selector: 'app-data-index-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './data-index-admin.component.html',
  styleUrl: './data-index-admin.component.scss',
})
export class DataIndexAdminComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  /** sessionStorage key for this list's state */
  private readonly STATE_KEY = 'dataIndexAdminState';
  private readonly DEFAULT_SIZE = 5;

  /**
   * Routes that belong to this module. Going to any of these keeps the saved
   * state. Going anywhere else (another module) destroys it.
   * Adjust to your real route paths.
   */
  private readonly MODULE_ROUTES = [
    '/view-data-index',
    '/edit-data',
    '/addData',
    '/upload-file',
  ];

  private routerSub?: Subscription;

  bankList: BankItem[] = [];
  selectedBank = '';
  bankId = 0;

  @ViewChild('topScroll') topScroll!: ElementRef<HTMLDivElement>;
  @ViewChild('mainScroll') mainScroll!: ElementRef<HTMLDivElement>;
  @ViewChild('bottomScroll') bottomScroll!: ElementRef<HTMLDivElement>;
  @ViewChild('dataTable') dataTable!: ElementRef<HTMLTableElement>;

  dataList: FraudData[] = [];
  apiResponseData: any = {};
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

  userId: any;
  moduleName = 'Admin Data Index';
  showHeaderBar = true;

  addPer = 'N';
  editPer = 'N';
  deletePer = 'N';
  viewPer = 'N';

  // Scrollbars
  scrollWidth = 0;
  private syncing = false;
  colClasses = Array.from({ length: 17 }, (_, i) => `col-${i + 1}`);

  constructor(
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
  ) {}

  // ===== Lifecycle =====
  ngOnInit() {
    this.loadBanks();
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

    this.getAdminDataIndexList();
  }

  ngAfterViewInit() {
    this.updateScrollWidth();
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateScrollWidth();
  }

  // ===== Session state =====
  private loadState() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const s = JSON.parse(sessionStorage.getItem(this.STATE_KEY) || '{}');
        this.bankId = +s.bankId || 0;
        this.currentPage = +s.currentPage || 1;
        this.statusIndex = +s.statusIndex || 0;
        this.search = s.search || '';
      } catch {
        /* ignore corrupted state */
      }
    }
    this.size = this.DEFAULT_SIZE; // always 2 per page
    this.page = this.currentPage - 1;
    this.recordsPerPage = this.size;
    this.searchQuery = this.search;
    this.selectedBank = this.bankId ? String(this.bankId) : '';
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
        bankId: this.bankId,
      }),
    );
  }

  private clearState() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.STATE_KEY);
    }
  }

  // ===== Data =====
  getAdminDataIndexList() {
    this.saveState();

    this.dataprovider
      .getAdminDataIndexList(
        this.page,
        this.size,
        this.statusIndex,
        this.search,
        this.bankId,
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
          this.apiResponseData = response;
          this.dataList = response.data;
          this.updateScrollWidth();
        },
        error: (error) => console.error('Error fetching data details:', error),
      });
  }

  private loadMock() {
    const base = {
      entityCode: '997',
      bankName: 'State Bank of India',
      state: 'Maharashtra',
      branchCategory: 'Metro',
      perpetratorStatus: 'Known',
      accountType: 'Society/non-profit organisations (including NGOs)',
      industrySector: 'Extraction of crude petroleum and natural gas',
      areaOfOperation: 'Digital Payments-AEPS/Other Aadhar Related Frauds',
      fraudType:
        'Collateral (Fake title deeds, spurious gold and/or its appraisal, FDRs, Bank Guarantees, Multiple mortgages)',
      totalAmount: 10000,
      dateOfOccurrence: '2026-11-20',
      dateOfDetection: '2026-11-20',
      dateOfClassification: '2026-11-20',
      dateReportedToRbi: '2026-11-20',
      howDetected: 'Intimation/notice from Law Enforcement Agencies',
    };
    this.dataList = [
      { dataId: 1, status: 1, ...base },
      { dataId: 2, status: 2, ...base },
      { dataId: 3, status: 3, ...base },
    ];
    this.apiResponseData = { totalElements: this.dataList.length };
    this.updateScrollWidth();
  }

  get paginatedData(): FraudData[] {
    return this.dataList;
  }

  // ===== Scrollbars =====
  updateScrollWidth() {
    setTimeout(() => {
      if (this.dataTable) {
        this.scrollWidth = this.dataTable.nativeElement.scrollWidth;
      }
    });
  }

  onScroll(source: HTMLElement) {
    if (this.syncing) return;
    this.syncing = true;

    const value = source.scrollLeft;
    [this.topScroll, this.mainScroll, this.bottomScroll].forEach((ref) => {
      const el = ref?.nativeElement;
      if (el && el !== source && el.scrollLeft !== value) {
        el.scrollLeft = value;
      }
    });

    requestAnimationFrame(() => (this.syncing = false));
  }

  // ===== Pagination =====
  goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    this.currentPage = pageNumber;
    this.page = pageNumber - 1;
    this.getAdminDataIndexList();
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
    this.getAdminDataIndexList();
  }

  onChangeRecordsPerPage(): void {
    this.bankId = this.selectedBank === '' ? 0 : +this.selectedBank;
    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;
    this.currentPage = 1;
    this.page = 0;
    this.getAdminDataIndexList();
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
    const totalRecords = this.apiResponseData.totalElements || 0;
    const startRecord =
      totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    const endRecord = Math.min(
      this.currentPage * this.recordsPerPage,
      totalRecords,
    );
    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} record${totalRecords > 1 ? 's' : ''})`;
  }

  get totalPages(): number {
    const total = this.apiResponseData.totalElements || 0;
    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

  // ===== Actions =====
  onDeleteData(dataId: number) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    const payload = {
      dataId,
      userId: this.userId ? Number(this.userId) : null,
    };
    this.dataprovider.deleteData(payload).subscribe({
      next: (response: any) => {
        alert(response.message);
        if (response.success) this.getAdminDataIndexList();
      },
      error: (error: any) => console.error('Error deleting data:', error),
    });
  }

  addData() {
    this.router.navigate(['/addData']);
  }
  importExcel() {
    this.router.navigate(['/upload-file']);
  }
  viewData(id: number) {
    this.router.navigate(['/view-data-index', id]);
  }
  editData(id: number) {
    this.router.navigate(['/edit-data', id]);
  }

  private loadBanks() {
    this.dataprovider.getAllBank().subscribe({
      next: (res: any) => {
        this.bankList = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: (err) => console.error('Error fetching bank list:', err),
    });
  }

  formatAmount(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    return Number(String(value).replace(/,/g, '')).toLocaleString('en-IN');
  }
  exporting = false;
  exportToExcel() {
    if (!isPlatformBrowser(this.platformId) || this.exporting) return;

    const total = this.apiResponseData?.totalElements || 0;
    if (total === 0) {
      alert('No data to export.');
      return;
    }

    this.exporting = true;

    // Fetch ALL records for the current filters (page 0, size = total)
    this.dataprovider
      .getAdminDataIndexList(
        0,
        total,
        this.statusIndex,
        this.search,
        this.bankId,
      )
      .subscribe({
        next: async (response) => {
          try {
            const rows = (response.data as FraudData[]).map((d, i) => ({
              'Sr No': i + 1,
              Bank: d.bankName ?? '',
              'Code of the entity': d.entityCode,
              'State (Branch Located)': d.state,
              'Category of Branch': d.branchCategory,
              'Status of Perpetrator/s': d.perpetratorStatus,
              'Type of account where the fraud was perpetrated':
                this.resolveOther(d.accountType, d.accountTypeOther),
              'Industry/Sector of the Account where fraud was perpetrated': '',
              'Whether fraud has occurred in a borrowal account': '',
              'Whether the bank is part of the Consortium, Multiple Banking Arrangement (MBA), Sole banking':
                '',
              'Area of operation where the fraud has occurred': '',
              'Classification of Fraud': '',
              'Type of fraud': '',
              'Total amount involved (as actual)': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
              '': '',
            }));

            // Load the library only when needed (keeps the main bundle small)
            const XLSX = await import('xlsx');

            const ws = XLSX.utils.json_to_sheet(rows);

            // Column widths
            ws['!cols'] = [
              { wch: 7 },
              { wch: 18 },
              { wch: 12 },
              { wch: 22 },
              { wch: 16 },
              { wch: 18 },
              { wch: 35 },
              { wch: 35 },
              { wch: 35 },
              { wch: 45 },
              { wch: 16 },
              { wch: 18 },
              { wch: 18 },
              { wch: 20 },
              { wch: 20 },
              { wch: 35 },
              { wch: 18 },
            ];

            // Indian digit grouping for the amount column (K)
            const range = XLSX.utils.decode_range(ws['!ref']!);
            for (let r = range.s.r + 1; r <= range.e.r; r++) {
              const cell = ws[XLSX.utils.encode_cell({ r, c: 10 })];
              if (cell && typeof cell.v === 'number')
                cell.z =
                  '[>=10000000]##\\,##\\,##\\,##0;[>=100000]##\\,##\\,##0;##,##0';
            }

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Fraud Data');

            const stamp = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, `fraud-data-${stamp}.xlsx`);
          } catch (e) {
            console.error('Excel export failed:', e);
            alert('Export failed. Please try again.');
          } finally {
            this.exporting = false;
          }
        },
        error: (err) => {
          console.error('Error fetching data for export:', err);
          alert('Could not fetch data for export.');
          this.exporting = false;
        },
      });
  }

  private statusText(status: number): string {
    switch (+status) {
      case 1:
        return 'Draft';
      case 2:
        return 'Approval Pending';
      case 3:
        return 'Approved';
      default:
        return '';
    }
  }

  /** If the dropdown value is "Other", use the typed-in text instead */
  private resolveOther(
    main: string | null | undefined,
    other: string | null | undefined,
  ): string {
    const value = (main ?? '').trim();
    if (value.toLowerCase() == 'other') {
      return (other ?? '').trim() || ''; // fall back to "Other" if nothing was typed
    }
    return value;
  }
}
