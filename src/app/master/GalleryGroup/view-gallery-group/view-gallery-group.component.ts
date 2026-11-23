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
  selector: 'app-view-gallery-group',
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
  templateUrl: './view-gallery-group.component.html',
  styleUrl: './view-gallery-group.component.scss'
})
export class ViewGalleryGroupComponent {

groupId!: number;
  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
  group: any = {};
  transactionhistory: any[] = []; // ✅ initialized to avoid undefined error
  common = new Common();  

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.groupId = +this.route.snapshot.paramMap.get('groupId')!;
     const queryParams = this.route.snapshot.queryParamMap;
  this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage -1;
    this.size = Number(queryParams.get('size')) || 5;
   
    this.getGroupDetailById();
  }

  getGroupDetailById() {
    this.dataprovider.getGroupDetailById(this.groupId).subscribe({
      next: (response) => {
        console.log(response);
        this.group = {
          name: response.name,
          status: response.status,
          date: response.date,
        };

        this.transactionhistory = (response.transactionhistory || []).sort((a: any, b: any) => {
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
    this.router.navigate(['/gallery-group-index'], {
      queryParams: {
         currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size || 5
      }
    });
  }




}
