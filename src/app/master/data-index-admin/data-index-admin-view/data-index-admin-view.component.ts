import { CommonModule } from '@angular/common';
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';

/** Shows "NA" when a value is empty */
@Pipe({ name: 'dash', standalone: true })
export class DashPipe implements PipeTransform {
  transform(value: any, fallback = 'NA'): any {
    return value === null || value === undefined || value === ''
      ? fallback
      : value;
  }
}

/** Set to false once the backend API is ready */
const USE_MOCK = false;
@Component({
  selector: 'app-data-index-admin-view',
  imports: [CommonModule, DashPipe],
  templateUrl: './data-index-admin-view.component.html',
  styleUrl: './data-index-admin-view.component.scss',
})
export class DataIndexAdminViewComponent implements OnInit {
  dataId!: number;
  data: any = null;
  history: any[] = [];
  loading = true;

  // Status: 1 = Draft, 2 = Pending for Approval, 3 = Approved
  private readonly statusMap: Record<number, { label: string; cls: string }> = {
    1: { label: 'Draft', cls: 'draft_text' },
    2: { label: 'Approval Pending', cls: 'app_pen_text' },
    3: { label: 'Approved', cls: 'approved_text' },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataprovider: DataProviderService,
  ) {}

  ngOnInit(): void {
    this.dataId = Number(this.route.snapshot.paramMap.get('dataId'));
    this.loadData();
  }

  get statusLabel(): string {
    return this.statusMap[this.data?.status]?.label ?? '';
  }

  get statusClass(): string {
    return this.statusMap[this.data?.status]?.cls ?? '';
  }

  private loadData(): void {
    this.loading = true;
    this.dataprovider.getDataById(this.dataId).subscribe({
      next: (res: any) => {
        if (res?.success === false) {
          this.data = null; // shows "Record not found."
        } else {
          this.data = res.data;
          this.history = res.history ?? [];
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading data:', err);
        this.data = null;
        this.loading = false;
      },
    });
  }

  private loadMock(): void {
    this.data = {
      dataId: this.dataId,
      status: 2,
      entityCode: '977',
      state: 'Dadra and Nagar Haveli and Daman and Diu',
      branchCategory: 'Semi Urban',
      perpetratorStatus: 'Unknown',
      accountType: 'Society/non-profit organisations (including NGOs)',
      accountTypeOther: '',
      industrySector:
        'Manufacture of chemicals and chemical products and synthetic rubber in primary forms',
      borrowalAccount: 'Yes',
      bankingArrangement: 'Multiple Banking Arrangement (MBA)',
      areaOfOperation: 'Digital Payments-AEPS/Other Aadhar Related Frauds',
      areaOther: '',
      fraudClassification:
        'Willful falsification, destruction, alteration, mutilations of any book, electronic record, paper, writing, valuable security or account with intent to defraud',
      classificationOther: '',
      fraudType:
        'Financial statements (Stock statements, inventory, debtors/creditors/receivables statements, fabricated balance sheets, manipulation of accounts etc)',
      fraudTypeOther: '',
      totalAmount: 1000,
      dateOfOccurrence: '2026-11-21',
      dateOfDetection: '2026-11-21',
      dateOfClassification: '2026-11-21',
      dateReportedToRbi: '2026-11-21',
      delayReason:
        'Delay occurred due to verification of relevant documents and collection of necessary information before reporting the fraud to RBI.',
      dateOfFullPayment: '2026-11-21',
      howDetected: 'Intimation/notice from Law Enforcement Agencies',
      otherSources: '',
      committedBy: 'Staff',
      controlOfficeDetected: 'Yes',
      internalAuditConducted: 'Yes',
      whyNotDetected:
        'The irregularities were not apparent during the audit and came to light only after detailed investigation.',
      actionTaken:
        'The matter has been reviewed and necessary corrective action has been initiated.',
      leaComplaint: 'Yes',
      stepsTaken:
        'Strengthening internal controls, regular monitoring, staff training and periodic audits.',
      amountRecovered: 0,
      lossToBank: 1000,
      provisionHeld: 1000,
      amountWrittenOff: 0,
      compromiseDone: 'No',
      compromiseAmount: 0,
    };
    this.history = [
      {
        actionDate: '2026-11-21T18:00:00',
        userName: 'Kaushal Vyas',
        action: 'Data saved as draft',
      },
      {
        actionDate: '2026-11-21T18:00:00',
        userName: 'Kaushal Vyas',
        action: 'Data submitted',
      },
      {
        actionDate: '2026-11-21T18:00:00',
        userName: 'Amit Thakur',
        action: 'Data approved',
      },
    ];
    this.loading = false;
  }

  backToIndexPage(): void {
    this.router.navigate(['/data-index']);
  }
}
