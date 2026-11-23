import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { DataProviderService } from '../../../service/data-provider.service';
import { Bank } from '../../../classes/banktype';

@Component({
  selector: 'app-add-committee-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './add-committee-members.component.html',
  styleUrl: './add-committee-members.component.scss'
})
export class AddCommitteeMembersComponent implements OnInit {
  committee: any = {};  // holds form data
  banksdetails: Bank[] = [];

  userId: number | null = null;
  isEdit = false;

  // pagination / filter tracking
  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
  committeeId: number=0;

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit(): void {
    // alert(this.committeeId );
    //  this.committeeId = +this.route.snapshot.paramMap.get('committeeId')!;
this.committeeId = +(this.route.snapshot.paramMap.get('committeeId') || 0);
 if (this.committeeId > 0) {
    this.isEdit = true;
  } else {
    this.isEdit = false;
  }

    const queryParams = this.route.snapshot.queryParamMap;
    this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;

    if (isPlatformBrowser(this.platformId)) {
      const storedUser = sessionStorage.getItem('userId');
      this.userId = storedUser ? Number(storedUser) : null;
    }

    // Load banks from session or fetch
    const storedBanks = sessionStorage.getItem('banks');
    if (storedBanks) {
      this.banksdetails = JSON.parse(storedBanks);
    } else {
      this.getActiveBanks();
    }

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
          bankId: response.bankId,
          sequence: response.sequence
        };

       

      },
      error: (err) => {
        console.error('Failed to fetch Bank details', err);
      }
    });
  }

  getActiveBanks() {
    this.dataprovider.getAllBank().subscribe(
      (response: Bank[]) => {
        this.banksdetails = response;
        sessionStorage.setItem('banks', JSON.stringify(response));
      },
      (error) => {
        console.error('Error fetching banks:', error);
      }
    );
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    // attach userId
    this.committee.userId = this.userId;

    if (this.isEdit) {
       this.committee.committeeId = this.committeeId;
      this.dataprovider.updateCommittee(this.committee).subscribe({
        next: (response) => {
          alert(response.message || 'Committee updated successfully');
          this.backToIndexPage();
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Unexpected error occurred';
          alert(errorMsg);
        }
      });
    } else {
      this.dataprovider.saveCommittee(this.committee).subscribe({
        next: (response) => {
          alert(response.message || 'Committee created successfully');
          this.getActiveBanks();
          this.backToIndexPage();
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Unexpected error occurred';
          alert(errorMsg);
        }
      });
    }
  }

  onReset() {
    this.committee = {};
     this.getCommitteeDetailById();
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
}
