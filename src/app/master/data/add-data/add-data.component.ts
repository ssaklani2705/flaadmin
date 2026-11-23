import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { DataProviderService } from '../../../service/data-provider.service';

/** Shows dates as dd-mm-yyyy in the datepicker input */
@Injectable()
export class DashDateAdapter extends NativeDateAdapter {
  override format(date: Date, _displayFormat: Object): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${d}-${m}-${date.getFullYear()}`;
  }
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const isOther = (v: string) => /other/i.test(v || '');

@Component({
  selector: 'app-add-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDatepickerModule, MatNativeDateModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: DashDateAdapter }
  ],
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss']
})
export class AddDataComponent implements OnInit {
  dataForm!: FormGroup;
  isSubmitting = false;

  // Status: 1 = Draft (on Save), 2 = Pending for Approval (on Submit), 3 = Approved (on approval)
  readonly STATUS_DRAFT = 1;
  readonly STATUS_PENDING = 2;
  readonly STATUS_APPROVED = 3;
  statusOptions = [
    { value: 1, label: 'Draft' },
    { value: 2, label: 'Pending for Approval' },
    { value: 3, label: 'Approved' }
  ];

  // ===== Dropdown data =====
  states = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
    'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
    'Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
    'Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];

  branchCategories = ['Metro', 'Urban', 'Semi Urban', 'Rural'];
  perpetratorStatuses = ['Known', 'Unknown'];
  yesNo = ['Yes', 'No'];
  bankingArrangements = ['Consortium', 'Multiple Banking Arrangement (MBA)', 'Sole banking'];
  committedByList = ['Staff', 'Customers', 'Outsiders'];

  accountTypes = ['Corporate', 'Individuals/HUF', 'Sole proprietorship', 'Partnership firm',
    'Limited Liability Partnership firm', 'Society/non-profit organisations (including NGOs)', 'Trust',
    'Others (Please specify)'];

  industrySectors = [
    'Crop and animal production, hunting and related service activitie', 'Forestry and logging',
    'Fishing and aquaculture', 'Mining of coal and lignite', 'Extraction of crude petroleum and natural gas',
    'Mining of metal ores', 'Other mining and quarrying', 'Manufacture of food products',
    'Manufacture of beverages', 'Manufacture of tobacco products', 'Manufacture of textiles',
    'Manufacture of wearing apparel',
    'Manufacture of leather and related products and harness; dressing and dyeing of fur',
    'Manufacture of wood and products of wood and cork, except furniture',
    'Manufacture of paper and paper products', 'Printing and reproduction of recorded media',
    'Manufacture of coke and refined petroleum products',
    'Manufacture of chemicals and chemical products and synthetic rubber in primary forms',
    'Manufacture of pharmaceuticals, medicinal chemical and botanical products',
    'Manufacture of rubber and plastics products', 'Manufacture of other non-metallic mineral products',
    'Manufacture of basic metals',
    'Manufacture of fabricated metal products, except machinery and equipment',
    'Manufacture of computer, electronic and optical products', 'Manufacture of electrical equipment'];

  areasOfOperation = ['Advances-Agriculture', 'Advances-Bills', 'Advances-Cash Credit',
    'Advances-against gold/gold ornament', 'Advances-MSME', 'Advances-Vehicle', 'advances-Housing Loan',
    'advances-Personal loans', 'Advances-Educational loans', 'Advances-Digital Lending (App based)',
    'Advances-credit card (Using Fake Documents)', 'Advances-Other Term loans', 'Advances-Other (Please specify)',
    'Digital Payments-Credit Card', 'Digital Payments-Debit/ATM cards', 'Digital Payments-Internet Banking',
    'Digital Payments-UPI', 'Digital Payments-Wallet/Prepaid Cards', 'Digital Payments-IMPS/NEFT/RTGS',
    'Digital Payments-AEPS/Other Aadhar Related Frauds', 'Digital Payments-USSD',
    'Digital Payments- Other(Please Specify)', 'Cash Shortage', 'Cheque/Demand Drafts', 'Clearing Operations',
    'Deposits-Current', 'Deposits-Saving', 'Deposits-Term', 'Foreign Exchange Transactions', 'Internal Accounts',
    'Off Balance sheet- Letter of credit', 'Off Balance Sheet - LOU', "Off Balance Sheet - BG's", 'Other'];

  fraudClassifications = [
    'Misappropriation of funds and criminal breach of trust',
    'Fraudulent encashment through forged instruments',
    'Manipulation of books of accounts or through fictitious accounts and conversion of property',
    'Cheating by concealment of facts with the intention to deceive any person and cheating by impersonation',
    'Forgery with the intention to commit fraud by making any false documents/electronic records',
    'Willful falsification, destruction, alteration, mutilations of any book, electronic record, paper, writing, valuable security or account with intent to defraud',
    'Fraudulent credit facilities extended for illegal gratification',
    'Cash shortages on account of frauds',
    'Fraudulent transactions involving foreign exchange',
    'Fraudulent electronic banking/ digital payment related transactions',
    'Other'];

  fraudTypes = [
    'Collateral (Fake title deeds, spurious gold and/or its appraisal, FDRs, Bank Guarantees, Multiple mortgages)',
    'Documents (Fake invoices, LCs, transport documents, shipping bills, warehouse receipts, creation of charge in RC books; etc)',
    'Financial statements (Stock statements, inventory, debtors/creditors/receivables statements, fabricated balance sheets, manipulation of accounts etc)',
    'Related Party transactions (Round tripping of funds, fake sales and purchases to inflate turnover)',
    'Clandestine sale of hypothecated/mortgaged security (Stocks, securities, machineries and equipment, vehicles, immovable property)',
    'Violations of FEMA / PMLA / Illegal claim of Input Credit in GST etc',
    'Non-resident accounts', 'Fake KYC', 'Overvaluation/Misrepresentation by Third Party Entities',
    'Cash Shortage-Cash Collection', 'Cash Shortage-Embezzlement', 'Cash Shortage-Manipulation',
    'Cash Shortage-Currency Chest', 'Cheques/demand drafts-Fraudulent encashment',
    'Cheques/demand drafts-Cloned/ forged', 'Cheques/demand drafts-Demand drafts',
    'Routing business transactions outside consortium/Non- routing through TRA & CC accounts',
    'Account Hacking / Compromise / Identity theft', 'Phishing', 'Vishing', 'Smishing',
    'Remote Capture of Device', 'Lost / Stolen Device / Instrument', 'Card Skimming', 'SIM Swap',
    'Fraudulent App', 'Forgery / Modification of Payment', 'Collect Payment Request', 'Merchant Collusion',
    'New type of digital frauds', 'Other'];

  detectionSources = ['Customer Complaints', 'Internal inspections/audit', 'External audit', 'MIS of bank',
    'News and Media', 'CFR/CRILC', 'Whistleblower', 'Intimation/notice from Law Enforcement Agencies',
    'Intimation from other banks', 'EWS triggering', 'Other'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataprovider: DataProviderService
  ) {}

  ngOnInit(): void {
    const req = Validators.required;
    const amount = Validators.pattern(AMOUNT_PATTERN);

    this.dataForm = this.fb.group({
      entityCode: ['', [req, Validators.maxLength(50)]],
      state: ['', req],
      branchCategory: ['', req],
      perpetratorStatus: [''],

      accountType: ['', req],
      accountTypeOther: [{ value: '', disabled: true }],
      industrySector: ['', req],
      borrowalAccount: ['', req],
      bankingArrangement: ['', req],

      areaOfOperation: ['', req],
      areaOther: [{ value: '', disabled: true }],
      fraudClassification: ['', req],
      classificationOther: [{ value: '', disabled: true }],
      fraudType: ['', req],
      fraudTypeOther: [{ value: '', disabled: true }],

      totalAmount: ['', [req, amount]],

      dateOfOccurrence: [null, req],
      dateOfDetection: [null, req],
      dateOfClassification: [null, req],
      dateReportedToRbi: [null, req],
      delayReason: ['', req],
      dateOfFullPayment: [null],

      howDetected: ['', req],
      otherSources: [{ value: '', disabled: true }],
      committedBy: ['', req],
      controlOfficeDetected: ['', req],
      internalAuditConducted: ['', req],
      whyNotDetected: ['', req],
      actionTaken: ['', req],
      leaComplaint: [''],
      stepsTaken: ['', req],
      amountRecovered: ['', amount],
      lossToBank: ['', [req, amount]],
      provisionHeld: ['', [req, amount]],
      amountWrittenOff: ['', [req, amount]],
      compromiseDone: ['', req],
      compromiseAmount: [{ value: '', disabled: true }],

      status: [{ value: this.STATUS_DRAFT, disabled: true }]
    });

    // "If Other" fields: enabled + required only when the matching dropdown is "Other..."
    this.linkOther('accountType', 'accountTypeOther');
    this.linkOther('areaOfOperation', 'areaOther');
    this.linkOther('fraudClassification', 'classificationOther');
    this.linkOther('fraudType', 'fraudTypeOther');
    this.linkOther('howDetected', 'otherSources');

    // Compromise amount: only when compromise settlement = Yes
    this.dataForm.get('compromiseDone')!.valueChanges.subscribe(v => {
      const c = this.dataForm.get('compromiseAmount')!;
      if (v === 'Yes') {
        c.setValidators([Validators.required, Validators.pattern(AMOUNT_PATTERN)]);
        c.enable();
      } else {
        c.clearValidators();
        c.reset('');
        c.disable();
      }
      c.updateValueAndValidity();
    });
  }

  private linkOther(selectName: string, otherName: string): void {
    this.dataForm.get(selectName)!.valueChanges.subscribe(v => {
      const other = this.dataForm.get(otherName)!;
      if (isOther(v)) {
        other.setValidators(Validators.required);
        other.enable();
      } else {
        other.clearValidators();
        other.reset('');
        other.disable();
      }
      other.updateValueAndValidity();
    });
  }

  // ===== Helpers =====
  isInvalid(name: string): boolean {
    const c: AbstractControl | null = this.dataForm.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  amountError(name: string): string {
    const c = this.dataForm.get(name);
    if (c?.hasError('required')) return 'This field is required';
    if (c?.hasError('pattern')) return 'Enter a valid amount (numbers only)';
    return '';
  }

  private toDateStr(d: Date | null): string | null {
    if (!d) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private buildPayload(status: number) {
    const v = this.dataForm.getRawValue(); // includes disabled controls
    return {
      ...v,
      dateOfOccurrence: this.toDateStr(v.dateOfOccurrence),
      dateOfDetection: this.toDateStr(v.dateOfDetection),
      dateOfClassification: this.toDateStr(v.dateOfClassification),
      dateReportedToRbi: this.toDateStr(v.dateReportedToRbi),
      dateOfFullPayment: this.toDateStr(v.dateOfFullPayment),
      userId: Number(sessionStorage.getItem('userId')) || null,
      status
    };
  }

  private send(status: number): void {
    this.isSubmitting = true;
    this.dataprovider.saveData(this.buildPayload(status)).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        alert(res?.message || (status === this.STATUS_DRAFT ? 'Saved as draft' : 'Submitted for approval'));
        if (res?.success !== false) this.backToIndexPage();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Error saving data:', err);
      }
    });
  }

  // ===== Actions =====
  /** Save -> Draft (1). Only the entity code is mandatory for a draft. */
  onSave(): void {
    const code = this.dataForm.get('entityCode')!;
    if (code.invalid) {
      code.markAsTouched();
      return;
    }
    this.dataForm.get('status')!.setValue(this.STATUS_DRAFT);
    this.send(this.STATUS_DRAFT);
  }

  /** Submit -> Pending for Approval (2). All mandatory fields are validated. */
  onSubmit(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      setTimeout(() => document.querySelector('.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    this.dataForm.get('status')!.setValue(this.STATUS_PENDING);
    this.send(this.STATUS_PENDING);
  }

  onReset(): void {
    this.dataForm.reset({
      entityCode: '', state: '', branchCategory: '', perpetratorStatus: '',
      accountType: '', industrySector: '', borrowalAccount: '', bankingArrangement: '',
      areaOfOperation: '', fraudClassification: '', fraudType: '', totalAmount: '',
      dateOfOccurrence: null, dateOfDetection: null, dateOfClassification: null,
      dateReportedToRbi: null, delayReason: '', dateOfFullPayment: null,
      howDetected: '', committedBy: '', controlOfficeDetected: '', internalAuditConducted: '',
      whyNotDetected: '', actionTaken: '', leaComplaint: '', stepsTaken: '', amountRecovered: '',
      lossToBank: '', provisionHeld: '', amountWrittenOff: '', compromiseDone: '',
      status: this.STATUS_DRAFT
    });
  }

  backToIndexPage(): void {
    this.router.navigate(['/data-index'], { queryParamsHandling: 'preserve' });
  }
}