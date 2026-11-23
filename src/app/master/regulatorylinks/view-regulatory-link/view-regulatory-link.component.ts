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
  selector: 'app-view-regulatory-link',
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
  templateUrl: './view-regulatory-link.component.html',
  styleUrl: './view-regulatory-link.component.scss'
})
export class ViewRegulatoryLinkComponent {

linkId!: number;
  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
  // bank: any = {};
  transactionhistory: any[] = []; // initialized to avoid undefined error
  common = new Common();  

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.linkId = +this.route.snapshot.paramMap.get('linkId')!;
    // alert(this.linkId);
     const queryParams = this.route.snapshot.queryParamMap;
  this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage -1;
    this.size = Number(queryParams.get('size')) || 5;
   
    this.getLinkDetails();
  }

  links: any = {};
getLinkDetails() {
    this.dataprovider.getRegulatoryLink(this.linkId).subscribe({
      next: (response) => {
        console.log(response);
        this.links = {
          name: response.name,
          url: response.url,
          status: response.status,
          linkId: response.linkId,
          sequence: response.sequence,
        };

        this.transactionhistory = (response.transactionhistory || []).sort((a: any, b: any) => {
          const dateA = this.common.parseEntryDate(a.entryDate);
          const dateB = this.common.parseEntryDate(b.entryDate);
          return dateB.getTime() - dateA.getTime();
        });

      },
      error: (err) => {
        console.error('Failed to fetch Link details', err);
      }
    });
  }

get hasTransactionHistory(): boolean {
  return Array.isArray(this.transactionhistory) && this.transactionhistory.length > 0;
}

 backToIndexPage() {
    this.router.navigate(['/regulatorylinks'], {
      queryParams: {
         currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size || 5
      }
    });
  }





resetPassword(email: string, userId: number) {

}


}
