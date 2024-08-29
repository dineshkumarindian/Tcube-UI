import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { MaterialModule } from './material//material.module';
import { LayoutModule } from '@angular/cdk/layout';
// import {MatFormFieldModule} from '@angular/material/form-field';
import { TopnavSearchbarComponent } from './topnav-searchbar/topnav-searchbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';

import { ChartComponent } from './chart/chart.component';

import { ChartsModule } from 'ng2-charts';

import { TimeTrackerComponent } from './time-tracker/time-tracker.component';

import { AttendanceComponent } from './attendance/attendance.component';
import { ActionComponent } from './attendance/action/action.component';
import { ProjectsComponent } from './projects/projects.component';
import { CountDownComponent } from './count-down/count-down.component';
import { EditTimeTrackerComponent } from './time-tracker/edit-time-tracker/edit-time-tracker.component';
// import { DeleteTimeTrackerComponent } from './time-tracker/delete-time-tracker/delete-time-tracker.component';
import { JobsComponent } from './jobs/jobs.component';

import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { ImageCropperModule } from 'ngx-image-cropper';
// import {
//   MatAutocompleteModule,
//   MatBadgeModule,
//   MatBottomSheetModule,
//   MatButtonToggleModule,
//   MatCardModule,
//   MatCheckboxModule,
//   MatChipsModule,
//   MatDatepickerModule,
//   MatDialogModule,
//   MatDividerModule,
//   MatExpansionModule,
//   MatGridListModule,
//   MatMenuModule,
//   MatNativeDateModule,
//   MatPaginatorModule,
//   MatProgressBarModule,
//   MatProgressSpinnerModule,
//   MatRadioModule,
//   MatRippleModule,
//   MatSliderModule,
//   MatSlideToggleModule,
//   MatSnackBarModule,
//   MatSortModule,
//   MatStepperModule,
//   MatTableModule,
//   MatTooltipModule,
//   MatTreeModule,
// } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {CurrencyPipe} from '@angular/common';

import { CdkDetailRowDirective } from './../app/projects/cdk-detail-row.directive';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AddprojectComponent } from './projects/addproject/addproject.component';
import { AddJobsComponent } from './jobs/add-jobs/add-jobs.component';
import { LoginComponent } from './login/login.component';
import { Router, RouterModule } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { RegisterComponent } from './register/register.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ViewProjectComponent } from './projects/view-project/view-project.component';
import { ProjectStatusComponent } from './projects/project-status/project-status.component';
import { JobStatusComponent } from './jobs/job-status/job-status.component';
import { JobDeleteComponent } from './jobs/job-delete/job-delete.component';
import { ProjectDeleteComponent } from './projects/project-delete/project-delete.component';
import { BulkDeleteComponent } from './projects/bulk-delete/bulk-delete.component';
import { JobBulkDeleteComponent } from './jobs/job-bulk-delete/job-bulk-delete.component';
import { AttendancemonthlyreportComponent } from './attendance/attendancemonthlyreport/attendancemonthlyreport.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
// import { LogoutComponent } from './logout/logout.component';
// import { HrLettersComponent } from './hr-letters/hr-letters.component';
import { InternshipComponent } from './hr-letters/business-letter/internship.component';
import { LogoutComponent } from './logout/logout.component';
import { ManageOrgComponent } from './manage-org/manage-org.component';
import { EditOrgComponent } from './manage-org/edit-org/edit-org.component';
import { OrgDeleteComponent } from './manage-org/org-delete/org-delete.component';
import { AddOrgComponent } from './manage-org/add-org/add-org.component';
import { OrgBulkDeleteComponent } from './manage-org/org-bulk-delete/org-bulk-delete.component'
import { MatTableExporterModule } from 'mat-table-exporter';
import { AddInternshipComponent } from './hr-letters/business-letter/create-business/add-internship.component';
import { DeleteInternshipComponent } from './hr-letters/business-letter/delete-business/delete-internship.component';
import { MyAccountComponent } from './my-account/my-account.component';
// import { CoreComponent } from './core/core.component'
import { CoreComponent } from './core/core.component'
import { NgxSpinnerModule } from 'ngx-spinner';
import { AddAssigneeComponent } from './jobs/add-assignee/add-assignee.component';
import { TaskBulkDeleteComponent } from './time-tracker/task-bulk-delete/task-bulk-delete.component';
import { ViewUsersComponent } from './projects/view-users/view-users.component';
import { BulkAssigneesComponent } from './jobs/bulk-assignees/bulk-assignees.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { BulkUsersComponent } from './projects/bulk-users/bulk-users.component';
import { EditPersonalComponent } from './my-account/edit-personal/edit-personal.component';
import { ViewInternshipComponent } from './hr-letters/business-letter/view-business/view-internship.component';
import { DatePipe } from '@angular/common';
import { ReportsComponent } from './reports/reports.component';
import { TimelogSubmitComponent } from './time-tracker/timelog-submit/timelog-submit.component';
import { EmployeedetailsComponent } from './reports/employeedetails/employeedetails.component';
import { ActivateDeactivateComponent } from './settings/manage-user/activate-deactivate/activate-deactivate.component';
import { ViewUserCountsComponent } from './settings/manage-user/view-user-counts/view-user-counts.component';
import { EmployeeattendancedatereportComponent } from './reports/attendance/employeeattendancedatereport/employeeattendancedatereport.component';
import { TimesheetsComponent } from './time-tracker/timesheets/timesheets.component';
import { ApprovalsComponent } from './time-tracker/approvals/approvals.component';
import { OfferComponent } from './hr-letters/offer/offer.component';
import { AddOfferComponent } from './hr-letters/offer/add-offer/add-offer.component';
import { ViewOfferComponent } from './hr-letters/offer/view-offer/view-offer.component';
import { DeleteOfferComponent } from './hr-letters/offer/delete-offer/delete-offer.component';
import { ViewDetailsComponent } from './settings/manage-user/view-details/view-details.component';
import { InternshipBulkDeleteComponent } from './hr-letters/business-letter/business-bulk-delete/internship-bulk-delete.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ViewLogsComponent } from './time-tracker/timesheets/view-logs/view-logs.component';
import { ApproveRejectComponent } from './time-tracker/approvals/approve-reject/approve-reject.component';
import { PreviewLetterComponent } from './hr-letters/business-letter/preview-business/preview-letter.component';
import { OfferBulkDeleteComponent } from './hr-letters/offer/offer-bulk-delete/offer-bulk-delete.component';
import { PreviewOfferComponent } from './hr-letters/offer/preview-offer/preview-offer.component';
import { ViewJobComponent } from './jobs/view-job/view-job.component';
import { UpdateProfileImageComponent } from './my-account/update-profile-image/update-profile-image.component';
import { DeleteComponent } from './util/delete/delete.component';
import { LeaveTrackerComponent } from './leave-tracker/leave-tracker.component';
import { ApplyLeaveComponent } from './leave-tracker/apply-leave/apply-leave.component';
import { InactiveOrgsComponent } from './manage-org/inactive-orgs/inactive-orgs.component';
import { DeactivateOrgComponent } from './manage-org/deactivate-org/deactivate-org.component';
import { ActivateOrgsComponent } from './manage-org/activate-orgs/activate-orgs.component';
import { BulkActDeactComponent } from './manage-org/bulk-act-deact/bulk-act-deact.component';
import { NotallowedComponent } from './attendance/action/notallowed/notallowed.component';
import { ErrorAlertDialogComponent } from './util/error-alert-dialog/error-alert-dialog.component';
import { ApproveRejectLeaveComponent } from './leave-tracker/approve-reject-leave/approve-reject-leave.component';

import { MaintenancePageComponent } from './maintenance-page/maintenance-page.component';
import { CancelLeaveComponent } from './leave-tracker/cancel-leave/cancel-leave.component';
import { NoactionComponent } from './attendance/action/noaction/noaction.component';
import { SuperAdminDashboardComponent } from './super-admin-dashboard/super-admin-dashboard.component';
import { PauseResumeComponent } from './general-components/integration-forms/pause-resume/pause-resume.component';
import { RegisterCommonDialogComponent } from './register/register-common-dialog/register-common-dialog.component';
import { ActivateClientUserComponent } from './settings/manage-user/activate-client-user/activate-client-user.component';
import { RequestedOrgDetailsComponent } from './manage-org/requested-org-details/requested-org-details.component';
import { ViewOrgDetailsComponent } from './manage-org/view-org-details/view-org-details.component';
import { MobileNavComponent } from './util/mobile-nav/mobile-nav.component';
import { MobileNotificationComponent } from './util/mobile-notification/mobile-notification.component';
import { IntegrationDocumentationComponent } from './general-components/integration-forms/integration-documentation/integration-documentation.component';
// import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BarChartComponent } from './dashboard/bar-chart/bar-chart.component';
import { ManagePricingPlanComponent } from './manage-pricing-plan/manage-pricing-plan.component';
// import {MomentDateModule } from '@angular/material-moment-adapter';
import { AddPricingPlanComponent } from './manage-pricing-plan/add-pricing-plan/add-pricing-plan.component';


import { UserReportsComponent } from './reports/attendance/user-reports/user-reports.component';
import { WelcomeComponent } from './dashboard/welcome/welcome.component';
import { PricingPlanCommonDialogComponent } from './manage-pricing-plan/pricing-plan-common-dialog/pricing-plan-common-dialog.component';
import { ManageClientDetailsComponent } from './projects/project-settings/manage-client-details/manage-client-details.component';
import { SettingsBulkDeleteComponent } from './settings/settings-bulk-delete/settings-bulk-delete.component';
import { OrgsPlandetailsComponent } from './my-account/orgs-plandetails/orgs-plandetails.component';
import { MyAccountCommonDialogComponent } from './my-account/my-account-common-dialog/my-account-common-dialog.component';
import { DemoVideoComponent } from './general-components/integration-forms/demo-video/demo-video.component';
// import { ViewIntegrationComponent } from './general-components/integration-forms/view-integration/view-integration.component';
import { SettingsBulkActiveDeactiveComponent } from './settings/manage-user/settings-bulk-active-deactive/settings-bulk-active-deactive.component';
// import { SettingsBulkActiveDeactiveComponent } from './settings/settings-bulk-active-deactive/settings-bulk-active-deactive.component';
import { NoleavetypeActionComponent } from './leave-tracker/noleavetype-action/noleavetype-action.component';
import { LtSettingsComponent } from './leave-tracker/lt-settings/lt-settings.component';
import { NoholidayActionComponent } from './leave-tracker/noleavetype-action/noholiday-action/noholiday-action.component';
import { DayPlannerComponent } from './day-planner/day-planner.component';
import { AddTaskComponent } from './day-planner/add-task/add-task.component';
import { LtSettingsFormsComponent } from './leave-tracker/lt-settings/lt-settings-forms/lt-settings-forms.component';
import { AdSettingsComponent } from './attendance/ad-settings/ad-settings.component';
import { ActionCardFormComponent } from './attendance/ad-settings/manage-action-cards/action-card-form/action-card-form.component';
import { AddTaskFormComponent } from './day-planner/add-task-form/add-task-form.component';
import { AddClientFormComponent } from './projects/project-settings/manage-client-details/add-client-form/add-client-form.component';
import { DpCommonDialogComponent } from './day-planner/dp-common-dialog/dp-common-dialog.component';
import { DpSettingsComponent } from './day-planner/dp-settings/dp-settings.component';
import { ClientSettingsCommonDialogComponent } from './projects/project-settings/manage-client-details/client-settings-common-dialog/client-settings-common-dialog.component';
import { SlackFormComponent } from './general-components/integration-forms/slack-form/slack-form.component';
import { WhatsappFormComponent } from './general-components/integration-forms/whatsapp-form/whatsapp-form.component';
import { UserReportsLeavetrackerComponent } from './reports/leavetracker/user-reports/user-reports-leavetracker/user-reports-leavetracker.component';
import { ManageActionCardsComponent } from './attendance/ad-settings/manage-action-cards/manage-action-cards.component';
import { EmployeeSectionComponent } from './dashboard/employee-section/employee-section.component';
import { BillSectionComponent } from './dashboard/bill-section/bill-section.component';
import { ProjectSettingsComponent } from './projects/project-settings/project-settings.component';
import { ProjectJobTimeSectionComponent } from './dashboard/project-job-time-section/project-job-time-section.component';
import { AttendanceSectionComponent } from './dashboard/attendance-section/attendance-section.component';
import { LeaveSectionComponent } from './dashboard/leave-section/leave-section.component';
import { CommonReminderDialogComponent } from './general-components/common-reminder-dialog/common-reminder-dialog.component';
import { SettingsBulkUserOnBoardComponent } from './settings/manage-user//settings-bulk-user-onboard/settings-bulk-user-onboard.component';
import { ReleaseNotesComponent } from './super-admin-dashboard/release-notes/release-notes.component';
import { AddNotesComponent } from './super-admin-dashboard/release-notes/add-notes/add-notes.component';
import { ViewReleaseComponent } from './super-admin-dashboard/release-notes/view-release/view-release.component';
import { PreviewNotesComponent } from './super-admin-dashboard/release-notes/preview-notes/preview-notes.component';
import { FooterComponent } from './footer/footer.component';
import { BacklogsComponent } from './backlogs/backlogs.component';
import { AddBacklogsComponent } from './backlogs/add-backlogs/add-backlogs.component';
import { PreviewImageComponent } from '../app/dashboard/employee-section/preview-image/preview-image.component';
import { AllDayPlannerComponent } from './day-planner/all-day-planner/all-day-planner.component';
import { ManageRoleComponent } from './settings/manage-role/manage-role.component';
import { AddRoleComponent } from './settings/manage-role/add-role/add-role.component';
import { ManageDesignationComponent } from './settings/manage-designation/manage-designation.component';
import { AddDesignationComponent } from './settings/manage-designation/add-designation/add-designation.component';
import { ManageUserComponent } from './settings/manage-user/manage-user.component';
import { AddUserComponent } from './settings/manage-user/add-user/add-user.component';
import { LtCommonDialogComponent } from './leave-tracker/lt-settings/lt-common-dialog/lt-common-dialog.component';
import { NextPreviousYearRequestsComponent } from './leave-tracker/next-previous-year-requests/next-previous-year-requests.component';
import { EditDayTaskComponent } from './day-planner/edit-day-task/edit-day-task.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { BulkDeleteDialogComponent } from './util/bulk-delete-dialog/bulk-delete-dialog.component';
import { ActivateDialogComponent } from './util/activate-dialog/activate-dialog.component';
import { BulkActivateDialogComponent } from './util/bulk-activate-dialog/bulk-activate-dialog.component';
import { DeactivateDialogComponent } from './util/deactivate-dialog/deactivate-dialog.component';
import { BulkDeactivateDialogComponent } from './util/bulk-deactivate-dialog/bulk-deactivate-dialog.component';
import { ApiAuthService, authInterceptorProviders } from './services/api-auth.service';
import { PublishNotesComponent } from './super-admin-dashboard/release-notes/publish-notes/publish-notes.component';
import { PauseResumeIntegrationComponent } from './util/pause-resume-integration/pause-resume-integration.component';
import { ViewIntegrationComponent } from './util/view-integration/view-integration.component';

// import * as Sentry from "@sentry/angular";
import { PerformanceMetricsComponent } from './performance-metrics/performance-metrics.component';
import { JiraFormComponent } from './general-components/integration-forms/jira-form/jira-form.component';
import { AppIntegrationComponent } from './app-integration/app-integration.component';
import { MailConfigurationComponent } from './app-integration/mail-configuration/mail-configuration.component';
import { AddMailConfigurationComponent } from './app-integration/mail-configuration/add-mail-configuration/add-mail-configuration.component';
import { GovHolidayFormsComponent } from './leave-tracker/lt-settings/lt-settings-forms/gov-holiday-forms/gov-holiday-forms.component';
import { JiraConfigurationComponent } from './app-integration/jira-configuration/jira-configuration.component';
import { UpdateReportingManagerComponent } from './settings/manage-user/update-reporting-manager/update-reporting-manager.component';
import { TimeTrackerSettingsComponent } from './time-tracker/time-tracker-settings/time-tracker-settings.component';
import { ManageUserSettingsComponent } from './settings/manage-user/manage-user-settings/manage-user-settings.component';
import { SlackConfigurationComponent } from './app-integration/slack-configuration/slack-configuration.component';
import { GitlabConfigurationComponent } from './app-integration/gitlab-configuration/gitlab-configuration.component';
import { AddGitlabConfigurationComponent } from './app-integration/gitlab-configuration/add-gitlab-configuration/add-gitlab-configuration.component';
import { ProjectJobsComponent } from './reports/project-jobs/project-jobs.component';
import { NgxCaptureModule } from 'ngx-capture';
import { RefreshDialogComponent } from './util/refresh-dialog/refresh-dialog/refresh-dialog.component';
import { WhatsappConfigurationComponent } from './app-integration/whatsapp-configuration/whatsapp-configuration.component';
// import { RecaptchaModule, RecaptchaFormsModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { ManageBranchComponent } from './settings/manage-branch/manage-branch.component';
import { AddBranchComponent } from './settings/manage-branch/add-branch/add-branch.component';
import { PaymentComponent } from './payment/payment.component';
import { TrialOrgComponent } from './manage-org/trial-org/trial-org.component';
import { TransactionsComponent } from './super-admin/transactions/transactions.component';
import { OrgUserLimitComponentComponent } from './util/org-user-limit-component/org-user-limit-component.component';
import { UsersComponentComponent } from './general-components/users-component/users-component.component';
import { ViewLeavetypeDialogComponent } from './leave-tracker/view-leavetype-dialog/view-leavetype-dialog.component';
import { UpdateRelaseDialogComponent } from './super-admin-dashboard/release-notes/update-relase-dialog/update-relase-dialog.component';
import { UnAvailableComponent } from './general-components/un-available/un-available.component';
import { ManageShiftComponent } from './settings/manage-shift/manage-shift.component';
import { AddShiftComponent } from './settings/manage-shift/add-shift/add-shift.component';
import { AddWorkingDaysComponent } from './attendance/ad-settings/add-working-days/add-working-days.component';
import { CpSettingsComponent } from './company-policy/cp-settings/cp-settings.component';
import { AddPolicyComponent } from './company-policy/add-policy/add-policy.component';
import { CommonModule } from '@angular/common';
import { EditPolicyComponent } from './company-policy/edit-policy/edit-policy.component';
import { StaffDayplannerListComponent } from './reports/day-planner/staff-dayplanner-list/staff-dayplanner-list.component';
import { TimesheetReportsTimetrackerComponent } from './reports/timetracker/timesheet-reports-timetracker/timesheet-reports-timetracker.component';
import { ViewCommentsComponent } from './reports/timetracker/view-comments/view-comments.component';
import { PaymentSuccessPageComponent } from './payment-success-page/payment-success-page.component';
import { RenewalPlanComponent } from './my-account/renewal-plan/renewal-plan.component';
import { ShowingPlanDetailsComponent } from './my-account/showing-plan-details/showing-plan-details.component';
import { UpgradePlanComponent } from './my-account/upgrade-plan/upgrade-plan.component';
import { PaymentHistoryComponent } from './my-account/payment-history/payment-history.component';
import { NgxTurnstileModule } from "ngx-turnstile";
import { CacheService } from '../app/services/catche.service';
@NgModule({
    declarations: [
        AppComponent,
        MainNavComponent,
        TopnavSearchbarComponent,
        DashboardComponent,
        ChartComponent,
        SettingsComponent,
        TimeTrackerComponent,
        AttendanceComponent,
        ActionComponent,
        ProjectsComponent,
        CountDownComponent,
        EditTimeTrackerComponent,
        // DeleteTimeTrackerComponent,
        JobsComponent,
        CdkDetailRowDirective,
        AddprojectComponent,
        AddJobsComponent,
        LoginComponent,
        RegisterComponent,
        ViewProjectComponent,
        ProjectStatusComponent,
        JobStatusComponent,
        JobDeleteComponent,
        ProjectDeleteComponent,
        BulkDeleteComponent,
        JobBulkDeleteComponent,
        AttendancemonthlyreportComponent,
        LogoutComponent,
        ForgetPasswordComponent,
        // HrLettersComponent,
        InternshipComponent,
        ManageOrgComponent,
        EditOrgComponent,
        OrgDeleteComponent,
        AddOrgComponent,
        OrgBulkDeleteComponent,
        MyAccountComponent,
        // AddInternshipComponent,
        // DeleteInternshipComponent
        // CoreComponent,
        AddInternshipComponent,
        DeleteInternshipComponent,
        CoreComponent,
        AddAssigneeComponent,
        TaskBulkDeleteComponent,
        ViewUsersComponent,
        BulkAssigneesComponent,
        ChangePasswordComponent,
        BulkUsersComponent,
        EditPersonalComponent,
        ViewInternshipComponent,
        ReportsComponent,
        TimelogSubmitComponent,
        EmployeedetailsComponent,
        ActivateDeactivateComponent,
        ViewUserCountsComponent,
        EmployeeattendancedatereportComponent,
        TimesheetsComponent,
        ApprovalsComponent,
        OfferComponent,
        AddOfferComponent,
        ViewOfferComponent,
        DeleteOfferComponent,
        ViewDetailsComponent,
        InternshipBulkDeleteComponent,
        ViewLogsComponent,
        ApproveRejectComponent,
        PreviewLetterComponent,
        OfferBulkDeleteComponent,
        PreviewOfferComponent,
        ViewJobComponent,
        UpdateProfileImageComponent,
        DeleteComponent,
        LeaveTrackerComponent,
        ApplyLeaveComponent,
        InactiveOrgsComponent,
        DeactivateOrgComponent,
        ActivateOrgsComponent,
        BulkActDeactComponent,
        NotallowedComponent,
        ErrorAlertDialogComponent,
        ApproveRejectLeaveComponent,
        MaintenancePageComponent,
        CancelLeaveComponent,
        NoactionComponent,
        SuperAdminDashboardComponent,
        PauseResumeComponent,
        RegisterCommonDialogComponent,
        ActivateClientUserComponent,
        RequestedOrgDetailsComponent,
        ViewOrgDetailsComponent,
        MobileNavComponent,
        MobileNotificationComponent,
        IntegrationDocumentationComponent,
        BarChartComponent,
        ManagePricingPlanComponent,
        AddPricingPlanComponent,
        UserReportsComponent,
        WelcomeComponent,
        PricingPlanCommonDialogComponent,
        ManageClientDetailsComponent,
        SettingsBulkDeleteComponent,
        OrgsPlandetailsComponent,
        MyAccountCommonDialogComponent,
        DemoVideoComponent,
        ViewIntegrationComponent,
        SettingsBulkActiveDeactiveComponent,
        NoleavetypeActionComponent,
        LtSettingsComponent,
        NoleavetypeActionComponent,
        NoholidayActionComponent,
        NoleavetypeActionComponent,
        DayPlannerComponent,
        AddTaskComponent,
        LtSettingsFormsComponent,
        AdSettingsComponent,
        ActionCardFormComponent,
        AddTaskFormComponent,
        AddClientFormComponent,
        DpCommonDialogComponent,
        DpSettingsComponent,
        ClientSettingsCommonDialogComponent,
        SlackFormComponent,
        WhatsappFormComponent,
        UserReportsLeavetrackerComponent,
        ManageActionCardsComponent,
        EmployeeSectionComponent,
        BillSectionComponent,
        ProjectSettingsComponent,
        ProjectJobTimeSectionComponent,
        AttendanceSectionComponent,
        LeaveSectionComponent,
        CommonReminderDialogComponent,
        SettingsBulkUserOnBoardComponent,
        ReleaseNotesComponent,
        AddNotesComponent,
        ViewReleaseComponent,
        PreviewNotesComponent,
        FooterComponent,
        BacklogsComponent,
        AddBacklogsComponent,
        PreviewImageComponent,
        AllDayPlannerComponent,
        ManageRoleComponent,
        AddRoleComponent,
        ManageDesignationComponent,
        AddDesignationComponent,
        ManageUserComponent,
        AddUserComponent,
        LtCommonDialogComponent,
        NextPreviousYearRequestsComponent,
        EditDayTaskComponent,
        PrivacyPolicyComponent,
        BulkDeleteDialogComponent,
        ActivateDialogComponent,
        BulkActivateDialogComponent,
        DeactivateDialogComponent,
        BulkDeactivateDialogComponent,
        PublishNotesComponent,
        PauseResumeIntegrationComponent,
        PerformanceMetricsComponent,
        JiraFormComponent,
        AppIntegrationComponent,
        MailConfigurationComponent,
        AddMailConfigurationComponent,
        GovHolidayFormsComponent,
        JiraConfigurationComponent,
        UpdateReportingManagerComponent,
        TimeTrackerSettingsComponent,
        ManageUserSettingsComponent,
        SlackConfigurationComponent,
        GitlabConfigurationComponent,
        AddGitlabConfigurationComponent,
        ProjectJobsComponent,
        RefreshDialogComponent,
        WhatsappConfigurationComponent,
        ManageBranchComponent,
        AddBranchComponent,
        PaymentComponent,
        TrialOrgComponent,
        TransactionsComponent,
        OrgUserLimitComponentComponent,
        UsersComponentComponent,
        ViewLeavetypeDialogComponent,
        UpdateRelaseDialogComponent,
        UnAvailableComponent,
        ManageShiftComponent,
        AddShiftComponent,
        AddWorkingDaysComponent,
        AddPolicyComponent,
        EditPolicyComponent,
        StaffDayplannerListComponent,
        TimesheetReportsTimetrackerComponent,
        ViewCommentsComponent,
        PaymentSuccessPageComponent,
        RenewalPlanComponent,
        ShowingPlanDetailsComponent,
        UpgradePlanComponent,
        PaymentHistoryComponent,
    ],
    imports: [
        BrowserModule,
        MatTableModule,
        MatSortModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        LayoutModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MaterialModule,
        FormsModule,
        MatBadgeModule,
        ReactiveFormsModule,
        ChartsModule,
        MatTabsModule,
        MatSelectModule,
        MatInputModule,
        RouterModule,
        NgMultiSelectDropDownModule.forRoot(),
        NgxMatSelectSearchModule,
        DragDropModule,
        HighchartsChartModule,
        MatTabsModule,
        HttpClientModule,
        MatTableExporterModule,
        NgxSpinnerModule,
        CKEditorModule,
        ImageCropperModule,
        MatFormFieldModule,
        NgxCaptureModule,
        CommonModule,
        CpSettingsComponent,
        CurrencyPipe,
        NgxTurnstileModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        CdkTableModule,
        CdkTreeModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatStepperModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,
        CurrencyPipe
    ],
    providers: [DatePipe, authInterceptorProviders,
        // { provide:HTTP_INTERCEPTORS , useClass: CacheService, multi: true },
        // {
        //     provide: RECAPTCHA_SETTINGS,
        //     useValue: {
        //         siteKey: environment.recaptcha.siteKey,
        //     } as RecaptchaSettings
        // }

        // {
        //   provide: Sentry.TraceService,
        //   deps: [Router],
        // },
        // {
        //   provide: APP_INITIALIZER,
        //   useFactory: () => () => {},
        //   deps: [Sentry.TraceService],
        //   multi: true,
        // }
    ],
  
    bootstrap: [AppComponent]
})
export class AppModule { }
