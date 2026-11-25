import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MAT_DATE_FORMATS,
  DateAdapter,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import { DataProviderService } from '../../../service/data-provider.service';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY', // parsing input format
  },
  display: {
    dateInput: 'DD-MM-YYYY', // how it displays inside input
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-add-user-management',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './add-user-management.component.html',
  styleUrl: './add-user-management.component.scss',
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
})
export class AddUserManagementComponent {
  userForm: FormGroup;

  processPermissions: string[] = [];
  processList: any[] = [];
  rightsAndPermissionId: any = 0;

  permissionActions = [
    'Add',
    'Edit',
    'Delete',
    'Approve',
    'Admin Approval',
    'View Only',
  ];

  permissions: any = {};
  selectAllRows: any = {};
  selectAll: any = {};
  createdBy: any;

  originalPermissions: any = {};
  originalSelectAllRows: any = {};

  currentPage = 0;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 0;

  minDate: Date = new Date();

  typeGroupMap: { [key: number]: string } = {
    1: 'Masters',
    2: 'Activity',
    3: 'Reports',
    // 3: 'Reports',
    // 4: 'Reports - 1',
    // 5: 'Marketing',
    // 6: 'CAPA Marketing'
  };

  groupedModules: { type: number; modules: any[] }[] = [];

  constructor(
    private fb: FormBuilder,
    private dataProvider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      expiryDate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      telephone: [''],
      isAdmin: [false],
      processPermissions: this.fb.group({}),
    });

    this.permissionActions.forEach((action) => {
      this.selectAll[action] = false;
    });

    this.originalPermissions = JSON.parse(JSON.stringify(this.permissions));
    this.originalSelectAllRows = JSON.parse(JSON.stringify(this.selectAllRows));

    this.userForm.get('isAdmin')?.valueChanges.subscribe((isAdmin: boolean) => {
      if (isAdmin) {
        this.clearAllPermissions();
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createdBy = sessionStorage.getItem('userId');
    }

    const queryParams = this.route.snapshot.queryParamMap;
    this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;

    this.loadUserRights(0);

    if (isPlatformBrowser(this.platformId)) {
      const storedData = sessionStorage.getItem('userDetails');
      // const storedProcessList = sessionStorage.getItem('processList');

      // let processListData: any[] = [];

      // if (storedData) {
      //   const parsedData = JSON.parse(storedData);
      //   processListData = parsedData.processList || [];
      // }
      // else if (storedProcessList) {
      //   processListData = JSON.parse(storedProcessList);
      // }

      // if (processListData.length) {
      //   this.processList = processListData;
      //   this.processPermissions = this.processList.map(p => p.name);

      //   const processPermissionsGroup = this.fb.group({});
      //   this.processList.forEach(p => {
      //     processPermissionsGroup.addControl(p.name, this.fb.control(false));
      //   });
      //   this.userForm.setControl('processPermissions', processPermissionsGroup);
      // }
    }
  }

  clearAllPermissions() {
    Object.keys(this.permissions).forEach((module) => {
      Object.keys(this.permissions[module]).forEach((action) => {
        this.permissions[module][action] = false;
      });
    });

    this.permissionActions.forEach((action) => {
      this.selectAll[action] = false;
    });

    Object.keys(this.selectAllRows).forEach((groupName) => {
      Object.keys(this.selectAllRows[groupName]).forEach((action) => {
        this.selectAllRows[groupName][action] = false;
      });
    });
  }

  isSubmitting = false;
  onSubmit() {
    if (this.isSubmitting) {
      return; // prevent multiple clicks
    }

    if (this.userForm.get('name')?.invalid) {
      alert('Please enter a valid Name.');
      document
        .querySelector<HTMLInputElement>('[formControlName="name"]')
        ?.focus();
      this.userForm.get('name')?.markAsTouched();
      return;
    }
    const emailControl = this.userForm.get('email');
    if (
      emailControl?.invalid ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        emailControl?.value || '',
      )
    ) {
      if (emailControl?.hasError('required')) {
        alert('Please enter an Email address.');
      } else if (
        emailControl?.hasError('email') ||
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
          emailControl?.value || '',
        )
      ) {
        alert('Please enter a valid Email address.');
      }
      document
        .querySelector<HTMLInputElement>('[formControlName="email"]')
        ?.focus();
      emailControl?.markAsTouched();
      return;
    }
    // if (emailControl?.invalid || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/.test(emailControl?.value || '')) {
    //   if (emailControl?.hasError('required')) {
    //     alert("Please enter an Email address.");
    //   } else if (emailControl?.hasError('email') || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/.test(emailControl?.value || '')) {
    //     alert("Please enter a valid Email address.");
    //   }
    //   document.querySelector<HTMLInputElement>('[formControlName="email"]')?.focus();
    //   emailControl?.markAsTouched();
    //   return;
    // }
    // alert(this.userForm.get('expiryDate')?.value);
    if (this.userForm.get('expiryDate')?.invalid) {
      alert('Please select a valid Expiry Date.');
      document
        .querySelector<HTMLInputElement>('[formControlName="expiryDate"]')
        ?.focus();
      this.userForm.get('expiryDate')?.markAsTouched();
      return;
    }

    if (this.userForm.get('mobile')?.invalid) {
      alert('Please enter a valid Mobile Number.');
      document
        .querySelector<HTMLInputElement>('[formControlName="mobile"]')
        ?.focus();
      this.userForm.get('mobile')?.markAsTouched();
      return;
    }

    // Prevent multiple submit
    this.isSubmitting = true;

    const formValues = this.userForm.value;
    const formattedExpiryDate = formValues.expiryDate;
    // alert("formattedExpiryDate "+formattedExpiryDate);

    const selectedProcessIds = this.processList
      .filter((p) => formValues.processPermissions[p.name] === true)
      .map((p) => p.processId);

    const pcbValue = selectedProcessIds.length
      ? selectedProcessIds.join(',')
      : null;

    //  Build module array with real moduleId & filter only selected
    const modulesArray = this.groupedModules.flatMap((group) =>
      group.modules
        .filter((module) =>
          this.permissionActions.some(
            (action) => this.permissions[module.name][action],
          ),
        )
        .map((module) => {
          const modulePermissions = this.permissions[module.name];
          return {
            moduleId: module.moduleId.toString(),
            addPer: modulePermissions['Add'] ? 'Y' : 'N',
            editPer: modulePermissions['Edit'] ? 'Y' : 'N',
            deletePer: modulePermissions['Delete'] ? 'Y' : 'N',
            approvePer: modulePermissions['Approve'] ? 'Y' : 'N',
            adminApprovePer: modulePermissions['Admin Approval'] ? 'Y' : 'N',
            viewPer: modulePermissions['View Only'] ? 'Y' : 'N',
          };
        }),
    );

    const payload = {
      userId: 0,
      firstName: formValues.name,
      mobileNo: formValues.mobile,
      email: formValues.email.trim(),
      expiryDate: formattedExpiryDate,
      permission: formValues.isAdmin ? 'Y' : 'N',
      status: 1,
      qcFlag: 0,
      telephone: formValues.telephone || '',
      pcb: pcbValue,
      createdBy: this.createdBy,
      module: modulesArray,
    };

    this.dataProvider.saveUserManagementDetailsDetail(payload).subscribe({
      next: (response) => {
        console.log('User saved successfully:', response);
        alert('User saved successfully!');
        this.onReset();
        this.backToIndexPage();
        this.isSubmitting = false; //  re-enable after success
      },
      error: (err) => {
        const backendMessage =
          err?.error?.message || 'Failed to save user. Please try again.';
        alert('Update failed: ' + backendMessage);
        //  re-enable on error
        this.isSubmitting = false;
      },
    });
  }

  toggleGroupSelectAll(groupName: string, action: string) {
    const group = this.groupedModules.find(
      (g) => this.typeGroupMap[g.type] === groupName,
    );
    if (!group) return;

    const newValue = this.selectAllRows[groupName][action];
    const dependentActions = [
      'Add',
      'Edit',
      'Delete',
      'Approve',
      'Admin Approval',
    ];

    group.modules.forEach((module) => {
      this.permissions[module.name][action] = newValue;

      // Auto-set View Only when dependent action toggled
      if (dependentActions.includes(action)) {
        if (newValue) {
          this.permissions[module.name]['View Only'] = true;
        } else {
          const hasAnyPermission = dependentActions.some(
            (a) => this.permissions[module.name][a],
          );
          if (!hasAnyPermission) {
            this.permissions[module.name]['View Only'] = false;
          }
        }
      }
    });

    // ✅ Update View Only select-all checkbox in header
    if (dependentActions.includes(action)) {
      const allViewOnlySelected = group.modules.every(
        (m) => this.permissions[m.name]['View Only'],
      );
      this.selectAllRows[groupName]['View Only'] = allViewOnlySelected;
    }

    if (action === 'View Only' && !newValue) {
    }
  }

  toggleSinglePermission(
    groupName: string,
    moduleName: string,
    action: string,
  ) {
    const dependentActions = [
      'Add',
      'Edit',
      'Delete',
      'Approve',
      'Admin Approval',
    ];

    // Handle auto View Only when a dependent action is checked
    if (dependentActions.includes(action)) {
      if (this.permissions[moduleName][action]) {
        this.permissions[moduleName]['View Only'] = true;
      } else {
        const hasAnyPermission = dependentActions.some(
          (a) => this.permissions[moduleName][a],
        );
        if (!hasAnyPermission) {
          this.permissions[moduleName]['View Only'] = false;
        }
      }
    }

    // ✅ Update "Select All" state for this column in the header
    const group = this.groupedModules.find(
      (g) => this.typeGroupMap[g.type] === groupName,
    );
    if (!group) return;

    const allChecked = group.modules.every(
      (m) => this.permissions[m.name][action],
    );
    this.selectAllRows[groupName][action] = allChecked;

    // ✅ Keep View Only header checkbox synced
    if (dependentActions.includes(action)) {
      const allViewOnlySelected = group.modules.every(
        (m) => this.permissions[m.name]['View Only'],
      );
      this.selectAllRows[groupName]['View Only'] = allViewOnlySelected;
    }
  }

  toggleSelectAll(action: string) {
    const newValue = this.selectAll[action];
    this.groupedModules.forEach((group) => {
      const groupName = this.typeGroupMap[group.type];
      this.selectAllRows[groupName][action] = newValue;
      group.modules.forEach((module) => {
        this.permissions[module.name][action] = newValue;
      });
    });
  }

  onReset() {
    this.userForm.reset({
      name: '',
      email: '',
      mobile: '',
      expiryDate: '',
      telephone: '',
      isAdmin: false,
      processPermissions: this.processPermissions.reduce((acc, perm) => {
        acc[perm] = false;
        return acc;
      }, {} as any),
    });
    this.permissions = JSON.parse(JSON.stringify(this.originalPermissions));
    this.selectAllRows = JSON.parse(JSON.stringify(this.originalSelectAllRows));
    this.permissionActions.forEach((action) => {
      this.selectAll[action] = false;
    });
  }

  loadUserRights(rightsAndPermissionId: number) {
    // this.dataProvider.getRightsAndPermission(rightsAndPermissionId).subscribe(
    this.dataProvider
      .getUserManagementDetailsById(rightsAndPermissionId)
      .subscribe((res: any) => {
        if (res?.module) {
          const sortedModules = [...res.module].sort((a, b) => a.type - b.type);

          const grouped: { [key: number]: any[] } = {};
          sortedModules.forEach((m) => {
            if (!grouped[m.type]) {
              grouped[m.type] = [];
            }
            grouped[m.type].push(m);
          });

          this.groupedModules = Object.keys(grouped).map((type) => ({
            type: Number(type),
            modules: grouped[Number(type)],
          }));

          this.permissions = {};
          this.selectAllRows = {};

          this.groupedModules.forEach((group) => {
            const groupName = this.typeGroupMap[group.type];
            this.selectAllRows[groupName] = {};

            group.modules.forEach((module) => {
              this.permissions[module.name] = {};
              this.permissionActions.forEach((action) => {
                this.permissions[module.name][action] = false;
                this.selectAllRows[groupName][action] = false;
              });
            });
          });

          this.originalPermissions = JSON.parse(
            JSON.stringify(this.permissions),
          );
          this.originalSelectAllRows = JSON.parse(
            JSON.stringify(this.selectAllRows),
          );
        }
      });
  }

  onPermissionChange(moduleName: string, action: string) {
    const dependentActions = [
      'Add',
      'Edit',
      'Delete',
      'Approve',
      'Admin Approval',
    ];

    // If any of the main actions is checked → force View Only to true
    if (dependentActions.includes(action)) {
      const hasAnyPermission = dependentActions.some(
        (a) => this.permissions[moduleName][a],
      );
      if (hasAnyPermission) {
        this.permissions[moduleName]['View Only'] = true;
      } else {
        this.permissions[moduleName]['View Only'] = false;
      }
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // Only allow digits (0–9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  allowOnlyLetters(event: KeyboardEvent) {
    const char = event.key;
    // Allow only alphabets and space
    if (!/^[a-zA-Z\s]$/.test(char)) {
      event.preventDefault();
    }
  }

  backToIndexPage() {
    this.router.navigate(['/userManagement']);
  }

  allowOnlyDateChars(event: KeyboardEvent) {
    const char = event.key;

    // Allow digits, dash, slash, Backspace, Delete, Tab, Arrow keys
    if (
      !/[0-9\-\/]/.test(char) &&
      char !== 'Backspace' &&
      char !== 'Delete' &&
      char !== 'Tab' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !['ArrowLeft', 'ArrowRight'].includes(char)
    ) {
      event.preventDefault();
    }
  }
}
