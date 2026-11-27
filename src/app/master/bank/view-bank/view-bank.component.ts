import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatListModule } from '@angular/material/list';
import { Common } from '../../../classes/common';
import { DataProviderService } from '../../../service/data-provider.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddBankUserDialogComponent } from '../add-bank-user-dialog/add-bank-user-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-bank',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatListModule,
  ],
  templateUrl: './view-bank.component.html',
  styleUrl: './view-bank.component.scss',
})
export class ViewBankComponent {
  bankId!: number;
  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
  bank: any = {};
  transactionhistory: any[] = []; // ✅ initialized to avoid undefined error
  common = new Common();
  bankUsers: any[] = [];
  userColumns = ['name', 'email', 'contactNo', 'status', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router,
    private dialog: MatDialog,
  ) {}
  userId: any;
  ngOnInit(): void {
    this.userId = sessionStorage.getItem('userId');
    this.bankId = +this.route.snapshot.paramMap.get('bankId')!;
    const queryParams = this.route.snapshot.queryParamMap;
    this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;

    this.getBankDetails();
    this.getBankDetailsById(); // Fetch bank users when the component initializes
  }

  get hasBankUsers(): boolean {
    return Array.isArray(this.bankUsers) && this.bankUsers.length > 0;
  }
  addBankUser() {
    const dialogRef = this.dialog.open(AddBankUserDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        bankId: this.bankId,
        bankName: this.bank?.name,
      },
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.getBankDetailsById(); // reload bank users list
      }
    });
  }

  getBankDetails() {
    this.dataprovider.getBankById(this.bankId).subscribe({
      next: (response) => {
        console.log(response);
        this.bank = {
          name: response.name,
          status: response.status,
          bankType: response.bankType,
        };

        this.transactionhistory = (response.transactionhistory || []).sort(
          (a: any, b: any) => {
            const dateA = this.common.parseEntryDate(a.entryDate);
            const dateB = this.common.parseEntryDate(b.entryDate);
            return dateB.getTime() - dateA.getTime();
          },
        );
      },
      error: (err) => {
        console.error('Failed to fetch Bank details', err);
      },
    });
  }

  get hasTransactionHistory(): boolean {
    return (
      Array.isArray(this.transactionhistory) &&
      this.transactionhistory.length > 0
    );
  }

  backToIndexPage() {
    this.router.navigate(['/bank']);
  }

  confirmResetPassword(email: string, userId: number) {
    if (
      confirm(
        `This will reset the user password and an email will be sent to the user. Do you wish to reset?`,
      )
    ) {
      this.resetPassword(email, userId);
    }
  }

  resetPassword(email: string, userId: number) {}

  getBankDetailsById() {
    this.dataprovider.getBankUsersByBankId(this.bankId).subscribe({
      next: (users) => {
        this.bankUsers = users || [];
      },
      error: (err) => {
        console.error('Failed to fetch bank users', err);
        this.bankUsers = [];
      },
    });
  }

  editBankUser(user: any) {
    this.dialog
      .open(AddBankUserDialogComponent, {
        width: '500px',
        disableClose: true,
        data: { bankId: this.bankId, bankName: this.bank?.name, user }, // user present = edit mode
      })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) this.getBankDetailsById();
      });
  }

  onDeleteBankUser(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this bank user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.dataprovider.delBankUser(id, this.userId).subscribe({
        next: (res: any) => {
          Swal.fire(
            res.data ? 'Deleted!' : 'Warning!',
            res.message,
            res.data ? 'success' : 'warning',
          );
          if (res.success) {
            this.getBankDetailsById();
          }
        },
        error: () =>
          Swal.fire('Error!', 'Unable to delete bank user.', 'error'),
      });
    });
  }
}
