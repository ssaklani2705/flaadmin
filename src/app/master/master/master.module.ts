import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewUserComponent } from '../view-user/view-user.component';
import { AddUserComponent } from '../add-user/add-user.component';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { MasterRoutingModule } from '../master-routing.module';

@NgModule({
  declarations: [
   
  ],
  imports: [
    CommonModule,
    MasterRoutingModule,
     ViewUserComponent,
    AddUserComponent,
    EditUserComponent
  ]
})
export class MasterModule { }
