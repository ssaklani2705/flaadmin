import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataProviderService } from '../../../service/data-provider.service';
import { Common } from '../../../classes/common';

@Component({
  selector: 'app-user-management-view',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './user-management-view.component.html',
  styleUrl: './user-management-view.component.scss',
})
export class UserManagementViewComponent {
  userId!: number;
  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;
  user: any = {};
  permissions: { [moduleName: string]: any } = {};
  permissionActions: string[] = [
    'addPer',
    'editPer',
    'deletePer',
    'approvePer',
    'adminApprovePer',
    'viewPer',
  ];
  permissionGroups: { name: string; modules: string[] }[] = [];
  transactionhistory: any[] = []; // ✅ initialized to avoid undefined error

  common = new Common();

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('userId')!;
    const queryParams = this.route.snapshot.queryParamMap;
    this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;

    this.getUserDetails();
  }

  getUserDetails() {
    this.dataprovider.getUserManagementDetailsById(this.userId).subscribe({
      next: (response) => {
        console.log(response);
        this.user = {
          name: response.firstName,
          expiryDate: response.expiryDate,
          telephone: response.telephone || 'NA',
          email: response.email,
          mobile: response.mobileNo,
          status: response.status,
          processPermission: response.pcbName || 'NA',
          isAdmin: response.isAdmin === 'Y',
          permission: response.permission,
        };

        // ✅ Assign and sort transaction history (latest first)
        this.transactionhistory = (response.transactionhistory || []).sort(
          (a: any, b: any) => {
            const dateA = this.parseEntryDate(a.entryDate);
            const dateB = this.parseEntryDate(b.entryDate);
            return dateB.getTime() - dateA.getTime();
          },
        );

        // Filter out modules where viewPer is null
        const filteredModules = response.module.filter(
          (mod: any) => mod.viewPer !== null,
        );

        // Map permissions only for filtered modules
        this.permissions = this.mapPermissions(filteredModules);

        // Grouping by 'type'
        const groupMap: {
          [type: number]: { name: string; modules: string[] };
        } = {
          1: { name: 'Masters', modules: [] },
          2: { name: 'Activity', modules: [] },
          3: { name: 'Reports', modules: [] },
          4: { name: 'Reports - 1', modules: [] },
          5: { name: 'Marketing', modules: [] },
          6: { name: 'CAPA Marketing', modules: [] },
        };

        filteredModules.forEach((mod: any) => {
          const type = mod.type;
          const name = mod.name.trim();
          if (groupMap[type]) {
            groupMap[type].modules.push(name);
          }
        });

        // Final sorted, filtered group array
        this.permissionGroups = Object.keys(groupMap)
          .sort((a, b) => +a - +b)
          .map((key) => groupMap[+key])
          .filter((group) => group.modules.length > 0);
      },
      error: (err) => {
        console.error('Failed to fetch user details', err);
      },
    });
  }

  mapPermissions(modules: any[]): { [moduleName: string]: any } {
    const perms: { [moduleName: string]: any } = {};

    modules
      .filter((mod) => mod.viewPer !== null)
      .forEach((mod) => {
        perms[mod.name.trim()] = {
          addPer: mod.addPer === 'Y',
          editPer: mod.editPer === 'Y',
          deletePer: mod.deletePer === 'Y',
          approvePer: mod.approvePer === 'Y',
          adminApprovePer: mod.adminApprovePer === 'Y',
          viewPer: mod.viewPer === 'Y',
        };
      });

    return perms;
  }

  getStatusLabel(status: number | string): string {
    switch (+status) {
      case 1:
        return 'Active';
      case 2:
        return 'Inactive';
      case 3:
        return 'Deleted';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: number | string): string {
    switch (+status) {
      case 1:
        return 'status-active';
      case 2:
        return 'status-inactive';
      case 3:
        return 'status-deleted';
      default:
        return '';
    }
  }

  /**
   * Utility: Parse entryDate string like "08-08-2025 05:53 PM" into Date
   */
  parseEntryDate(dateStr: string): Date {
    const [datePart, timePart, ampm] = dateStr.split(/[\s:]+/); // e.g., ["08-08-2025", "05", "53", "PM"]
    const [day, month, year] = datePart.split('-').map(Number);
    let hour = Number(timePart);
    const minute = Number(dateStr.split(/[\s:]+/)[2]);

    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    return new Date(year, month - 1, day, hour, minute);
  }

  get hasTransactionHistory(): boolean {
    return (
      Array.isArray(this.transactionhistory) &&
      this.transactionhistory.length > 0
    );
  }

  backToIndexPage() {
    this.router.navigate(['/userManagement']);
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Active';
      case 2:
        return 'Inactive';
      case 3:
        return 'Deleted';
      default:
        return 'Unknown';
    }
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
}
