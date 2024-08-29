import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActionComponent } from './attendance/action/action.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddJobsComponent } from './jobs/add-jobs/add-jobs.component';
import { JobsComponent } from './jobs/jobs.component';
import { LoginComponent } from './login/login.component';
import { AddprojectComponent } from './projects/addproject/addproject.component';
import { ProjectsComponent } from './projects/projects.component';
import { ViewProjectComponent } from './projects/view-project/view-project.component';
import { RegisterComponent } from './register/register.component';
import { SettingsComponent } from './settings/settings.component';
import { EditTimeTrackerComponent } from './time-tracker/edit-time-tracker/edit-time-tracker.component';
import { TimeTrackerComponent } from './time-tracker/time-tracker.component';
import { AttendancemonthlyreportComponent } from './attendance/attendancemonthlyreport/attendancemonthlyreport.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
// import { InternshipComponent } from './hr-letters/business-letter/internship.component';
import { ManageOrgComponent } from './manage-org/manage-org.component';
import { EditOrgComponent } from './manage-org/edit-org/edit-org.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
// import { AddInternshipComponent } from './hr-letters/business-letter/create-business/add-internship.component';
import { AuthGuard } from './core/auth.guard';
import { EditPersonalComponent } from './my-account/edit-personal/edit-personal.component';
// import {ViewInternshipComponent} from './hr-letters/business-letter/view-business/view-internship.component'
// import {DeleteInternshipComponent} from './hr-letters/business-letter/delete-business/delete-internship.component';

import { ReportsComponent } from './reports/reports.component';
import { EmployeedetailsComponent } from './reports/employeedetails/employeedetails.component';
import { EmployeeattendancedatereportComponent } from './reports/attendance/employeeattendancedatereport/employeeattendancedatereport.component';
import { TimesheetsComponent } from './time-tracker/timesheets/timesheets.component';
import { ApprovalsComponent } from './time-tracker/approvals/approvals.component';
// import {OfferComponent} from './hr-letters/offer/offer.component';
// import {AddOfferComponent} from './hr-letters/offer/add-offer/add-offer.component';
// import {ViewOfferComponent} from './hr-letters/offer/view-offer/view-offer.component';
// import {DeleteOfferComponent} from './hr-letters/offer/delete-offer/delete-offer.component';
import { ViewLogsComponent } from './time-tracker/timesheets/view-logs/view-logs.component';
import { ApproveRejectComponent } from './time-tracker/approvals/approve-reject/approve-reject.component';
// import { PreviewLetterComponent } from './hr-letters/business-letter/preview-business/preview-letter.component';
// import {PreviewOfferComponent} from './hr-letters/offer/preview-offer/preview-offer.component';
import { LeaveTrackerComponent } from './leave-tracker/leave-tracker.component';
import { ApplyLeaveComponent } from './leave-tracker/apply-leave/apply-leave.component';
import { InactiveOrgsComponent } from './manage-org/inactive-orgs/inactive-orgs.component';
import { SuperAdminDashboardComponent } from './super-admin-dashboard/super-admin-dashboard.component'
import { MaintenancePageComponent } from './maintenance-page/maintenance-page.component';
import { RequestedOrgDetailsComponent } from './manage-org/requested-org-details/requested-org-details.component';
import { MobileNavComponent } from './util/mobile-nav/mobile-nav.component';
import { MobileNotificationComponent } from './util/mobile-notification/mobile-notification.component';
import { ManagePricingPlanComponent } from './manage-pricing-plan/manage-pricing-plan.component';
import { AddPricingPlanComponent } from './manage-pricing-plan/add-pricing-plan/add-pricing-plan.component';
import { UserReportsComponent } from './reports/attendance/user-reports/user-reports.component';
import { ManageClientDetailsComponent } from './projects/project-settings/manage-client-details/manage-client-details.component';
import { OrgsPlandetailsComponent } from './my-account/orgs-plandetails/orgs-plandetails.component';
import { LtSettingsComponent } from './leave-tracker/lt-settings/lt-settings.component';
import { DayPlannerComponent } from './day-planner/day-planner.component';
import { AddTaskComponent } from './day-planner/add-task/add-task.component';
import { LtSettingsFormsComponent } from './leave-tracker/lt-settings/lt-settings-forms/lt-settings-forms.component';
import { AdSettingsComponent } from './attendance/ad-settings/ad-settings.component';
import { ActionCardFormComponent } from './attendance/ad-settings/manage-action-cards/action-card-form/action-card-form.component';
import { AddClientFormComponent } from './projects/project-settings/manage-client-details/add-client-form/add-client-form.component';
import { DpSettingsComponent } from './day-planner/dp-settings/dp-settings.component';
import { SlackFormComponent } from './general-components/integration-forms/slack-form/slack-form.component';
import { WhatsappFormComponent } from './general-components/integration-forms/whatsapp-form/whatsapp-form.component';
import { ManageActionCardsComponent } from './attendance/ad-settings/manage-action-cards/manage-action-cards.component';
import { UserReportsLeavetrackerComponent } from './reports/leavetracker/user-reports/user-reports-leavetracker/user-reports-leavetracker.component';
import { ProjectSettingsComponent } from './projects/project-settings/project-settings.component';

import { ReleaseNotesComponent } from './super-admin-dashboard/release-notes/release-notes.component';
import { AddNotesComponent } from './super-admin-dashboard/release-notes/add-notes/add-notes.component';
import { BacklogsComponent } from './backlogs/backlogs.component';
import { AllDayPlannerComponent } from './day-planner/all-day-planner/all-day-planner.component';
import { ManageRoleComponent } from './settings/manage-role/manage-role.component';
import { AddRoleComponent } from './settings/manage-role/add-role/add-role.component';
import { ManageDesignationComponent } from './settings/manage-designation/manage-designation.component';
import { AddDesignationComponent } from './settings/manage-designation/add-designation/add-designation.component';
import { ManageUserComponent } from './settings/manage-user/manage-user.component';
import { AddUserComponent } from './settings/manage-user/add-user/add-user.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { PerformanceMetricsComponent } from './performance-metrics/performance-metrics.component'
import { JiraFormComponent } from './general-components/integration-forms/jira-form/jira-form.component';
import { AppIntegrationComponent } from './app-integration/app-integration.component';
import { MailConfigurationComponent } from './app-integration/mail-configuration/mail-configuration.component';
import { AddMailConfigurationComponent } from './app-integration/mail-configuration/add-mail-configuration/add-mail-configuration.component';
import { JiraConfigurationComponent } from './app-integration/jira-configuration/jira-configuration.component';
import { TimeTrackerSettingsComponent } from './time-tracker/time-tracker-settings/time-tracker-settings.component';
import { ManageUserSettingsComponent } from './settings/manage-user/manage-user-settings/manage-user-settings.component';
import { SlackConfigurationComponent } from './app-integration/slack-configuration/slack-configuration.component';
import { WhatsappConfigurationComponent } from './app-integration/whatsapp-configuration/whatsapp-configuration.component';
import { GitlabConfigurationComponent } from './app-integration/gitlab-configuration/gitlab-configuration.component';
import { AddGitlabConfigurationComponent } from './app-integration/gitlab-configuration/add-gitlab-configuration/add-gitlab-configuration.component';
import { ProjectJobsComponent } from './reports/project-jobs/project-jobs.component';
import { PaymentComponent } from './payment/payment.component';
import { TrialOrgComponent } from './manage-org/trial-org/trial-org.component';
import { TransactionsComponent } from './super-admin/transactions/transactions.component';
import { FooterComponent } from './footer/footer.component';
import { AddShiftComponent } from './settings/manage-shift/add-shift/add-shift.component';
import {AddWorkingDaysComponent} from './attendance/ad-settings/add-working-days/add-working-days.component';
import { CompanyPolicyComponent } from './company-policy/company-policy.component';
import { CpSettingsComponent } from './company-policy/cp-settings/cp-settings.component';
import { AddPolicyComponent } from './company-policy/add-policy/add-policy.component';
import { EditPolicyComponent } from './company-policy/edit-policy/edit-policy.component';
import {StaffDayplannerListComponent} from './reports/day-planner/staff-dayplanner-list/staff-dayplanner-list.component';
import {TimesheetReportsTimetrackerComponent} from './reports/timetracker/timesheet-reports-timetracker/timesheet-reports-timetracker.component';
import {PaymentSuccessPageComponent} from '../app/payment-success-page/payment-success-page.component';
import {RenewalPlanComponent} from './my-account/renewal-plan/renewal-plan.component';
import {UpgradePlanComponent} from './my-account/upgrade-plan/upgrade-plan.component';
import { PaymentHistoryComponent } from './my-account/payment-history/payment-history.component';
import {ViewOrgDetailsComponent} from './manage-org/view-org-details/view-org-details.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  { path: 'login', component: LoginComponent },
  { path: 'user-register', component: RegisterComponent },
  { path: 'payments', component: PaymentComponent,canActivate: [AuthGuard]},
  { path: 'footer', component: FooterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'time-tracker', component: TimeTrackerComponent, canActivate: [AuthGuard] },
  { path: 'attendance', component: AttendanceComponent, canActivate: [AuthGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
  { path: 'edit-time-tracker', component: EditTimeTrackerComponent, canActivate: [AuthGuard] },
  { path: 'jobs', component: JobsComponent, canActivate: [AuthGuard] },
  { path: 'addproject', component: AddprojectComponent, canActivate: [AuthGuard] },
  { path: 'editproject/:id', component: AddprojectComponent, canActivate: [AuthGuard] },
  { path: 'viewproject/:id', component: ViewProjectComponent, canActivate: [AuthGuard] },
  { path: 'addjobs', component: AddJobsComponent, canActivate: [AuthGuard] },
  { path: 'editjob/:id', component: AddJobsComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: 'attendancemonthlyreport', component: AttendancemonthlyreportComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgetPasswordComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  // {path:'business_letter',component:InternshipComponent, canActivate: [AuthGuard]},
  { path: 'manage-org', component: ManageOrgComponent, canActivate: [AuthGuard] },
  { path: 'inactive-orgs', component: InactiveOrgsComponent, canActivate: [AuthGuard] },
  { path: 'my-profile', component: MyAccountComponent, canActivate: [AuthGuard] },
  // {path:'add-letter',component:AddInternshipComponent, canActivate: [AuthGuard]},
  { path: 'edit-personal', component: EditPersonalComponent, canActivate: [AuthGuard] },
  // {path:'view-letter',component:ViewInternshipComponent},
  // {path:'delete-letter',component:DeleteInternshipComponent},
  // {path:'edit-letter/:id',component:AddInternshipComponent},
  { path: 'employeedetails', component: EmployeedetailsComponent, canActivate: [AuthGuard] },
  { path: 'employeeattendancedatereport', component: EmployeeattendancedatereportComponent, canActivate: [AuthGuard] },
  { path: 'timesheets', component: TimesheetsComponent, canActivate: [AuthGuard] },
  { path: 'approvals', component: ApprovalsComponent, canActivate: [AuthGuard] },
  // {path:'offer', component:OfferComponent, canActivate:[AuthGuard]},
  // {path:'add-offer',component:AddOfferComponent, canActivate: [AuthGuard]}, 
  // {path:'view-offer',component:ViewOfferComponent},
  // {path:'delete-offer', component:DeleteOfferComponent},
  { path: 'view-log', component: ViewLogsComponent },
  { path: 'approve-logs/:id', component: ApproveRejectComponent },
  // {path:'previewIntern_letter',component:PreviewLetterComponent},
  // {path:'preview-offer', component:PreviewOfferComponent},
  // {path:'edit-offer/:id',component:AddOfferComponent},
  { path: 'leave-tracker', component: LeaveTrackerComponent, canActivate: [AuthGuard] },
  { path: 'applyleave', component: ApplyLeaveComponent, canActivate: [AuthGuard] },
  { path: 'admin_dashboard', component: SuperAdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'requested_org', component: RequestedOrgDetailsComponent, canActivate: [AuthGuard] },
  { path: 'rejected-orgs', component: RequestedOrgDetailsComponent, canActivate: [AuthGuard] },
  { path: 'pricing-plan', component: ManagePricingPlanComponent, canActivate: [AuthGuard] },
  { path: 'add-pricing-plan', component: AddPricingPlanComponent, canActivate: [AuthGuard] },
  { path: 'edit-pricing-plan/:id', component: AddPricingPlanComponent, canActivate: [AuthGuard] },
  { path: 'manage-clients', component: ManageClientDetailsComponent, canActivate: [AuthGuard] },
  { path: '*', redirectTo: '404', pathMatch: 'full' },
  { path: '404', component: MaintenancePageComponent, pathMatch: 'full' },
  { path: 'more', component: MobileNavComponent, canActivate: [AuthGuard] },
  { path: 'notification_mobile', component: MobileNotificationComponent, canActivate: [AuthGuard] },
  { path: 'apps-integration', component: AppIntegrationComponent, canActivate: [AuthGuard] },
  { path: 'app-mail-configuration', component: MailConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'add-mail-configuration', component: AddMailConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'edit-mail-configuration/:id', component: AddMailConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'userattendancereport', component: UserReportsComponent, canActivate: [AuthGuard] },
  { path: 'subscription', component: OrgsPlandetailsComponent, canActivate: [AuthGuard] },
  { path: 'leave-tracker-settings', component: LtSettingsComponent, canActivate: [AuthGuard] },
  { path: 'my-day-planner', component: DayPlannerComponent, canActivate: [AuthGuard] },
  { path: 'all-day-planner', component: AllDayPlannerComponent, canActivate: [AuthGuard] },
  { path: 'dp-settings', component: DpSettingsComponent, canActivate: [AuthGuard] },
  { path: 'add-day-task', component: AddTaskComponent, canActivate: [AuthGuard] },
  { path: 'add-leave-types', component: LtSettingsFormsComponent, canActivate: [AuthGuard] },
  { path: 'edit-leave-types/:id', component: LtSettingsFormsComponent, canActivate: [AuthGuard] },
  { path: 'add-holiday', component: LtSettingsFormsComponent, canActivate: [AuthGuard] },
  { path: 'attendance-settings', component: AdSettingsComponent, canActivate: [AuthGuard] },
  { path: 'manage-action-cards', component: ManageActionCardsComponent, canActivate: [AuthGuard] },
  { path: 'add-action-cards', component: ActionCardFormComponent, canActivate: [AuthGuard] },
  { path: 'edit-action-cards/:id', component: ActionCardFormComponent, canActivate: [AuthGuard] },
  { path: 'add-gov-holiday', component: LtSettingsFormsComponent, canActivate: [AuthGuard] },
  { path: 'add-client', component: AddClientFormComponent, canActivate: [AuthGuard] },
  { path: 'project-jobs-settings', component: ProjectSettingsComponent, canActivate: [AuthGuard] },
  { path: 'edit-client/:id', component: AddClientFormComponent, canActivate: [AuthGuard] },
  { path: 'add-slack-integration', component: SlackFormComponent, canActivate: [AuthGuard] },
  { path: 'edit-slack-integration/:id', component: SlackFormComponent, canActivate: [AuthGuard] },
  { path: 'add-whatsapp-integration', component: WhatsappFormComponent, canActivate: [AuthGuard] },
  { path: 'add-whatsapp-integration', component: WhatsappFormComponent, canActivate: [AuthGuard] },
  { path: 'user-reports-leavetracker', component: UserReportsLeavetrackerComponent, canActivate: [AuthGuard] },
  { path: 'edit-whatsapp-integration/:id', component: WhatsappFormComponent, canActivate: [AuthGuard] },
  { path: 'release-notes', component: ReleaseNotesComponent, canActivate: [AuthGuard] },
  { path: 'add-release-notes', component: AddNotesComponent, canActivate: [AuthGuard] },
  { path: 'edit-release-notes/:id', component: AddNotesComponent },
  { path: 'backlogs', component: BacklogsComponent, canActivate: [AuthGuard] },
  { path: 'manage-role-details', component: ManageRoleComponent, canActivate: [AuthGuard] },
  { path: 'add-role', component: AddRoleComponent, canActivate: [AuthGuard] },
  { path: 'edit-role/:id', component: AddRoleComponent, canActivate: [AuthGuard] },
  { path: 'manage-designation', component: ManageDesignationComponent, canActivate: [AuthGuard] },
  { path: 'add-designation', component: AddDesignationComponent, canActivate: [AuthGuard] },
  { path: 'edit-designation/:id', component: AddDesignationComponent, canActivate: [AuthGuard] },
  { path: 'manage-user', component: ManageDesignationComponent, canActivate: [AuthGuard] },
  { path: 'add-user', component: AddUserComponent, canActivate: [AuthGuard] },
  { path: 'edit-user/:id', component: AddUserComponent, canActivate: [AuthGuard] },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'performance-metrics', component: PerformanceMetricsComponent, canActivate: [AuthGuard] },
  { path: 'add-jira-integration', component: JiraFormComponent, canActivate: [AuthGuard] },
  { path: 'edit-jira-integration/:id', component: JiraFormComponent, canActivate: [AuthGuard] },
  { path: 'view-jira-configuration', component: JiraConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'time-tracker-settings', component: TimeTrackerSettingsComponent },
  { path: 'manage-user-settings', component: ManageUserSettingsComponent },
  { path: 'manage-slack', component: SlackConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'view-gitlab-configuration', component: GitlabConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'add-gitlab-configuration', component: AddGitlabConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'edit-gitlab-integration/:id', component: AddGitlabConfigurationComponent, canActivate: [AuthGuard] },

  { path: 'manage-slack', component: SlackConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'manage-whatsapp', component: WhatsappConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'project-jobs-report', component: ProjectJobsComponent, canActivate: [AuthGuard] },
  { path: 'trial_org', component: TrialOrgComponent, canActivate: [AuthGuard] },
  { path: 'transactions', component: TransactionsComponent, canActivate: [AuthGuard] },
  {path: 'add-shift', component: AddShiftComponent,canActivate:[AuthGuard]},
  {path: 'edit-shift/:id', component: AddShiftComponent,canActivate:[AuthGuard]},
  {path:'update-working-days',component:AddWorkingDaysComponent,canActivate:[AuthGuard]},
  { path: 'company-policy', component: CompanyPolicyComponent, canActivate: [AuthGuard] },
  { path: 'company-policy-settings', component: CpSettingsComponent, canActivate: [AuthGuard] },
  { path: 'add-policy/:id', component: AddPolicyComponent, canActivate: [AuthGuard] },
  { path: 'edit-policy/:id/:ids', component: EditPolicyComponent, canActivate: [AuthGuard] },
  {path:'day-planner-reports',component:StaffDayplannerListComponent,canActivate:[AuthGuard]},
  {path: 'user-timesheet-reports', component: TimesheetReportsTimetrackerComponent, canActivate: [AuthGuard]},
  {path:'payment-success',component:PaymentSuccessPageComponent},
  {path:'renewal-plan',component:RenewalPlanComponent},
  {path:'upgrade-plan',component:UpgradePlanComponent},
  {path:'update-plan',component:RenewalPlanComponent},
  {path:'payment-history',component:PaymentHistoryComponent},
  {path:'view-org/:id/:back',component:ViewOrgDetailsComponent}, //view-org
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
