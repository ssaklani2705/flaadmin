import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { FormGroup, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {  MatNativeDateModule } from '@angular/material/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import { DataProviderService } from '../../../service/data-provider.service';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',   // parsing input format
  },
  display: {
    dateInput: 'DD-MM-YYYY',   // how it displays inside input
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-edit-user-management',
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
  templateUrl: './edit-user-management.component.html',
  styleUrl: './edit-user-management.component.scss',
   providers: [
      { provide: DateAdapter, useClass: MyDateAdapter },
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
      { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
    ]
})
export class EditUserManagementComponent {
 userForm: FormGroup | undefined;
  userId!: number;
  user: any = {};
  permissions: { [moduleName: string]: any } = {};
  permissionActions: string[] = ['addPer', 'editPer', 'deletePer', 'approvePer', 'adminApprovePer', 'viewPer'];
  permissionGroups: { name: string, modules: string[] }[] = [];
  selectAllRows: { [groupName: string]: { [action: string]: boolean } } = {};
  originalModules: any[] = [];
originalPermissions: { [moduleName: string]: any } = {}; 
createdBy:any;

  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;

minDate: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDate = today;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
    this.createdBy = sessionStorage.getItem('userId');
  }
    this.userId = +this.route.snapshot.paramMap.get('userId')!;
   const queryParams = this.route.snapshot.queryParamMap;
    this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage -1;
    this.size = Number(queryParams.get('size')) || 5;

    this.getUserDetails();
    this.onAdminPermissionToggle();

     if (!this.user.expiryDate) {
      this.user.expiryDate = null;
    }
  }

    disablePastDates = (d: Date | null): boolean => {
    if (!d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date >= today;
  };

onSubmit() {


 // Name validation
  if (!this.user.name || !/^[a-zA-Z\s]+$/.test(this.user.name.trim())) {
    alert("Please enter a valid Name.");
    document.querySelector<HTMLInputElement>('input[placeholder="Enter name"]')?.focus();
    return;
  }

 if (!this.user.email) {
  alert("Please enter an Email address.");
  document.querySelector<HTMLInputElement>('input[placeholder="Enter email"]')?.focus();
  return;
}

// Basic email format check
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailPattern.test(this.user.email)) {
  alert("Please enter a valid Email address.");
  document.querySelector<HTMLInputElement>('input[placeholder="Enter email"]')?.focus();
  return;
}

// Extra check for '.com,.in' ending
// const strictEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;
const strictEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (!strictEmailPattern.test(this.user.email)) {
  alert("Please enter a valid Email address.");
  document.querySelector<HTMLInputElement>('input[placeholder="Enter email"]')?.focus();
  return;
}

  // Expiry date validation
  // if (!this.user.expiryDate) {
  //   alert("Please select a valid Expiry Date.");
  //   document.querySelector<HTMLInputElement>('[matdatepicker]')?.focus();
  //   return;
  // }
if (!this.validateExpiryDate()) {
    return;
  }
  

  // Mobile validation
  if (!this.user.mobile) {
    alert("Please enter a Mobile Number.");
    document.querySelector<HTMLInputElement>('input[placeholder="Enter mobile number"]')?.focus();
    return;
  }
  if (!/^\d{10}$/.test(this.user.mobile)) {
    alert("Please enter a valid 10-digit Mobile Number.");
    document.querySelector<HTMLInputElement>('input[placeholder="Enter mobile number"]')?.focus();
    return;
  }
  
  const userRequest = {
    userId: this.userId,
    firstName: this.user.name,
    mobileNo: this.user.mobile,
    email: this.user.email,
    expiryDate: this.user.expiryDate,
    permission: this.user.permission,
    status: this.user.status,
    qcFlag: this.user.qcFlag,
    telephone: this.user.telephone,
    // pcb: this.user.processPermission
    //   .filter((p: any) => p.selected)
    //   .map((p: any) => p.processId)
    //   .join(','),
      createdBy:this.createdBy,
    module: this.buildModulePermissions()
  };

  console.log(userRequest);

  this.dataprovider.saveUserManagementDetailsDetail(userRequest).subscribe({
    next: (res: any) => {
      if (res.success) {
        alert(res.data);
        this.backToIndexPage();
      } else {
        alert("Update failed: " + res.message);
      }
    },
    error: (err) => {
      console.error("API Error:", err);
      // alert("Something went wrong while updating the user.");
      const backendMessage = err?.error?.message || "Failed to save user. Please try again.";
    alert("Update failed: " + backendMessage);
    }
  });
}

onAdminPermissionToggle() {
  this.user.permission = this.user.permissionCheckbox ? 'Y' : 'N';
}

private buildModulePermissions() {
  return this.originalModules.map((mod: any) => ({
    moduleId: mod.moduleId,
    addPer: this.permissions[mod.name.trim()].addPer ? 'Y' : 'N',
    editPer: this.permissions[mod.name.trim()].editPer ? 'Y' : 'N',
    deletePer: this.permissions[mod.name.trim()].deletePer ? 'Y' : 'N',
    approvePer: this.permissions[mod.name.trim()].approvePer ? 'Y' : 'N',
    adminApprovePer: this.permissions[mod.name.trim()].adminApprovePer ? 'Y' : 'N',
    viewPer: this.permissions[mod.name.trim()].viewPer ? 'Y' : 'N'
  }));
}


getUserDetails() {
  // this.dataprovider.getUserById(this.userId).subscribe({
  this.dataprovider.getUserManagementDetailsById(this.userId).subscribe({
    next: (response) => {
      this.originalModules = response.module;

      //let processList: any[] = [];
      // if (isPlatformBrowser(this.platformId)) {
      //   processList = JSON.parse(sessionStorage.getItem('processList') || '[]');
      // }

      // const pcbIds = response.pcb
      //   ? response.pcb.split(',').map((id: string) => +id.trim())
      //   : [];

      // this.user.processPermission = processList.map((proc: any) => ({
      //   ...proc,
      //   selected: pcbIds.includes(proc.processId)
      // }));

      this.user = {
        ...this.user,
        name: response.firstName,
        expiryDate: response.expiryDate,
        // telephone: response.telephone || 'NA',
        telephone: (response.telephone && response.telephone !== 'NA') ? response.telephone : '',
        email: response.email,
        mobile: response.mobileNo,
        status: response.status,
        isAdmin: response.isAdmin === 'Y',
        permission: response.permission,
        permissionCheckbox: response.permission === 'Y',
        // qcFlag: response.qcFlag
      };

      this.permissions = this.mapPermissions(response.module);
      this.originalPermissions = JSON.parse(JSON.stringify(this.permissions));

      const groupMap: { [type: number]: { name: string, modules: string[] } } = {
        1: { name: 'Masters', modules: [] },
        2: { name: 'Activity', modules: [] },
        3: { name: 'Reports', modules: [] },
        // 3: { name: 'Reports', modules: [] },
        // 4: { name: 'Reports - 1', modules: [] },
        // 5: { name: 'Marketing', modules: [] },
        // 6: { name: 'CAPA Marketing', modules: [] }
      };

      response.module.forEach((mod: any) => {
        const type = mod.type;
        const name = mod.name.trim();
        if (groupMap[type]) {
          groupMap[type].modules.push(name);
        }
      });

      // for (const key in groupMap) {
      //   groupMap[+key].modules.sort((a, b) => a.localeCompare(b));
      // }

      this.permissionGroups = Object.keys(groupMap)
        .sort((a, b) => +a - +b)
        .map(key => groupMap[+key])
        .filter(group => group.modules.length > 0);

      this.initializeSelectAllRows();
    },
    error: (err) => {
      console.error('Failed to fetch user details', err);
    }
  });
}



  mapPermissions(modules: any[]): { [moduleName: string]: any } {
    const perms: { [moduleName: string]: any } = {};
    modules.forEach(mod => {
      const name = mod.name.trim();
      perms[name] = {
        addPer: mod.addPer === 'Y',
        editPer: mod.editPer === 'Y',
        deletePer: mod.deletePer === 'Y',
        approvePer: mod.approvePer === 'Y',
        adminApprovePer: mod.adminApprovePer === 'Y',
        viewPer: mod.viewPer === 'Y'
      };
    });
    return perms;
  }

  initializeSelectAllRows(): void {
    this.selectAllRows = {};
    this.permissionGroups.forEach(group => {
      this.selectAllRows[group.name] = {};
      this.permissionActions.forEach(action => {
        const allChecked = group.modules.every(mod =>
          this.permissions[mod]?.[action]
        );
        this.selectAllRows[group.name][action] = allChecked;
      });
    });
  }


toggleGroupSelectAll(groupName: string, action: string): void {
  const isChecked = this.selectAllRows[groupName][action];
  const group = this.permissionGroups.find(g => g.name === groupName);
  if (!group) return;

  group.modules.forEach(mod => {
    if (!this.permissions[mod]) return;

    if (action === 'viewPer') {
      // ✅ For View Only, just set viewPer directly
      this.permissions[mod].viewPer = isChecked;
    } else {
      // Set the clicked main action for all modules
      this.permissions[mod][action] = isChecked;

      // ✅ Update viewPer based on ANY main permission
      const anyMainChecked = this.permissionActions
        .filter(a => a !== 'viewPer')
        .some(a => this.permissions[mod][a]);
      this.permissions[mod].viewPer = anyMainChecked;
    }
  });

  // ✅ Update Select All for viewPer column
  const allViewChecked = group.modules.every(mod => this.permissions[mod]?.viewPer);
  this.selectAllRows[groupName]['viewPer'] = allViewChecked;
}


updateSelectAll(groupName: string, action: string): void {
  const group = this.permissionGroups.find(g => g.name === groupName);
  if (!group) return;

  // Update the "Select All" checkbox for this column
  const allChecked = group.modules.every(mod => this.permissions[mod]?.[action]);
  this.selectAllRows[groupName][action] = allChecked;

  // ✅ Update View Only for each module based on ANY main permission
  group.modules.forEach(mod => {
    if (this.permissions[mod]) {
      const anyMainChecked = this.permissionActions
        .filter(a => a !== 'viewPer')
        .some(a => this.permissions[mod][a]);
      this.permissions[mod].viewPer = anyMainChecked;
    }
  });

  // ✅ Update "Select All" for View Only column
  const allViewChecked = group.modules.every(mod => this.permissions[mod]?.viewPer);
  this.selectAllRows[groupName]['viewPer'] = allViewChecked;
}


  getStatusLabel(status: number | string): string {
    switch (+status) {
      case 1: return 'Active';
      case 2: return 'Inactive';
      case 3: return 'Deleted';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: number | string): string {
    switch (+status) {
      case 1: return 'status-active';
      case 2: return 'status-inactive';
      case 3: return 'status-deleted';
      default: return '';
    }
  }


onReset() {
   this.userForm?.reset();
   this.getUserDetails();
  this.permissions = JSON.parse(JSON.stringify(this.originalPermissions));
  this.initializeSelectAllRows();
}

 backToIndexPage() {
    this.router.navigate(['/userManagement'], {
      queryParams: {
         currentPage: this.currentPage,
        statusIndex: this.statusIndex || null,
        searchText: this.searchText || null,
        //page: this.page,
        size: this.size || 5
      }
    });
  }

  allowOnlyLetters(event: KeyboardEvent) {
  const char = event.key;
  // Allow only alphabets and space
  if (!/^[a-zA-Z\s]$/.test(char)) {
    event.preventDefault();
  }
}

allowOnlyNumbers(event: KeyboardEvent) {
  const charCode = event.which ? event.which : event.keyCode;
  // Only allow digits (0–9)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}

validateExpiryDate() {
  if (!this.user.expiryDate) {
    alert("Please select a valid Expiry Date.");
    document.querySelector<HTMLInputElement>('[matdatepicker]')?.focus();
    return false;
  }

  const enteredDate = new Date(this.user.expiryDate);
  const min = new Date(this.minDate);

  // Remove time part for accurate comparison
  enteredDate.setHours(0, 0, 0, 0);
  min.setHours(0, 0, 0, 0);

  if (enteredDate < min) {
    // alert(`Expiry Date cannot be before ${min.toLocaleDateString()}`);
     alert(`Expiry Date cannot be a past date.`);
    document.querySelector<HTMLInputElement>('[matdatepicker]')?.focus();
    return false;
  }
  return true;
}

allowOnlyDateChars(event: KeyboardEvent) {
  const char = event.key;

  // Allow digits, dash, slash, Backspace, Delete, Tab, Arrow keys
  if (!/[0-9\-\/]/.test(char) && 
      char !== 'Backspace' && 
      char !== 'Delete' && 
      char !== 'Tab' && 
      !event.ctrlKey && 
      !event.metaKey && 
      !['ArrowLeft', 'ArrowRight'].includes(char)) {
    event.preventDefault();
  }
}

}