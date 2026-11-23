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
@Component({
  selector: 'app-view-committee-members',
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
  templateUrl: './view-committee-members.component.html',
  styleUrl: './view-committee-members.component.scss'
})
export class ViewCommitteeMembersComponent {

  bankId!: number;
  committeeId!: number;
  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
  committee: any = {};
  transactionhistory: any[] = []; // ✅ initialized to avoid undefined error
  common = new Common();

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.committeeId = +this.route.snapshot.paramMap.get('committeeId')!;
    const queryParams = this.route.snapshot.queryParamMap;
    this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;

    this.getCommitteeDetailById();
  }

  getCommitteeDetailById() {
    this.dataprovider.getCommitteeDetailById(this.committeeId).subscribe({
      next: (response) => {
        console.log(response);
        this.committee = {
          bankName: response.bankName,
          name: response.name,
          status: response.status,
          designation: response.designation,
          email: response.email,
          sequence: response.sequence
        };

        this.transactionhistory = (response.transactionHistory || []).sort((a: any, b: any) => {
          const dateA = this.common.parseEntryDate(a.entryDate);
          const dateB = this.common.parseEntryDate(b.entryDate);
          return dateB.getTime() - dateA.getTime();
        });

      },
      error: (err) => {
        console.error('Failed to fetch Bank details', err);
      }
    });
  }

  get hasTransactionHistory(): boolean {
    return Array.isArray(this.transactionhistory) && this.transactionhistory.length > 0;
  }

  backToIndexPage() {
    this.router.navigate(['/committeeMembers'], {
      queryParams: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size || 5
      }
    });
  }



  confirmResetPassword(email: string, userId: number) {
    if (confirm(`This will reset the user password and an email will be sent to the user. Do you wish to reset?`)) {
      this.resetPassword(email, userId);
    }
  }

  resetPassword(email: string, userId: number) {

  }


}
