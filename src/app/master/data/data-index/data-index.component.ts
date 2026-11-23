import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit, Component, ElementRef, HostListener, Inject,
  OnInit, PLATFORM_ID, ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';

interface FraudData {
  dataId: number;
  entityCode: string;
  state: string;
  branchCategory: string;
  perpetratorStatus: string;
  accountType: string;
  industrySector: string;
  areaOfOperation: string;
  fraudType: string;
  totalAmount: number;
  dateOfOccurrence: string;
  dateOfDetection: string;
  dateOfClassification: string;
  dateReportedToRbi: string;
  howDetected: string;
  status: number; // 1 = Draft, 2 = Approval Pending, 3 = Approved
}

/** Set to false once the backend API is ready */
const USE_MOCK = false;

@Component({
  selector: 'app-data-index',
  imports: [CommonModule, FormsModule],
  templateUrl: './data-index.component.html',
  styleUrl: './data-index.component.scss'
})
export class DataIndexComponent implements OnInit, AfterViewInit {

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
  moduleName = '';
  showHeaderBar = true;

  addPer = 'N';
  editPer = 'N';
  deletePer = 'N';
  viewPer = 'N';

  // Scrollbars
  scrollWidth = 0;
  private syncing = false;
  colClasses = Array.from({ length: 16 }, (_, i) => `col-${i + 1}`);

  constructor(
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +(params['currentPage'] ?? this.currentPage) || 1;
      this.page = this.currentPage - 1;

      this.statusIndex = +(params['statusIndex'] ?? this.statusIndex) || 0;
      this.search = (params['searchText'] ?? this.search) || '';

      this.size = +(params['size'] ?? this.size) || this.size;
      this.recordsPerPage = this.size;

      this.searchQuery = this.search;
      this.selectedStatus = this.statusIndex ? String(this.statusIndex) : '';

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
      }

      this.getDataDetails();
    });
  }

  ngAfterViewInit() {
    this.updateScrollWidth();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateScrollWidth();
  }

  // ===== Data =====
  getDataDetails() {
    if (USE_MOCK) {
      this.loadMock();
      return;
    }

    this.dataprovider.getDataDetails(this.page, this.size, this.statusIndex, this.search).subscribe({
      next: (response) => {
        this.apiResponseData = response;
        this.dataList = response.data;
        this.updateScrollWidth();
      },
      error: (error) => console.error('Error fetching data details:', error)
    });
  }

  private loadMock() {
    const base = {
      entityCode: '997',
      state: 'Maharashtra',
      branchCategory: 'Metro',
      perpetratorStatus: 'Known',
      accountType: 'Society/non-profit organisations (including NGOs)',
      industrySector: 'Extraction of crude petroleum and natural gas',
      areaOfOperation: 'Digital Payments-AEPS/Other Aadhar Related Frauds',
      fraudType: 'Collateral (Fake title deeds, spurious gold and/or its appraisal, FDRs, Bank Guarantees, Multiple mortgages)',
      totalAmount: 10000,
      dateOfOccurrence: '2026-11-20',
      dateOfDetection: '2026-11-20',
      dateOfClassification: '2026-11-20',
      dateReportedToRbi: '2026-11-20',
      howDetected: 'Intimation/notice from Law Enforcement Agencies'
    };
    this.dataList = [
      { dataId: 1, status: 1, ...base },
      { dataId: 2, status: 2, ...base },
      { dataId: 3, status: 3, ...base }
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
    [this.topScroll, this.mainScroll, this.bottomScroll].forEach(ref => {
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
    this.getDataDetails();
  }

  goToFirstPage() { this.goToPage(1); }
  goToLastPage() { this.goToPage(this.totalPages); }

  onSearch() {
    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;
    this.getDataDetails();
  }

  onChangeRecordsPerPage(): void {
    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;
    this.currentPage = 1;
    this.page = 0;
    this.getDataDetails();
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
    const startRecord = totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    const endRecord = Math.min(this.currentPage * this.recordsPerPage, totalRecords);
    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} record${totalRecords > 1 ? 's' : ''})`;
  }

  get totalPages(): number {
    const total = this.apiResponseData.totalElements || 0;
    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

  // ===== Actions =====
  onDeleteData(dataId: number) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    const payload = { dataId, userId: this.userId ? Number(this.userId) : null };
    this.dataprovider.deleteData(payload).subscribe({
      next: (response: any) => {
        alert(response.message);
        if (response.success) this.getDataDetails();
      },
      error: (error: any) => console.error('Error deleting data:', error)
    });
  }

  private navParams() {
    return {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex || null,
      searchText: this.search || null,
      size: this.size || 5
    };
  }

  addData()            { this.router.navigate(['/addData'], { queryParams: this.navParams() }); }
  importExcel()        { this.router.navigate(['/upload-file'], { queryParams: this.navParams() }); }
  viewData(id: number) { this.router.navigate(['/viewData', id], { queryParams: this.navParams() }); }
  editData(id: number) { this.router.navigate(['/edit-data', id], { queryParams: this.navParams() }); }
}