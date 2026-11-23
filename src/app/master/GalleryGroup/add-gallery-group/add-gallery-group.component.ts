import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule
} from '@angular/material/core';
import { DataProviderService } from '../../../service/data-provider.service';
import { ValidationUtils } from '../../../classes/ValidationUtils';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import { MatSelectModule } from '@angular/material/select';

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'DD-MM-YYYY' },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'app-add-gallery-group',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './add-gallery-group.component.html',
  styleUrl: './add-gallery-group.component.scss',
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class AddGalleryGroupComponent implements OnInit {

  isEditMode = false;
  nameError = '';
  userId!: number;

  group = {
    groupId: null as number | null,
    name: '',
    date: new Date(),
    userId: 0,
    status:0
  };


originalGroup: any = {};

  currentPage = 1;
  searchText = '';
  statusIndex = 0;
  size = 5;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;

    this.currentPage = Number(params.get('currentPage')) || 1;
    this.searchText = params.get('searchText') || '';
    this.statusIndex = Number(params.get('statusIndex')) || 0;
    this.size = Number(params.get('size')) || 5;

    if (isPlatformBrowser(this.platformId)) {
      this.userId = Number(sessionStorage.getItem('userId')) || 0;
    }

    // const id = params.get('groupId');
    const id = this.route.snapshot.params['groupId'];
    // alert(id);
    if (id) {
      this.isEditMode = true;
      this.loadGroupById(Number(id));
    }
  }

  loadGroupById(id: number): void {
    this.dataprovider.getGroupById(id).subscribe(res => {
      if (res.success && res.data) {
        this.group = {
          groupId: res.data.groupId,
          name: res.data.name,
          date: new Date(res.data.date),
          userId: res.data.userId,
          status: res.data.status
        };
        this.originalGroup = JSON.parse(JSON.stringify(res.data)); 
      }
    });
  }

  validateBankName(): void {
    const result = ValidationUtils.validateForName(this.group.name);
    this.nameError = result.valid ? '' : result.message;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    // this.validateBankName();
    // if (this.nameError) return;

    this.group.userId = this.userId;

    this.dataprovider.saveGroup(this.group).subscribe({
      next: res => {
        alert(res.message);
        this.backToIndexPage();
      },
      error: err => {
        alert(err.error?.message || 'Something went wrong');
      }
    });
  }

  onReset(): void {
     if (!this.isEditMode) {
       this.group = {
      groupId: this.isEditMode ? this.group.groupId : null,
      name: '',
      date: new Date(),
      userId: this.userId,
      status:0
    };
    } else {
      this.group = JSON.parse(JSON.stringify(this.originalGroup));
    }
    this.nameError = '';
  }




  backToIndexPage(): void {
    this.router.navigate(['/gallery-group-index'], {
      queryParams: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size
      }
    });
  }
}
