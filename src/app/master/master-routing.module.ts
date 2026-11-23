import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewUserComponent } from './view-user/view-user.component';
import { AddUserComponent } from './add-user/add-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { IndexComponent } from './index/index.component';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { BankIndexComponent } from './bank/bank-index/bank-index.component';
import { ViewBankComponent } from './bank/view-bank/view-bank.component';
import { EditBankComponent } from './bank/edit-bank/edit-bank.component';
import { AddBankComponent } from './bank/add-bank/add-bank.component';
import { GalleryIndexComponent } from './gallery/gallery-index/gallery-index.component';
import { AddGalleryComponent } from './gallery/add-gallery/add-gallery.component';
import { ViewGalleryComponent } from './gallery/view-gallery/view-gallery.component';
import { RegulatoryLinkIndexComponent } from './regulatorylinks/regulatory-link-index/regulatory-link-index.component';
import { EditGalleryComponent } from './gallery/edit-gallery/edit-gallery.component';
import { AddRegulatoryLinkComponent } from './regulatorylinks/add-regulatory-link/add-regulatory-link.component';
import { EditRegulatoryLinkComponent } from './regulatorylinks/edit-regulatory-link/edit-regulatory-link.component';
import { ViewRegulatoryLinkComponent } from './regulatorylinks/view-regulatory-link/view-regulatory-link.component';
import { EventAndWebinarIndexComponent } from './EventsAndWebinar/event-and-webinar-index/event-and-webinar-index.component';
import { AddEventAndWebinarComponent } from './EventsAndWebinar/add-event-and-webinar/add-event-and-webinar.component';
import { ViewEventAndWebinarComponent } from './EventsAndWebinar/view-event-and-webinar/view-event-and-webinar.component';
import { EditEventAndWebinarComponent } from './EventsAndWebinar/edit-event-and-webinar/edit-event-and-webinar.component';
import { MaillogReportComponent } from '../Reports/maillog-report/maillog-report.component';
import { AccessReportComponent } from '../Reports/access-report/access-report.component';
import { KnowledgeSharingIndexComponent } from './KnowledgeSharing/knowledge-sharing-index/knowledge-sharing-index.component';
import { AddKnowledgeSharingComponent } from './KnowledgeSharing/add-knowledge-sharing/add-knowledge-sharing.component';
import { EditKnowledgeSharingComponent } from './KnowledgeSharing/edit-knowledge-sharing/edit-knowledge-sharing.component';
import { ViewKnowledgeSharingComponent } from './KnowledgeSharing/view-knowledge-sharing/view-knowledge-sharing.component';
import { UserManagementIndexComponent } from '../pages/UserManagement/user-management-index/user-management-index.component';
import { UserManagementViewComponent } from '../pages/UserManagement/user-management-view/user-management-view.component';
import { AddUserManagementComponent } from '../pages/UserManagement/add-user-management/add-user-management.component';
import { EditUserManagementComponent } from '../pages/UserManagement/edit-user-management/edit-user-management.component';
import { ForgetPasswordComponent } from '../pages/forget-password/forget-password.component';
import { CommitteeMembersComponent } from './CommitteeMembers/committee-members/committee-members.component';
import { ViewCommitteeMembersComponent } from './CommitteeMembers/view-committee-members/view-committee-members.component';
import { AddCommitteeMembersComponent } from './CommitteeMembers/add-committee-members/add-committee-members.component';
import { GalleryGroupIndexComponent } from './GalleryGroup/gallery-group-index/gallery-group-index.component';
import { AddGalleryGroupComponent } from './GalleryGroup/add-gallery-group/add-gallery-group.component';
import { ViewGalleryGroupComponent } from './GalleryGroup/view-gallery-group/view-gallery-group.component';
// import { AddDataComponent } from './CommitteeMembers/add-data/add-data.component';
import { DataIndexComponent } from './data/data-index/data-index.component';
import { AddDataComponent } from './data/add-data/add-data.component';
import { ViewDataComponent } from './data/view-data/view-data.component';
import { DataIndexAdminComponent } from './data-index-admin/data-index-admin/data-index-admin.component';
import { DataIndexAdminViewComponent } from './data-index-admin/data-index-admin-view/data-index-admin-view.component';

const routes: Routes = [
  // { path: 'forgot-password', component: ForgetPasswordComponent },
  { path: 'committeeMembers', component: CommitteeMembersComponent },
  {
    path: 'viewCommitteeMembers/:committeeId',
    component: ViewCommitteeMembersComponent,
    data: { renderMode: 'csr' },
  },
  { path: 'addCommitteeMembers', component: AddCommitteeMembersComponent },
  {
    path: 'addCommitteeMembers/:committeeId',
    component: AddCommitteeMembersComponent,
    data: { renderMode: 'csr' },
  },
  { path: 'addData', component: AddDataComponent },

  //User Management
  { path: 'userManagement', component: UserManagementIndexComponent },
  { path: 'addUserManagement', component: AddUserManagementComponent },
  {
    path: 'viewUserManagement/:userId',
    component: UserManagementViewComponent,
    data: { renderMode: 'csr' },
  },
  {
    path: 'editUserManagement/:userId',
    component: EditUserManagementComponent,
    data: { renderMode: 'csr' },
  },

  // data
  { path: 'data', component: DataIndexComponent },
  { path: 'addData', component: AddDataComponent },
  {
    path: 'viewData/:dataId',
    component: ViewDataComponent,
    data: { renderMode: 'csr' },
  },

  // Bank User
  {
    path: 'view-user/:userId',
    component: ViewUserComponent,
    data: { renderMode: 'csr' }, // Force client-side rendering
  },
  { path: 'addUser', component: AddUserComponent },
  {
    path: 'editUser/:bankUserId',
    component: EditUserComponent,
    data: { renderMode: 'csr' }, // Force client-side rendering
  },
  { path: 'bankuser', component: IndexComponent },
  { path: 'dashboard', component: DashboardComponent },

  // Bank
  { path: 'bank', component: BankIndexComponent },
  {
    path: 'view-bank/:bankId',
    component: ViewBankComponent,
    data: { renderMode: 'csr' }, // Force client-side rendering
  },
  {
    path: 'edit-bank/:bankId',
    component: EditBankComponent,
    data: { renderMode: 'csr' }, // Force client-side rendering
  },
  { path: 'add-bank', component: AddBankComponent },

  //Gallery
  { path: 'gallery', component: GalleryIndexComponent },
  { path: 'addGallery', component: AddGalleryComponent },
  {
    path: 'viewGallery/:galleryId',
    component: ViewGalleryComponent,
    data: { renderMode: 'csr' },
  },
  {
    path: 'edit-gellery/:galleryId',
    component: EditGalleryComponent,
    data: { renderMode: 'csr' },
  },

  // Regulatory Links
  { path: 'regulatorylinks', component: RegulatoryLinkIndexComponent },
  { path: 'addRegulatorylinks', component: AddRegulatoryLinkComponent },
  {
    path: 'edit-regulatorylinks/:linkId',
    component: EditRegulatoryLinkComponent,
    data: { renderMode: 'csr' }, // Force client-side rendering
  },
  {
    path: 'view-regulatorylinks/:linkId',
    component: ViewRegulatoryLinkComponent,
    data: { renderMode: 'csr' }, // Force client-side rendering
  },

  //EventsAndWebinar

  { path: 'eventsandwebinar', component: EventAndWebinarIndexComponent },
  { path: 'addEventsAndWebinar', component: AddEventAndWebinarComponent },
  {
    path: 'viewEventsAndWebinar/:eventId',
    component: ViewEventAndWebinarComponent,
    data: { renderMode: 'csr' },
  },
  {
    path: 'editEventsAndWebinar/:eventId',
    component: EditEventAndWebinarComponent,
    data: { renderMode: 'csr' },
  },

  //Knowledge Sharing
  { path: 'knowledgesharing', component: KnowledgeSharingIndexComponent },
  { path: 'addKnowledgeSharing', component: AddKnowledgeSharingComponent },
  {
    path: 'editKnowledgeSharing/:knowledgeId',
    component: EditKnowledgeSharingComponent,
    data: { renderMode: 'csr' },
  },
  {
    path: 'viewKnowledgeSharing/:knowledgeId',
    component: ViewKnowledgeSharingComponent,
    data: { renderMode: 'csr' },
  },

  //Gallery Group
  { path: 'gallery-group-index', component: GalleryGroupIndexComponent },
  { path: 'add-gallery-group', component: AddGalleryGroupComponent },
  {
    path: 'edit-gallery-group/:groupId',
    component: AddGalleryGroupComponent,
    data: { renderMode: 'csr' },
  },
  {
    path: 'view-gallery-group/:groupId',
    component: ViewGalleryGroupComponent,
    data: { renderMode: 'csr' },
  },

  //Maillog Report
  { path: 'maillogreport', component: MaillogReportComponent },

  //Access Report
  { path: 'accessreport', component: AccessReportComponent },

  { path: 'data-index', component: DataIndexAdminComponent },

  {
    path: 'view-data-index/:dataId',
    component: DataIndexAdminViewComponent,
    data: { renderMode: 'csr' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule {}
