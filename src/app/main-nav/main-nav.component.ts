import {
  Component,
  HostListener,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { interval, Observable, Subscription, timer } from "rxjs";
import { filter, map, mergeMap, shareReplay, switchMap } from "rxjs/operators";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { SettingsService } from "../services/settings.service";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatMenuTrigger } from "@angular/material/menu";
import { LogoutComponent } from "../logout/logout.component";
import { NotificationService } from "../services/notification.service";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { RegisterService } from "../services/register.service";
import moment from "moment-timezone";
import { NgxSpinnerService } from "ngx-spinner";
import { ReminderDetailsService } from "../services/reminder-details/reminder-details.service";
import { CommonReminderDialogComponent } from "../general-components/common-reminder-dialog/common-reminder-dialog.component";
import { UtilService } from "../services/util.service";
import { DayPlannerService } from "../services/day-planner/day-planner.service";
import { LeaveTrackerService } from "../services/leave-tracker.service";
import { LtCommonDialogComponent } from "../leave-tracker/lt-settings/lt-common-dialog/lt-common-dialog.component";
import { AuthenticateService } from "../services/authenticate.service";
import { UrlService } from "../services/url.service";
import { ReleaseNotesService } from '..//..//../src/app/services/super-admin/release-notes/release-notes.service';
import { RefreshDialogComponent } from '..//..//../src/app/util/refresh-dialog/refresh-dialog/refresh-dialog.component';
import { DataServiceService } from "../util/shared/data-service.service";
import { TimeTrackerService } from "../services/time-tracker.service";
import { getMatIconFailedToSanitizeLiteralError } from "@angular/material/icon";
// import { setInterval } from 'timers';
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { environment } from "src/environments/environment";
// import { ChatgptServiceService } from "../services/app-integration/chatgpt-service.service";
// import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-main-nav",
  templateUrl: "./main-nav.component.html",
  styleUrls: ["./main-nav.component.less"],
})
export class MainNavComponent implements OnInit {
  // [x: string]: any;
  // @ViewChild('HR_Letters', { static: true }) trigger: MatMenuTrigger;
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  employeeDetails = [];
  roleDetails = [];
  Emp_id: any;
  name: any;
  orgName: any;
  dashboard: Boolean = false;
  projectsJobs: Boolean = false;
  timeTracker: Boolean = false;
  attendence: Boolean = false;
  HR_Letters: Boolean = false;
  reports: Boolean = false;
  performance_metrics: Boolean = false;
  settings: Boolean = false;
  appIntegration: Boolean = false;
  // geminiAI: Boolean = false;
  dayplanner: boolean = false;
  dpsettings: boolean = false;
  manageOrg: boolean = false;
  sa_dashboard: boolean = false;
  hrLetters: boolean = false;
  leaveTracker: boolean = false;
  managePlan: boolean = false;
  manageReleaseNotes: boolean = false;
  isActivateHrLetter: boolean = false;
  isDayPlanner: boolean = false;
  clientSettings: boolean = false;
  attendanceSettings: boolean = false;
  timetrackerSettings: boolean = false;
  companypolicy: boolean = false;
  companypolicySettings: boolean = false;
  isActivateComapnyPolicy: boolean = false;
  //timeTrackerSettings:boolean = true;
  leaveTrackerSettings: boolean = false;
  unread_msg: any = 0;
  unReadBadge: boolean = false;
  c: boolean = false;
  url: any = "";
  reporterImgAvailable: boolean = false;
  imgAvailable: boolean = false;
  reporterurl: any;
  roleForReporter: any;
  role: any;
  activeemploader: boolean = true;
  notification_mobile: boolean = false;
  dashboard_mobile: boolean = true;
  more_mobile: boolean = false;
  twoOrTwenty: boolean = false;
  isErrorNotification: boolean = false;
  refreshClicked: boolean = false;
  topBtn: boolean = false;
  isActiveleavetracker: boolean = false;
  isActiveAttendance: boolean = false;
  isActivetimeTracker: boolean = false;
  isActiveReports: boolean = false;
  isActivePerformanceMetrics: boolean = false;
  reminderDetailsList: any = [];
  submitTaskReminder: any = [];
  updateTaskReminder: any = [];
  isBackLogs: boolean = false;
  clickEventsubscription: Subscription;
  clearSetIntervals: Subscription;
  updateVersionSubscription: Subscription;
  newUpdateVersion: string = "";
  urlString: string;
  allDayPlanner: boolean = false;
  myDayPlanner: boolean = false;
  countsLoader: boolean = false;
  specialcomment = true;
  currentUrlRouterLink: any;
  isActiveTimeTracker: boolean = false;
  previousUrl: string;
  currentUrl: string;
  accessToModules: any[] = [];
  relaseVersion: string = "";
  title = 'chatgpt-integration';
  prompt: string = "testing means";
  response:any;
  inputData: string = '';
  result: any;
  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private domSanitizer: DomSanitizer,
    private registerService: RegisterService,
    private spinner: NgxSpinnerService,
    private settingsService: SettingsService,
    private reminderDetailsService: ReminderDetailsService,
    private utilsService: UtilService,
    public dayPlannerService: DayPlannerService,
    public leavetrackerService: LeaveTrackerService,
    public activeRoute: ActivatedRoute,
    private auhtenticateService: AuthenticateService, private urlService: UrlService,
    private releaseService: ReleaseNotesService,
    private dataServiceService: DataServiceService,private timetrackerService: TimeTrackerService
    // private chatgptService: ChatgptServiceService,
    // private httpClient: HttpClient
    // private document: Document
  ) {
      // for to get a current webpage url
      this.loginurl = window.location.href;
      this.modifiedstring = this.loginurl.slice(0, this.loginurl.length - 13);
      this.loginstr = "login";
      this.login_str = this.modifiedstring.concat(this.loginstr.toString());
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = ev.url;
        this.urlService.setPreviousUrl(this.previousUrl);
        this.getNotificationByEmpidAndDate();
        if (localStorage.getItem("OrganizationPlan") === "expired") {
          this.setExpiredData();
        }
        /* Your code goes here on every router change */
        let url = window.location.href.split("/");
        this.currentUrlRouterLink = window.location.href.split("/")[4];
        // console.log(this.currentUrlRouterLink);
        this.isActivateHrLetter = false;
        this.isActiveProject = false;
        this.isActivetimeTracker = false;
        this.urlString = url[url.length - 1];
        var role = localStorage.getItem("Role");
        if (role == "super_admin") {
          if (
            !(
              this.urlString == "admin_dashboard" ||
              this.urlString == "manage-org" ||
              this.urlString == "pricing-plan" ||
              this.urlString == "transactions" ||
              this.urlString == "release-notes" ||
              this.urlString == "trial_org" ||
              this.urlString == "add-release-notes" ||
              this.urlString == "add-pricing-plan" ||
              this.urlString == "requested_org" ||
              this.urlString == "inactive-orgs" ||
              this.urlString == "change-password" ||
              this.urlString == "404" ||
              this.urlString == "login" ||
              this.urlString == "payment-success" || this.urlString == "payments" ||
              url.slice(-2, -1)[0] == "edit-release-notes" || url.slice(-2, -1)[0] == "view-org"
            )
          ) {
            this.UserRestriclogout();
          }
          // url.slice(-2,-1)[0] == "view-org"
        } else {
          let access = localStorage.getItem("emp_access");
          // console.log(access);
          var access_to = [];
          if (access != null) {
            access_to = access.split(",");
            this.accessToModules = access_to;
          }
          if (access_to.length != 0) {
            if (
              !(
                access_to.includes(this.urlString) == true || this.urlString == "dashboard" || this.urlString == "payments" || this.urlString == "404" || this.urlString == "user-register" || this.urlString == "forgot-password" || this.urlString == "privacy-policy" || this.urlString == "edit-personal" || this.urlString == "payment-success" || this.urlString == "login" || this.urlString == "my-profile" || this.urlString == "change-password" || (this.urlString == "subscription" && access_to.includes("subscription")) ||
                (this.urlString == "renewal-plan" && access_to.includes("subscription")) || (this.urlString == "update-plan" && access_to.includes("subscription")) || (this.urlString == "payment-history" && access_to.includes("subscription")) || (this.urlString == "upgrade-plan" && access_to.includes("subscription")) || (this.urlString == "all-day-planner" && access_to.includes("day-planner")) || (this.urlString == "dp-settings" && access_to.includes("day-planner-settings")) || (this.urlString == "add-jira-integration" && access_to.includes("day-planner-settings")) || (this.urlString == "add-day-task" && access_to.includes("my-day-planner")) || (this.urlString == "attendancemonthlyreport" && access_to.includes("attendance")) || (this.urlString == "offer" && access_to.includes("HR-letters")) || (this.urlString == "add-offer" && access_to.includes("HR-letters")) || (this.urlString == "add-letter" && access_to.includes("HR-letters")) || (this.urlString == "business_letter" && access_to.includes("HR-letters")) || (this.urlString == "manage-action-cards" && access_to.includes("attendance-settings")) ||
                (this.urlString == "add-action-cards" && access_to.includes("attendance-settings")) || (this.urlString == "update-working-days" && access_to.includes("attendance-settings")) || (this.urlString == "timesheets" && access_to.includes("time-tracker")) || (this.urlString == "view-log" && access_to.includes("time-tracker")) || (this.urlString == "approvals" && access_to.includes("time-tracker")) ||
                (this.urlString == "project-jobs-settings" && access_to.includes("client-settings")) || (this.urlString == "time-tracker-settings" && access_to.includes("time-tracker")) || (url.slice(-2, -1)[0] == "approve-logs" && access_to.includes("time-tracker")) ||
                // (this.urlString == "company-policy-settings" && access_to.includes("company-policy"))  ||
                (url.slice(-2, -1)[0] == "add-policy" && access_to.includes("company-policy-settings")) || (url.slice(-3, -1)[0] == "edit-policy" && access_to.includes("company-policy-settings")) ||
                (url.slice(-2, -1)[0] == "edit-offer" && access_to.includes("HR-letters")) ||
                (url.slice(-2, -1)[0] == "edit-letter" && access_to.includes("HR-letters")) ||
                (this.urlString == "add-client" && access_to.includes("client-settings")) ||
                (url.slice(-2, -1)[0] == "edit-client" && access_to.includes("client-settings")) ||
                (this.urlString == "add-role" && access_to.includes("settings")) ||
                (url.slice(-2, -1)[0] == "edit-role" && access_to.includes("settings")) ||
                (this.urlString == "add-designation" && access_to.includes("settings")) ||
                (url.slice(-2, -1)[0] == "edit-designation" && access_to.includes("settings")) ||
                (this.urlString == "add-user" && access_to.includes("settings")) || (this.urlString == "manage-user-settings" && access_to.includes("settings")) ||
                (url.slice(-2, -1)[0] == "edit-user" && access_to.includes("settings")) ||
                (this.urlString == "add-shift" && access_to.includes("settings")) ||
                (url.slice(-2, -1)[0] == "edit-shift" && access_to.includes("settings")) ||

                // (this.urlString == "apps-integration" && access_to.includes("settings")) ||
                (this.urlString == "app-mail-configuration" && access_to.includes("settings")) ||
                (this.urlString == "view-jira-configuration" && access_to.includes("settings")) ||
                // (this.urlString == "view-chatgpt-configuration" && access_to.includes("settings")) ||
                (this.urlString == "view-gitlab-configuration" && access_to.includes("settings")) ||
                (this.urlString == "add-mail-configuration" && access_to.includes("settings")) ||
                (url.slice(-2, -1)[0] == "edit-mail-configuration" && access_to.includes("settings")) ||
                (url.slice(-2, -1)[0] == "edit-slack-integration" && (access_to.includes("attendance-settings") || access_to.includes("day-planner-settings") || access_to.includes("leave-tracker-settings"))) ||
                (url.slice(-2, -1)[0] == "edit-whatsapp-integration" && (access_to.includes("attendance-settings") || access_to.includes("leave-tracker-settings"))) ||
                (url.slice(-2, -1)[0] == "edit-jira-integration" && access_to.includes("day-planner-settings")) ||
                (this.urlString == "add-slack-integration" && (access_to.includes("attendance-settings") || access_to.includes("day-planner-settings") || access_to.includes("leave-tracker-settings"))) ||
                (this.urlString == "add-whatsapp-integration" && (access_to.includes("attendance-settings") || access_to.includes("leave-tracker-settings"))) ||
                (this.urlString == "add-jira-integration" && (access_to.includes("day-planner-settings"))) ||
                (this.urlString == "applyleave" && access_to.includes("leave-tracker")) ||
                (this.urlString == "add-leave-types" && access_to.includes("leave-tracker-settings")) ||
                (this.urlString == "add-holiday" && access_to.includes("leave-tracker-settings")) ||
                (this.urlString == "add-gov-holiday" && access_to.includes("leave-tracker-settings")) ||
                (this.urlString == "addproject" && access_to.includes("project/jobs")) ||
                (url.slice(-2, -1)[0] == "editproject" && access_to.includes("project/jobs")) ||
                (url.slice(-2, -1)[0] == "editjob" && access_to.includes("project/jobs")) ||
                (url.slice(-2, -1)[0] == "edit-leave-types" && access_to.includes("leave-tracker-settings")) ||
                (url.slice(-2, -1)[0] == "edit-action-cards" && access_to.includes("attendance-settings")) ||
                (url.slice(-2, -1)[0] == "edit-letter" && access_to.includes("HR-letters")) ||
                (url.slice(-2, -1)[0] == "edit-offer" && access_to.includes("HR-letters")) ||
                (this.urlString == "addjobs" && access_to.includes("project/jobs")) ||
                (this.urlString == "jobs" && access_to.includes("project/jobs")) ||
                (this.urlString == "projects" && access_to.includes("project/jobs")) ||
                (this.urlString == "employeeattendancedatereport" && access_to.includes("reports") && access_to.includes("attendance")) ||
                (this.urlString == "userattendancereport" && access_to.includes("reports") && access_to.includes("attendance")) ||
                (this.urlString == "user-reports-leavetracker" && access_to.includes("reports") && access_to.includes("leave-tracker")) ||
                (this.urlString == "project-jobs-report" && access_to.includes("reports") && access_to.includes("project/jobs")) ||
                (this.urlString == "day-planner-reports" && access_to.includes("reports") && access_to.includes("my-day-planner")) ||
                (this.urlString == "user-timesheet-reports" && access_to.includes("reports") && access_to.includes("time-tracker")) ||
                (this.urlString == "add-gitlab-configuration" && access_to.includes("reports")) ||
                (url.slice(-2, -1)[0] == "edit-gitlab-integration" && access_to.includes("reports")) ||
                (this.urlString == "manage-slack" && access_to.includes("apps-integration")) ||
                (this.urlString == "manage-whatsapp" && access_to.includes("settings") && (access_to.includes("leave-tracker-settings") || access_to.includes("attendance-settings") || access_to.includes("day-planner-settings")))
              )
            ) {
              this.UserRestriclogout();
            }
          }
          if (access_to.length == 0) {
            setTimeout(() => {
              let access = localStorage.getItem("emp_access");
              var access_to = [];
              if (access != null) {
                access_to = access.split(",");
              }
              if (
                !(
                  access_to.includes(this.urlString) == true || this.urlString == "dashboard" || this.urlString == "payments" || this.urlString == "404" || this.urlString == "user-register" || this.urlString == "payment-success" || this.urlString == "login" || this.urlString == "forgot-password" || this.urlString == "privacy-policy" || this.urlString == "edit-personal" || this.urlString == "my-profile" || this.urlString == "change-password" ||
                  (this.urlString == "subscription" && access_to.includes("subscription")) || (this.urlString == "payment-history" && access_to.includes("subscription")) || (this.urlString == "renewal-plan" && access_to.includes("subscription")) || (this.urlString == "upgrade-plan" && access_to.includes("subscription")) || (this.urlString == "update-plan" && access_to.includes("subscription")) || (this.urlString == "all-day-planner" && access_to.includes("day-planner")) || (this.urlString == "dp-settings" && access_to.includes("day-planner-settings")) || (this.urlString == "add-day-task" && access_to.includes("my-day-planner")) || (this.urlString == "attendancemonthlyreport" && access_to.includes("attendance")) || (this.urlString == "offer" && access_to.includes("HR-letters")) || (this.urlString == "business_letter" && access_to.includes("HR-letters")) || (this.urlString == "manage-action-cards" && access_to.includes("attendance-settings")) ||
                  (this.urlString == "add-action-cards" && access_to.includes("attendance-settings")) || (this.urlString == "update-working-days" && access_to.includes("attendance-settings")) || (this.urlString == "timesheets" && access_to.includes("time-tracker")) || (this.urlString == "view-log" && access_to.includes("time-tracker")) || (this.urlString == "approvals" && access_to.includes("time-tracker")) ||
                  (this.urlString == "project-jobs-settings" && access_to.includes("client-settings")) || (this.urlString == "time-tracker-settings" && access_to.includes("time-tracker")) ||
                  (url.slice(-2, -1)[0] == "approve-logs" && access_to.includes("time-tracker")) ||
                  //  (this.urlString == "company-policy-settings" && access_to.includes("company-policy"))  ||
                  (url.slice(-2, -1)[0] == "add-policy" && access_to.includes("company-policy-settings")) || (url.slice(-3, -1)[0] == "edit-policy" && access_to.includes("company-policy-settings")) ||
                  (url.slice(-2, -1)[0] == "edit-offer" && access_to.includes("HR-letters")) ||
                  (url.slice(-2, -1)[0] == "edit-letter" && access_to.includes("HR-letters")) ||
                  (this.urlString == "add-client" && access_to.includes("client-settings")) ||
                  (url.slice(-2, -1)[0] == "edit-client" && access_to.includes("client-settings")) ||
                  (this.urlString == "add-role" && access_to.includes("settings")) ||
                  (url.slice(-2, -1)[0] == "edit-role" && access_to.includes("settings")) ||
                  (this.urlString == "add-designation" && access_to.includes("settings")) ||
                  (url.slice(-2, -1)[0] == "edit-designation" && access_to.includes("settings")) ||
                  (this.urlString == "add-user" && access_to.includes("settings")) || (this.urlString == "manage-user-settings" && access_to.includes("settings")) ||
                  // (this.urlString == "apps-integration" && access_to.includes("settings")) ||
                  (this.urlString == "app-mail-configuration" && access_to.includes("settings")) ||
                  (this.urlString == "view-jira-configuration" && access_to.includes("settings")) ||
                  // (this.urlString == "view-chatgpt-configuration" && access_to.includes("settings")) ||
                  (this.urlString == "view-gitlab-configuration" && access_to.includes("settings")) ||
                  (this.urlString == "adapps-integrationd-mail-configuration" && access_to.includes("settings")) ||
                  (url.slice(-2, -1)[0] == "edit-mail-configuration" && access_to.includes("settings")) ||
                  (url.slice(-2, -1)[0] == "edit-user" && access_to.includes("settings")) ||
                  (url.slice(-2, -1)[0] == "edit-jira-integration" && access_to.includes("day-planner-settings")) ||
                  (url.slice(-2, -1)[0] == "edit-slack-integration" && (access_to.includes("attendance-settings") || access_to.includes("day-planner-settings") || access_to.includes("leave-tracker-settings"))) ||
                  (url.slice(-2, -1)[0] == "edit-whatsapp-integration" && (access_to.includes("attendance-settings") || access_to.includes("leave-tracker-settings"))) ||
                  (this.urlString == "add-slack-integration" && (access_to.includes("attendance-settings") || access_to.includes("day-planner-settings") || access_to.includes("leave-tracker-settings"))) ||
                  (this.urlString == "add-whatsapp-integration" && (access_to.includes("attendance-settings") || access_to.includes("leave-tracker-settings"))) ||
                  (this.urlString == "add-jira-integration" && access_to.includes("day-planner-settings")) ||
                  (this.urlString == "applyleave" && access_to.includes("leave-tracker")) ||
                  (this.urlString == "add-leave-types" && access_to.includes("leave-tracker-settings")) ||
                  (this.urlString == "add-holiday" && access_to.includes("leave-tracker-settings")) ||
                  (this.urlString == "add-gov-holiday" && access_to.includes("leave-tracker-settings")) ||
                  (this.urlString == "addproject" && access_to.includes("project/jobs")) ||
                  (url.slice(-2, -1)[0] == "editproject" && access_to.includes("project/jobs")) ||
                  (url.slice(-2, -1)[0] == "editjob" && access_to.includes("project/jobs")) ||
                  (url.slice(-2, -1)[0] == "edit-leave-types" && access_to.includes("leave-tracker-settings")) ||
                  (url.slice(-2, -1)[0] == "edit-action-cards" && access_to.includes("attendance-settings")) ||
                  (url.slice(-2, -1)[0] == "edit-letter" && access_to.includes("HR-letters")) ||
                  (url.slice(-2, -1)[0] == "edit-offer" && access_to.includes("HR-letters")) ||
                  (this.urlString == "addjobs" && access_to.includes("project/jobs")) ||
                  (this.urlString == "jobs" && access_to.includes("project/jobs")) ||
                  (this.urlString == "projects" && access_to.includes("project/jobs")) ||
                  (this.urlString == "employeeattendancedatereport" && access_to.includes("reports") && access_to.includes("attendance")) ||
                  (this.urlString == "userattendancereport" && access_to.includes("reports") && access_to.includes("attendance")) ||
                  (this.urlString == "user-reports-leavetracker" && access_to.includes("reports") && access_to.includes("leave-tracker")) ||
                  (this.urlString == "user-timesheet-reports" && access_to.includes("reports") && access_to.includes("time-tracker")) ||
                  (this.urlString == "add-gitlab-configuration" && access_to.includes("reports")) ||
                  (url.slice(-2, -1)[0] == "edit-gitlab-integration" && access_to.includes("reports"))
                  || (this.urlString == "user-reports-leavetracker" && access_to.includes("reports") && access_to.includes("leave-tracker")) ||
                  (this.urlString == "project-jobs-report" && access_to.includes("reports") && access_to.includes("project/jobs")) || (this.urlString == "day-planner-reports" && access_to.includes("reports") && access_to.includes("my-day-planner")) || (this.urlString == "manage-slack" && access_to.includes("apps-integration")) ||
                  (this.urlString == "manage-whatsapp" && access_to.includes("settings") && (access_to.includes("leave-tracker-settings") || access_to.includes("attendance-settings") || access_to.includes("day-planner-settings")))
                )
              ) {
                this.UserRestriclogout();
              }
            }, 2000);
          }
          this.userPasswordCheck();
        }
        // if (
        //   this.urlString === "time-tracker" ||
        //   this.urlString === "view-log" ||
        //   url[url.length - 2] === "approve-logs"
        // ) {
        // }
        if (
          url[url.length - 1] == "company-policy" ||
          url[url.length - 1] == "company-policy-settings" ||
          url[url.length - 1] == "add-policy" ||
          url.slice(-3, -1)[0] == "edit-policy"
        ) {
          this.isActivateComapnyPolicy = true;
        }
        if (
          url[url.length - 1] != "company-policy" &&
          url[url.length - 1] != "company-policy-settings" &&
          url[url.length - 1] != "add-policy" &&
          url.slice(-3, -1)[0] != "edit-policy"
        ) {
          this.isActivateComapnyPolicy = false;
        }
        if (
          url[url.length - 1] == "projects" ||
          url[url.length - 1] == "jobs" ||
          url[url.length - 1] == "addproject" ||
          url[url.length - 1] == "addjobs" ||
          url[url.length - 1] == "project-jobs-settings" ||
          url[url.length - 1] == "add-client" ||
          url.slice(-2, -1)[0] == "edit-client"
        ) {
          this.isActiveProject = true;
        }
        if (
          url[url.length - 1] != "projects" &&
          url[url.length - 1] != "jobs" &&
          url[url.length - 1] != "addproject" &&
          url[url.length - 1] != "addjobs" &&
          url[url.length - 1] != "project-jobs-settings" &&
          url[url.length - 1] != "add-client" &&
          url.slice(-2, -1)[0] != "edit-client"
        ) {
          this.isActiveProject = false;
        }
        if (
          url[url.length - 1] == "time-tracker" ||
          url[url.length - 1] == "time-tracker-settings" ||
          url[url.length - 1] == "timesheets" ||
          url[url.length - 1] == "view-log" ||
          url[url.length - 1] == "approvals" ||
          url.slice(-2, -1)[0] == "approve-logs"
        ) {
          this.isActivetimeTracker = true;
        }
        if (
          url[url.length - 1] != "time-tracker" &&
          url[url.length - 1] != "time-tracker-settings" &&
          url[url.length - 1] != "timesheets" &&
          url[url.length - 1] != "view-log" &&
          url[url.length - 1] != "approvals" &&
          url.slice(-2, -1)[0] != "approve-logs"
        ) {
          this.isActivetimeTracker = false;
        }
        if (
          url[url.length - 1] == "business_letter" ||
          url[url.length - 1] == "offer" ||
          url[url.length - 1] == "add-letter" ||
          url.slice(-2, -1)[0] == "edit-letter" ||
          url[url.length - 1] == "add-offer" ||
          url.slice(-2, -1)[0] == "edit-offer"
        ) {
          this.isActivateHrLetter = true;
        }
        if (
          url[url.length - 1] != "business_letter" &&
          url[url.length - 1] != "offer" &&
          url[url.length - 1] != "add-letter" &&
          url.slice(-2, -1)[0] != "edit-letter" &&
          url[url.length - 1] != "add-offer" &&
          url.slice(-2, -1)[0] != "edit-offer"
        ) {
          this.isActivateHrLetter = false;
        }
        if (
          url[url.length - 1] == "my-day-planner" ||
          url[url.length - 1] == "dp-settings" ||
          url[url.length - 1] == "add-day-task" ||
          url[url.length - 1] == "all-day-planner"
        ) {
          // dp-setting --> day planner settings
          this.isDayPlanner = true;
        }
        if (
          url[url.length - 1] != "my-day-planner" &&
          url[url.length - 1] != "dp-settings" &&
          url[url.length - 1] != "add-day-task" &&
          url[url.length - 1] != "all-day-planner"
        ) {
          this.isDayPlanner = false;
        }

        if (
          url[url.length - 1] == "leave-tracker" ||
          url[url.length - 1] == "leave-tracker-settings" ||
          url[url.length - 1] == "applyleave" ||
          url[url.length - 1] == "add-leave-types" ||
          url[url.length - 1] == "add-holiday" ||
          url[url.length - 1] == "add-gov-holiday"
        ) {
          this.isActiveleavetracker = true;
        }

        if (
          url[url.length - 1] != "leave-tracker" &&
          url[url.length - 1] != "leave-tracker-settings" &&
          url[url.length - 1] != "applyleave" &&
          url[url.length - 1] != "add-leave-types" &&
          url[url.length - 1] != "add-holiday" &&
          url[url.length - 1] != "add-gov-holiday"
        ) {
          this.isActiveleavetracker = false;
        }
        if (
          url[url.length - 1] == "attendance" ||
          url[url.length - 1] == "attendance-settings" ||
          url[url.length - 1] == "attendancemonthlyreport" ||
          url[url.length - 1] == "manage-action-cards" ||
          url[url.length - 1] == "add-action-cards" || url[url.length - 1] == "update-working-days" ||
          url.slice(-2, -1)[0] == "edit-action-cards"
        ) {
          this.isActiveAttendance = true;
        }

        if (
          url[url.length - 1] != "attendance" &&
          url[url.length - 1] != "attendance-settings" &&
          url[url.length - 1] != "attendancemonthlyreport" &&
          url[url.length - 1] != "manage-action-cards" &&
          url[url.length - 1] != "add-action-cards" && url[url.length - 1] != "update-working-days" &&
          url.slice(-2, -1)[0] != "edit-action-cards"
        ) {
          this.isActiveAttendance = false;
        }

        // if (url[url.length - 1] == "time-tracker" || url[url.length - 1] == "tt-settings") {
        //   this.isActivetimeTracker = true;
        // }   

        // if (url[url.length - 1] != "time-tracker" && url[url.length - 1] != "tt-settings") {
        //   this.isActivetimeTracker = false;
        // }

        if (url[url.length - 1] == "backlogs" || url[url.length - 1] == "backlogs-settings") {
          this.isBackLogs = true;
        }

        if (
          url[url.length - 1] != "backlogs" &&
          url[url.length - 1] != "backlogs-settings"
        ) {
          this.isBackLogs = false;
        }

        if (
          url[url.length - 1] == "reports" ||
          url[url.length - 1] == "user-reports-leavetracker" ||
          url[url.length - 1] == "employeeattendancedatereport" ||
          url[url.length - 1] == "userattendancereport" ||
          url[url.length - 1] == "project-jobs-report" ||
          url[url.length - 1] == "day-planner-reports" ||
          url[url.length - 1] == "user-timesheet-reports"
        ) {
          this.isActiveReports = true;
        }

        if (
          url[url.length - 1] != "reports" &&
          url[url.length - 1] != "user-reports-leavetracker" &&
          url[url.length - 1] != "employeeattendancedatereport" &&
          url[url.length - 1] != "userattendancereport" &&
          url[url.length - 1] != "project-jobs-report" &&
          url[url.length - 1] != "day-planner-reports" &&
          url[url.length - 1] != "project-jobs-report" &&
          url[url.length - 1] != "user-timesheet-reports"
        ) {
          this.isActiveReports = false;
        }

        if (url[url.length - 1] == "performance-metrics") {
          this.isActivePerformanceMetrics = true;
        }
        if(url[url.length-1] != "performance-metrics")
        {
          this.isActivePerformanceMetrics = false;
        }

        // for mobile view menu activated
        if (url[url.length - 1] == "dashboard") {
          this.more_mobile = false;
          this.notification_mobile = false;
          this.dashboard_mobile = true;
        }
        if (url[url.length - 1] == "notification_mobile") {
          this.dashboard_mobile = false;
          this.more_mobile = false;
          this.notification_mobile = true;
        }
        if (
          url[url.length - 1] != "notification_mobile" &&
          url[url.length - 1] != "dashboard"
        ) {
          this.dashboard_mobile = false;
          this.more_mobile = true;
          this.notification_mobile = false;
        }

        // if(url[url.length -1]=="offer"){
        //   this.isActivateHrLetter = true;
        // }
        // if(url[url.length -1]!="offer"){
        //   this.isActivateHrLetter = false;
        // }
        if (localStorage.getItem("LoggedInStatus") == "true" && this.currentUrlRouterLink != "login" && this.currentUrlRouterLink != "user-register" && this.currentUrlRouterLink != '/forgot-password' && this.currentUrlRouterLink != '/404' && this.currentUrlRouterLink != '/privacy-policy') {
          this.getNewRelease();
        }
        this.checkEmpDetailsUpdatedStatus();
      }
    });

    this.clickEventsubscription = this.utilsService
      .getReminderCheck()
      .subscribe(() => {
        this.getDayTaskDetails();
      });

    this.clearSetIntervals = this.utilsService
      .getNotificationCheck()
      .subscribe(() => {
        clearInterval(this.notifyInterval);
        // clearInterval(this.notifyInterval2);
      });
    this.updateVersionSubscription = this.utilsService.getUpdateVersionCheck().subscribe(() => {
      this.getReleaseUpdateVersion();
    })

  }

  sub: Subscription;
  data: string;
  Details;
  OrgId: Boolean = false;
  userrole: string;
  isShown: boolean = false;
  roledata: boolean = false;
  roleloader: boolean = true;
  Notification_count: string;
  comments: any;
  loginurl: string;
  loginstr: string;
  login_str: any;
  modifiedstring: any;
  ngOnInit() {
    this.result= false;
    // this.userPasswordCheck();
    this.unReadBadge = true;
    this.userrole = localStorage.getItem("Role");
    this.name = localStorage.getItem("Name");
    // this.unread_msg= 0;
    this.getReleaseUpdateVersion();
    this.modulesShow();
    // this.getNotification();
    if (this.userrole != "super_admin") {
      this.Emp_id = localStorage.getItem("Id");
    } else {
      this.Emp_id = localStorage.getItem("SAId").toString();
    }
    clearInterval(this.notifyInterval);
    // clearInterval(this.notifyInterval2);
    this.getNotificationByEmpidAndDate();
    // this.getBadgeCounts();

    // event listener for get the unread notification conuts while click the tcube chrome tab and every 3 seconds
    window.addEventListener("visibilitychange", (evt) => {
      this.getunreadConts();
      this.getLoginStatus();
    });

    //Profile image on icon
    let id = localStorage.getItem("Id");
    let saId = localStorage.getItem("SAId");
    this.roleForReporter = localStorage.getItem("Role");
    if (
      this.roleForReporter == "org_admin" ||
      this.roleForReporter == "super_admin"
    ) {
      this.OrgId = true;
    } else this.OrgId = false;

    if (this.roleForReporter == "super_admin") {
      this.getSADetails(saId);
    } else this.getEmpDetailsById(id);

    //For showing the my account page only for org-admin
    if (this.roleForReporter === "org_admin") {
      this.isShown = true;
    } else {
      this.isShown = false;
    }

    this.comments = localStorage.getItem("tSheetComments");
    if (this.comments == "" || this.comments == null) {
      this.comments = "";
    }
    this.getDayTaskDetails();
    this.Previousmenu();
  }
  // Page Visibility API event listener
  // @HostListener('document:visibilitychange', ['$event'])
  getLoginStatus() {
    // Check if the tab is currently visible
    // Perform actions when the tab becomes visible
    if (!document.hidden) {
      let url = window.location.href.split("/")[4];
      if (url != "login" && url != "forgot-password" && url != "user-register") {
        if (localStorage.getItem("LoggedInStatus") != "true") {
          localStorage.clear();
          sessionStorage.clear();
          sessionStorage.removeItem("More_sidenav");
          this.router.navigate(["/login"]);
        }
      }
    }
  }

  UserRestriclogout() {
    this.utilsService.openSnackBarMC("You don't have access for this page", "OK");
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigate(['/'], { replaceUrl: true });
      this.utilsService.sendNotificationCheck();
    }, 2000);
    // this.router.navigate(["/login"]); 
    sessionStorage.removeItem("More_sidenav");
  }
  getEmpDetailsById(id) {
    this.currentUrlRouterLink = window.location.href.split("/")[4];
    if (localStorage.getItem("LoggedInStatus") == "true" && this.currentUrlRouterLink != "login" && this.currentUrlRouterLink != "user-register" && this.currentUrlRouterLink != '/forgot-password' && this.currentUrlRouterLink != '/404' && this.currentUrlRouterLink != '/privacy-policy' && this.currentUrlRouterLink != '/payment-success' && this.currentUrlRouterLink != '/payments') {
      this.roledata = false;
      this.roleloader = true;
      this.settingsService.getActiveEmpDetailsById(id).subscribe(
        (data) => {
          if (data.map.statusMessage == "Success") {
            let response = JSON.parse(data.map.data);
            if (response.is_activated == false) {
              this.autoLogoutDactivatedUser();
            }
            this.Details = response;
            this.role = response.roleDetails.role;
            this.roledata = true;
            this.roleloader = false;
            if (response.profile_image != undefined) {
              this.imgAvailable = true;
              let stringArray = new Uint8Array(response.profile_image);
              const STRING_CHAR = stringArray.reduce((data, byte) => {
                return data + String.fromCharCode(byte);
              }, "");
              let base64String = btoa(STRING_CHAR);
              this.url = this.domSanitizer.bypassSecurityTrustUrl(
                "data:image/jpeg;base64," + base64String
              );
            } else this.imgAvailable = false;


            // if (this.roleForReporter != "org_admin" && this.roleForReporter != "super_admin") {
            //   if (response.reporterDetails.profile_image != undefined) {
            //     this.reporterImgAvailable = true;
            //     let stringArray = new Uint8Array(response.reporterDetails.profile_image);
            //     const STRING_CHAR = stringArray.reduce((data, byte) => {
            //       return data + String.fromCharCode(byte);
            //     }, '');
            //     let base64String = btoa(STRING_CHAR);
            //     this.reporterurl = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
            //   } else this.reporterImgAvailable = false;
            // }
          }
        }, (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        })
    }
  }
  getSADetails(id: any) {
    this.registerService.getSADetailsById(id).subscribe((data) => {
      // console.log(data.map.data);
      // if (data.map.statusMessage == "Success") {
      //   this.utilsService.openSnackBarAC(
      //     "Internship letter updated successfully","OK");
      //   } else{
      //     this.utilsService.openSnackBarMC(
      //       "Failed to update internship Letter","OK");
      //   }
    });
  }

  isActiveProject: boolean;
  isActivatedAccount: boolean = false;
  isActivatedProfile: boolean = false;
  isActivatedPassword: boolean = false;
  activeProjectjob() {
    this.isActiveProject = true;
  }
  removeactive() {
    this.isActiveProject = false;
    this.isActivateHrLetter = false;
    this.isDayPlanner = false;
  }

  activateLetters() {
    this.isActivateHrLetter = true;
  }

  dayPlannerStatus() {
    this.isDayPlanner = true;
  }

  modulesShow() {
    let role = localStorage.getItem("Role");
    if (role == "super_admin") {
      this.name = localStorage.getItem("Name");
      this.orgName = localStorage.getItem("SACompanyName");
      this.dashboard = false;
      this.projectsJobs = false;
      this.timeTracker = false;
      this.attendence = false;
      this.reports = false;
      this.settings = false;
      this.leaveTracker = false;
      this.companypolicy = false;
      this.performance_metrics = false;
      this.companypolicySettings = false;
      this.manageOrg = true;
      this.managePlan = true;
      this.manageReleaseNotes = true;
      this.sa_dashboard = true;
      this.clientSettings = false;
      this.attendanceSettings = false;
      this.timetrackerSettings = false;
      //this.timeTrackerSettings = false;
      this.leaveTrackerSettings = false;
      this.dayplanner = false;
      this.dpsettings = false;
      this.allDayPlanner = false;
      // this.geminiAI = false;
    }
    // else if (role == "org_admin") {
    //   this.name = localStorage.getItem('Name');
    //   this.orgName = localStorage.getItem('OrgName');
    //   this.dashboard = true;
    //   this.projectsJobs = true;
    //   this.timeTracker = true;
    //   this.attendence = true;
    //   this.settings = true;
    //   this.reports = true;
    //   this.leaveTracker = true;
    //   this.HR_Letters = true ;
    //   localStorage.setItem("settingAccess", "true");
    //   this.manageOrg = false;
    //   this.sa_dashboard = false;
    //   this.managePlan = false;
    //   this.manageReleaseNotes = false;
    // }
    else {
      this.getEmpLoyeeDetailsById();
    }
  }
  topFive: any = [];
  tempFive: any = [];
  remaining: any = [];
  todaySkippedLeave: boolean = true;
  isAccessModule: boolean = false;

  getEmpLoyeeDetailsById() {
    this.currentUrlRouterLink = window.location.href.split("/")[4];
    if (localStorage.getItem("LoggedInStatus") == "true" && this.currentUrlRouterLink != "login" && this.currentUrlRouterLink != "user-register" && this.currentUrlRouterLink != '/forgot-password' && this.currentUrlRouterLink != '/404' && this.currentUrlRouterLink != '/privacy-policy' && this.currentUrlRouterLink != '/payment-success' && this.currentUrlRouterLink != '/payments') {
      let Id = localStorage.getItem("Id");
      this.orgName = localStorage.getItem("OrgName");
      this.settingsService.getActiveEmpDetailsById(Id).subscribe(
        (data) => {
          this.spinner.show();
          if (data.map.statusMessage == "Success") {
            let response = JSON.parse(data.map.data);
            // console.log(response);
            this.name = response.firstname;
            this.roleDetails = JSON.parse(response.roleDetails.access_to);
            localStorage.setItem(
              "emp_access",
              JSON.parse(response.roleDetails.access_to)
            );
            this.dashboard = true;
            localStorage.setItem("role_id", response.roleDetails.id);
            for (let i = 0; i < this.roleDetails.length; i++) {
              if (this.roleDetails[i] == "project/jobs") {
                this.projectsJobs = true;

                if (this.topFive.length < 4) {
                  this.topFive.push("projectsJobs");
                } else {
                  this.remaining.push("projectsJobs");
                }
              } else if (this.roleDetails[i] == "time-tracker") {
                this.timeTracker = true;
                if (this.topFive.length < 4) {
                  this.topFive.push("timeTracker");
                } else {
                  this.remaining.push("timeTracker");
                }
              } else if (this.roleDetails[i] == "attendance") {
                this.attendence = true;
                if (this.topFive.length < 4) {
                  this.topFive.push("attendence");
                } else {
                  this.remaining.push("attendence");
                }
              } else if (this.roleDetails[i] == "settings") {
                this.settings = true;
                localStorage.setItem("settingAccess", "true");
              } else if (this.roleDetails[i] == "leave-tracker") {
                this.leaveTracker = true;
                if (this.topFive.length < 4) {
                  this.topFive.push("leaveTracker");
                } else {
                  this.remaining.push("leaveTracker");
                }
              } else if (this.roleDetails[i] == "company-policy") {
                this.companypolicy = true;
                if (this.topFive.length < 4) {
                  this.topFive.push("company-policy");
                } else {
                  this.remaining.push("company-policy");
                }
              } else if (this.roleDetails[i] == "HR-letters") {
                this.HR_Letters = true;
                if (this.topFive.length < 4) {
                  this.topFive.push("HR_Letters");
                } else {
                  this.remaining.push("HR_Letters");
                }
              } else if (this.roleDetails[i] == "reports") {
                this.reports = true;
                if (this.topFive.length < 4) {
                  this.topFive.push("reports");
                } else {
                  this.remaining.push("reports");
                }
              }
              else if (this.roleDetails[i] == "performance-metrics") {
                this.performance_metrics = true;
                if (this.topFive.length < 4) {
                  this.topFive.push("performance-metrics");
                } else {
                  this.remaining.push("performance-metrics");
                }
              } else if (this.roleDetails[i] == "apps-integration") {
                this.appIntegration = true;
              } else if (this.roleDetails[i] == "client-settings") {
                this.clientSettings = true;
              // } 
              // else if(this.roleDetails[i] == "geminiAI") {
              //   this.geminiAI = true;
              } else if (this.roleDetails[i] == "attendance-settings") {
                this.attendanceSettings = true;
              } else if (this.roleDetails[i] == "time-tracker-settings") {
                this.timetrackerSettings = true;
              } else if (this.roleDetails[i] == "leave-tracker-settings") {
                this.leaveTrackerSettings = true;
              } else if (this.roleDetails[i] == "company-policy-settings") {
                this.companypolicySettings = true;
              } else if (this.roleDetails[i] == "day-planner") {
                this.allDayPlanner = true;
                if (this.topFive.length < 4) {
                  this.topFive.push("common-day-planner");
                } else {
                  this.remaining.push("common-day-planner");
                }
              } else if (this.roleDetails[i] == "my-day-planner") {
                this.dayplanner = true;
                if (this.topFive.length < 4) {
                  this.topFive.push("common-day-planner");
                  this.topFive = this.topFive.filter(
                    (item, index) => this.topFive.indexOf(item) === index
                  );
                } else {
                  this.remaining.push("common-day-planner");
                  this.remaining = this.remaining.filter(
                    (item, index) => this.remaining.indexOf(item) === index
                  );
                }
              } else if (this.roleDetails[i] == "day-planner-settings") {
                this.dpsettings = true;
                if (this.topFive.length < 4) {
                  this.topFive.push("common-day-planner");
                  this.topFive = this.topFive.filter(
                    (item, index) => this.topFive.indexOf(item) === index
                  );
                } else {
                  this.remaining.push("common-day-planner");
                  this.remaining = this.remaining.filter(
                    (item, index) => this.remaining.indexOf(item) === index
                  );
                }
              }

              setTimeout(() => {
                this.spinner.hide();
              }, 1000);
            }
            if (this.roleDetails.find(access => access == 'leave-tracker')) {
              this.todaySkippedLeave = response.skipped_leave;
              this.isAccessModule = true;

              // console.log(this.todaySkippedLeave +""+this.isAccessModule);
              // this.getReminderByOrgIdAndModuleTodayLeaves();
            } else {
              this.isAccessModule = false;
            }
            // console.log("skippedleave.."+this.todaySkippedLeave+"AccessModule..."+this.isAccessModule);
            if (this.roleDetails.includes("settings")) {
              localStorage.setItem("settingAccess", "true");
            }
            if (this.attendence && this.attendanceSettings) {
              localStorage.setItem("attendaceAccess", "true");
            } else {
              localStorage.setItem("attendaceAccess", "false");
            }
            this.remaining = this.remaining.filter(
              (n) => !this.topFive.includes(n)
            );

            if (this.isShown != true) {
              let access_Module: string = localStorage.getItem("emp_access");
              const wordsArray = access_Module.split(',');
              // console.log(wordsArray);
              if (wordsArray.includes("subscription")) {
                this.isShown = true;
              } else {
                this.isShown = false;
              }
            }

            // this.getAccessdetailsByEnpId();
          }
        },
        (error) => {
          this.router.navigate(["/404"]);
          this.spinner.hide();
        }
      );
    }
  }
  Dayplannermodules() {
    if (this.dayplanner && this.allDayPlanner && this.dpsettings) {
      this.router.navigate(["/my-day-planner"]);
    } else if (this.allDayPlanner && this.dayplanner) {
      this.router.navigate(["/my-day-planner"]);
    } else if (this.dayplanner && this.dpsettings) {
      this.router.navigate(["/my-day-planner"]);
    } else if (this.allDayPlanner && this.dpsettings) {
      this.router.navigate(["/all-day-planner"]);
    } else if (this.dayplanner) {
      this.router.navigate(["/my-day-planner"]);
    } else if (this.allDayPlanner) {
      this.router.navigate(["/all-day-planner"]);
    } else if (this.dpsettings) {
      this.router.navigate(["/dp-settings"]);
    }
  }
  Array: any = [];
  Array1: any = [];
  moreitemchange(data) {
    this.Array = this.topFive[this.topFive.length - 1];
    this.topFive[this.topFive.length - 1] = data;
    sessionStorage.setItem("More_sidenav_menu", JSON.stringify(this.topFive));
    // sessionStorage.setItem('More_sidenav', this.topFive[this.topFive.length - 1]);
    sessionStorage.setItem("More_sidenav", "true");
    let details = this.remaining.filter((n) => n !== data);
    this.remaining = details;
    this.remaining = this.remaining.concat(this.Array);

    // this.trigger.closeMenu();
  }
  Previousmenu() {
    // if (sessionStorage.getItem("More_sidenav") == "leaveTracker") {
    //   this.router.navigate(['/leave-tracker']);
    // }
    // else if (sessionStorage.getItem("More_sidenav") == "attendence") {
    //   this.router.navigate(['/attendance']);
    // }
    // else if (sessionStorage.getItem("More_sidenav") == "timeTracker") {
    //   this.router.navigate(['/time-tracker']);
    // }
    // else if (sessionStorage.getItem("More_sidenav") == "HR_Letters") {
    //   this.router.navigate(['/business_letter']);
    // }
    // else if (sessionStorage.getItem("More_sidenav") == "allDayPlanner") {
    //   this.router.navigate(['/my-day-planner']);
    // }
    // else if (sessionStorage.getItem("More_sidenav") == "reports") {
    //   this.router.navigate(['/reports']);
    // }
    this.tempFive = JSON.parse(sessionStorage.getItem("More_sidenav_menu"));
    // sessionStorage.removeItem('More_sidenav_menu');
    if (sessionStorage.getItem("More_sidenav") == "true") {
      this.topFive = this.tempFive;
    }

    // this.topFive[this.topFive.length -1] = this.Array1[0];
  }

  accessEmp = [];
  getAccessdetailsByEnpId() {
    let Id = localStorage.getItem("Id");
    let orgId = localStorage.getItem("OrgId");
    this.settingsService.getActiveAccessDetailsByOrgId(orgId).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response: any[] = JSON.parse(data.map.data);
          for (let i = 0; i < response.length; i++) {
            if (Id == response[i].employeeDetails.id)
              this.accessEmp.push(response[i]);
          }
          for (let i = 0; i < this.accessEmp.length; i++) {
            if (this.accessEmp[i].project_jobs == true)
              this.projectsJobs = true;
            if (this.accessEmp[i].time_tracker == true) this.timeTracker = true;
            if (this.accessEmp[i].attendance == true) this.attendence = true;
            if (this.accessEmp[i].settings == true) this.settings = true;
          }
        }
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  myAccount() {
    // let newId;
    // let id=localStorage.getItem('Id');
    // let orgId=localStorage.getItem('OrgId');
    // let SAId=localStorage.getItem('SAId');
    // if(id != undefined || id != null)
    // newId= id;
    // else if(orgId != undefined || orgId != null)
    // newId= orgId;
    // else if (SAId != undefined || SAId != null)
    // newId = SAId;

    // console.log(newId);
    this.isActivatedAccount = true;
    this.isActivatedProfile = false;
    this.isActivatedPassword = false;
    this.router.navigate(["subscription"]);
  }

  //  Navigation for My-account page

  myProfile() {
    this.isActivatedAccount = false;
    this.isActivatedProfile = true;
    this.isActivatedPassword = false;
    this.router.navigate(["my-profile"]);
  }

  changePassword() {
    this.isActivatedAccount = false;
    this.isActivatedProfile = false;
    this.isActivatedPassword = true;
    this.router.navigate(["change-password"]);
    let url = (window.location.href).split("/");
    localStorage.setItem('previousPage', "/" + url[url.length - 1]);
  }

  userPasswordCheck() {
    this.currentUrlRouterLink = window.location.href.split("/")[4];
    if (localStorage.getItem("LoggedInStatus") == "true" && this.currentUrlRouterLink != "login" && this.currentUrlRouterLink != "user-register" && this.currentUrlRouterLink != '/forgot-password' && this.currentUrlRouterLink != '/404' && this.currentUrlRouterLink != '/privacy-policy') {
      let password = localStorage.getItem('password');
      if (password != null && password != undefined) {
        let formdata = {
          "org_id": localStorage.getItem('OrgId'),
          "user_id": localStorage.getItem('Id') != null ? localStorage.getItem('Id') : "",
          "role": localStorage.getItem('Role')
        }
        this.auhtenticateService.getauthenticatedUser(formdata).subscribe(data => {
          if (data.map.statusMessage == "Success") {
            let details = data.map.details;
            if (details.status === "Expired") {
              setTimeout(() => {
                localStorage.clear();
                sessionStorage.clear();
                this.utilsService.sendNotificationCheck();
                this.router.navigate(["/login"]);
                sessionStorage.removeItem("More_sidenav");
              }, 2000);
            }
            else {
              if (details.password != password) {
                setTimeout(() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  this.utilsService.sendNotificationCheck();
                  this.router.navigate(["/login"]);
                  sessionStorage.removeItem("More_sidenav");
                }, 2000);
              }
            }

          }
        });
      }
    }
  }
  logout() {
    const dialogRef = this.dialog.open(LogoutComponent, {
      width: "670px",
      height: "220px",
    });
  }

  //get notification by emp_id
  notification_data: any = [];
  image_url: any;

  // getNotification() {
  //   this.notificationService.getByTonotifyid(this.Emp_id).subscribe(data => {
  //     this.activeemploader = true;
  //     if (data.map.statusMessage == "Success") {
  //       let response: any[] = JSON.parse(data.map.data);
  //       for (var i = 0; i < response.length; i++) {
  //         if (response[i].to_notifier_prfl_img != undefined) {
  //           let stringArray = new Uint8Array(response[i].to_notifier_prfl_img);
  //           const STRING_CHAR = stringArray.reduce((data, byte) => {
  //             return data + String.fromCharCode(byte);
  //           }, '');
  //           let base64String = btoa(STRING_CHAR);
  //           this.image_url = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
  //           response[i].to_notifier_prfl_img = this.image_url;
  //         }
  //         else {
  //           response[i].to_notifier_prfl_img = "assets/images/profile.png";
  //         }
  //       }
  //       this.notification_data = response.reverse();
  //     }
  //     this.activeemploader = false;
  //   })
  // }

  notifyInterval: any;
  // notifyInterval2: any;
  getunreadConts() {
    if (document.hidden) {
      clearInterval(this.notifyInterval);
      // clearInterval(this.notifyInterval2);
    } else {
      clearInterval(this.notifyInterval);
      // clearInterval(this.notifyInterval2);
      this.notifyInterval = setInterval(() => {
        this.notificationService
          .getUnreadCountByTonotifyid(localStorage.getItem("Id"))
          .subscribe(
            (data) => {
              if (data.map.statusMessage == "Success") {
                let response: number = JSON.parse(data.map.data);
                // let response :number = 60;
                if (response == 0) {
                  this.unReadBadge = true;
                } else {
                  this.unReadBadge = false;
                }
                if (this.unread_msg != response) {
                  this.unread_msg = response;
                  this.getNotificationByEmpidAndDate();
                } else {
                  this.unread_msg = response;
                }
                this.Notification_count = this.unread_msg.toString();
                if (this.unread_msg > 50) {
                  this.Notification_count = "50+";
                }
              }
            },
            (error) => {
              clearInterval(this.notifyInterval);
              // clearInterval(this.notifyInterval2);
            }
          );
      }, 300000);
    }
  }
  // Notification_count: string;
  getBadgeCounts() {
    this.notification_id = 0;
    this.countsLoader = true;
    clearInterval(this.notifyInterval);
    // clearInterval(this.notifyInterval2);
    // this.notifyInterval2 = setInterval(() => {
    this.notificationService.getUnreadCountByTonotifyid(this.Emp_id).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response: number = JSON.parse(data.map.data);
          if (response == 0) {
            this.unReadBadge = true;
          } else {
            this.unReadBadge = false;
          }
          if (response != this.unread_msg) {
            this.unread_msg = response;
            this.getNotificationByEmpidAndDate();
          } else {
            this.unread_msg = response;
          }

          // notificationMsgRead = this.unread_msg.toString();
          // this.Notification_count = this.unread_msg.toString();
          // if (this.unread_msg > 50) {
          //   this.Notification_count = "50+";
          // }
          this.unReadBadge = true;
          // this.Notification_count = '60';
        }
        setTimeout(() => {
          this.countsLoader = false;
        }, 1000);
      },
      (error) => {
        clearInterval(this.notifyInterval);
        this.countsLoader = false;
        // clearInterval(this.notifyInterval2);
      }
    );
    // }, 10000);
  }

  //mark_as_read function
  async markasread(id) {
    let tempData = this.notification_data.filter((a) => a.id === id);
    if ((tempData[0].is_read == false && !(tempData[0].module_name == ""))) {
      this.unread_msg = this.unread_msg - 1;
      if (this.unread_msg <= 0) {
        this.unReadBadge = true;
      } else {
        this.unReadBadge = false;
      }
      this.Notification_count = this.unread_msg.toString();
      if (this.unread_msg > 50) {
        this.Notification_count = "50+";
      }
      for (var i = 0; i < this.notification_data.length; i++) {
        if (this.notification_data[i].id == id) {
          this.notification_data[i].is_read = true;
          this.notification_data[i].Common_Notify_is_read = true;
        }
      }
      let formdata = {
        Ids: [id],
        Emp_id: localStorage.getItem("Id")
      };
      await this.notificationService
        .updateMarkAsRead(formdata)
        .subscribe((data) => {
          if (data.map.statusMessage == "Success") {
          }
        });
    }
    else {
      if (tempData[0].Common_Notify_is_read == false) {
        this.unread_msg = this.unread_msg - 1;
        if (this.unread_msg <= 0) {
          this.unReadBadge = true;
        } else {
          this.unReadBadge = false;
        }
        this.Notification_count = this.unread_msg.toString();
        if (this.unread_msg > 50) {
          this.Notification_count = "50+";
        }
        for (var i = 0; i < this.notification_data.length; i++) {
          if (this.notification_data[i].id == id) {
            this.notification_data[i].is_read = true;
            this.notification_data[i].Common_Notify_is_read = true;
          }
        }
        let formdata = {
          Ids: [id],
          Emp_id: localStorage.getItem("Id")
        };
        await this.notificationService
          .updateMarkAsRead(formdata)
          .subscribe((data) => {
            if (data.map.statusMessage == "Success") {
            }
          });
      }
    }
  }

  //mark all as read functionality
  async markAllasread() {
    // this.unread_msg = 0;
    let formdata;
    let ids = [];
    
    for (var i = 0; i < this.notification_data.length; i++) {
      this.notification_data[i].is_read = true;
      this.notification_data[i].Common_Notify_is_read = true;
      this.unread_msg = 0;
      ids.push(this.notification_data[i].id);
    }
    if(this.notification_data[0].to_notify_id == '1'){
      formdata = {
        Ids: ids,
        Emp_id: localStorage.getItem("SAId")
      };
    }else {
    formdata = {
      Ids: ids,
      Emp_id: localStorage.getItem("Id")
    };
  }
    this.updateMarkAllAsReadMessage(formdata, this.unread_msg);
    // for (var i = 0; i < this.notification_data.length; i++) {
    //   this.notification_data[i].is_read = true;
    //   this.unread_msg = this.unread_msg - 1;
    // }
    // for (var i = 0; i < this.notification_data.length; i++) {
    //   if (this.notification_data[i].is_read == false) {
    //     ids.push(this.notification_data[i].id);
    //     this.unread_msg = this.unread_msg - 1;
    //   }
    // }
    // if (this.unread_msg == 0) {
    //   this.unReadBadge = true;
    // } else {
    //   this.unReadBadge = false;
    // }
    //  formdata = {
    //     "Ids": ids
    //   }
  }
  async updateMarkAllAsReadMessage(formdata: any, readMsg: any) {
    this.countsLoader = true;
    // this.spinner.show();
    await this.notificationService
      .updateMarkAsRead(formdata)
      .subscribe((data) => {
        if (data.map.statusMessage == "Success") {
          this.countsLoader = false;
          if (readMsg == 0) {
            this.unReadBadge = true;
          } else {
            this.unReadBadge = false;
          }
          // this.spinner.hide();
        }
      });
  }

  redirecttomodule(data) {
    sessionStorage.removeItem('dateOfRequest');
    sessionStorage.removeItem('tSheetId');
    // sessionStorage.removeItem('isApprovals');
    let urlValue: string = window.location.href;
    let splitValue: any = urlValue.split('/');
    // let tempData = { dateOfRequest: '', tSheetId: 0 };
    if (data.sub_module_name == "My-Approvals") {
      // tempData.dateOfRequest = data.date_of_request;
      // tempData.tSheetId = data.timesheet_id;
      sessionStorage.setItem("dateOfRequest", data.date_of_request);
      sessionStorage.setItem("tSheetId", data.timesheet_id);
      let timeSheetURl = splitValue[0] + "//" + splitValue[2] + "/#/approve-logs/" + encodeURIComponent(data.notifier);
      setTimeout(() => {
        window.open(timeSheetURl, "_blank");
        // handle.onload = () => {
        //   const channel = new BroadcastChannel('tcubeApprovals');
        //   channel.postMessage(tempData);
        // };
      }, 500);
    }
    if (data.sub_module_name == "My-Timesheets") {
      this.router.navigate(["timesheets"]);
    }
    if (data.sub_module_name == "Requests") {
      localStorage.setItem("customTab", "1");
      let requestleaveUrl = splitValue[0] + "//" + splitValue[2] + "/#/leave-tracker";
      window.open(requestleaveUrl, "_blank");
    } else if (data.sub_module_name == "My-Leaves") {
      localStorage.setItem("customTab", "0");
      this.router.navigate(["leave-tracker"]);
    } else if (data.module_name == "Subscription") {
      this.router.navigate(["subscription"]);
    }
  }
  mobile_nav(redirect: string) {
    if (redirect == "dashboard_mobile") {
      this.router.navigate(["dashboard"]);
    }
    if (redirect == "notification_mobile") {
      this.router.navigate(["notification_mobile"]);
    }
    if (redirect == "more_mobile") {
      this.router.navigate(["more"]);
    }
  }

  tempData: Object;
  usersList: any[];
  countOfIAmInFromHome: any;
  countOfIAMInFormOffice: any;
  arrayOfIAMInFromHome: any[];
  arrayOfIAmFromOffice: any[];
  WorkFromHomeAndOfficeData: number;

  getNotificationByEmpidAndDate() {
    this.WorkFromHomeAndOfficeData = 0;
    this.arrayOfIAMInFromHome = [];
    this.arrayOfIAmFromOffice = [];
    this.notification_data = [];
    this.activeemploader = true;
    this.currentUrlRouterLink = window.location.href.split("/")[4];
    if (localStorage.getItem("LoggedInStatus") == "true" && this.currentUrlRouterLink != "login" && this.currentUrlRouterLink != "user-register" && this.currentUrlRouterLink != '/forgot-password' && this.currentUrlRouterLink != '/404' && this.currentUrlRouterLink != '/privacy-policy') {
      let zone = moment.tz.guess();
      if (this.twoOrTwenty == false) {
        this.tempData = {
          org_id: localStorage.getItem("OrgId"),
          to_notify_id: this.Emp_id,
          created_time: moment().subtract(2, "days").startOf("day").toDate(),
          modified_time: moment().toDate(),
          timezone: zone,
        };
      } else if (this.twoOrTwenty == true) {
        this.tempData = {
          org_id: localStorage.getItem("OrgId"),
          to_notify_id: this.Emp_id,
          created_time: moment().subtract(15, "days").startOf("day").toDate(),
          modified_time: moment().toDate(),
          timezone: zone,
        };
      }
      // console.log("tempData..",this.tempData);
      // console.log(data);
      this.refreshClicked = true;
      this.notificationService
        .getNotificationsByEmpidAndDate(this.tempData)
        .subscribe(
          (data) => {
            if (data.map.statusMessage == "Success") {
              this.isErrorNotification = false;
              let response: any[] = JSON.parse(data.map.data);
              response.forEach(element => {
              });
              if(localStorage.getItem("Role") != "super_admin") {
              response.forEach(element => {
                if (element.common_notify_readed_ids) {
                  if ((element.common_notify_readed_ids.includes(localStorage.getItem("Id")))) {
                    element["Common_Notify_is_read"] = true;
                  }
                  else {
                    element["Common_Notify_is_read"] = false;
                  }
                }
                else {
                  if (!element.is_read) {
                    element["Common_Notify_is_read"] = false;
                  }
                  else {
                    element["Common_Notify_is_read"] = true;
                  }
                }
              });
            } else {
              response.forEach(element => {
                if (element.common_notify_readed_ids) {
                  if ((element.common_notify_readed_ids.includes(localStorage.getItem("SAId")))) {
                    element["Common_Notify_is_read"] = true;
                  }
                  else {
                    element["Common_Notify_is_read"] = false;
                  }
                }
                else {
                  if (!element.is_read) {
                    element["Common_Notify_is_read"] = false;
                  }
                  else {
                    element["Common_Notify_is_read"] = true;
                  }
                }
              });
            }
              // if(response.filter((r) => r. ))
              // let unreadData = response.filter((r) => r.is_read === false && !(r.common_notify_readed_ids?.includes(localStorage.getItem("Id"))));
              let unreadData = response.filter((r) => r.Common_Notify_is_read === false);
              //condition to check the deactivated user notification received or not
              let userDeactivated = response.filter(
                (r) => r.sub_module_name == "Deactivated-User"
              );
              if (userDeactivated.length > 0) {
                this.autoLogoutDactivatedUser();
              }
              this.unread_msg = unreadData.length;
              if (this.unread_msg <= 0) {
                this.unReadBadge = true;
              } else {
                this.unReadBadge = false;
              }
              this.Notification_count = this.unread_msg.toString();
              if (this.unread_msg > 50) {
                this.Notification_count = "50+";
              }
              let array = [];
              for (var i = 0; i < response.length; i++) {
                array = [];
                if (response[i].keyword != null && response[i].keyword != undefined) {
                  if (response[i].keyword == "timesheet-not-submitted") {
                    this.usersList = JSON.parse(response[i].approval_comments);
                    for (var k = 0; k < this.usersList.length; k++) {
                      if (JSON.parse(this.usersList[k])) {
                        this.usersList[k] = JSON.parse(this.usersList[k]);
                        array[k] = this.usersList[k].map;
                      }
                    }
                    response[i].approval_comments = array;
                  }
                }
                let arrayfromOfficewithbranch: any = [];
                let noUpdateUserListDetails = [];
                if (response[i].keyword != null && response[i].keyword != undefined) {
                  if (response[i].keyword == "attendance-summary") {

                    let jsonArray = JSON.parse(response[i].approval_comments);
                    // console.log(jsonArray);
                    let arrayFromoffice = jsonArray[0];
                    let arrayFromHome = jsonArray[1];
                    let arrayFromBranch = jsonArray[2];
                    let arrayfromTodayLeaveUser = jsonArray[3];
                    let noUpdateUserListDetails = jsonArray[4];
                    for (let i = 0; i < arrayFromBranch.length; i++) {
                      // debugger
                      let count = 0;
                      let arrayOfficeData = [];
                      arrayFromoffice.forEach(element => {
                        if (element.map.branchId == arrayFromBranch[i][1]) {
                          arrayOfficeData[count] = element.map.firstname + " " + element.map.lastname;
                          count++;
                        }
                      });
                      if (count != 0) {
                        arrayfromOfficewithbranch.push({ "branch": arrayFromBranch[i][0], "count": count, "arrayOfOffice": arrayOfficeData });
                      }
                    }
                    // debugger
                    response[i].attendance_summary = arrayfromOfficewithbranch;
                    response[i].workFromHomeData = arrayFromHome;
                    response[i].arrayfromTodayLeaveUser = arrayfromTodayLeaveUser;
                    // debugger;
                    response[i].noUpdateUserList = noUpdateUserListDetails;
                    // console.log(arrayfromOfficewithbranch);
                    // response[i].work_from_office = arrayFromoffice;
                    // response[i].work_from_home = arrayFromHome;
                    // response[i].count_of_workFormOffice = arrayFromoffice.length;
                    // response[i].count_of_workFromHome = arrayFromHome.length;

                    // let k = 0;
                    // response.push({ ...response[i], 'work_from_office': jsonArray[0],'work_from_home':jsonArray[1] });
                    //   while(k < jsonArray.length-1) {
                    //   // console.log(jsonArray);
                    //   this.arrayOfIAmFromOffice[this.WorkFromHomeAndOfficeData] = jsonArray[k];
                    //   k=k+1;
                    //   this.arrayOfIAMInFromHome[this.WorkFromHomeAndOfficeData] = jsonArray[k];

                    //   }
                    //   this.WorkFromHomeAndOfficeData = this.WorkFromHomeAndOfficeData +1;                  
                    // this.countOfIAMInFormOffice = this.arrayOfIAmFromOffice.length;
                    //   // this.countOfIAmInFromHome = this.arrayOfIAMInFromHome.length;
                    //   // console.log(this.arrayOfIAMInFromHome +);
                  }
                }

                if (response[i].keyword != null && response[i].keyword != undefined) {
                  if (response[i].keyword == "Staff without plans") {
                    let jsonArray = JSON.parse(response[i].approval_comments);
                    let PlanForTheDayNotPosted = jsonArray;
                    if (jsonArray == null) {
                      PlanForTheDayNotPosted = []
                      jsonArray = []
                    }
                    if (jsonArray.length == 0) {
                      response[i].approval_comments = "All are created plan for the day in dayplanner today!";
                      response[i].planForTheDayNotPostedList = PlanForTheDayNotPosted
                      // response[i].TodayUserCount = leaveData.length;
                    }
                    else {
                      response[i].planForTheDayNotPostedList = PlanForTheDayNotPosted.myArrayList;
                    }
                  }
                  else if (response[i].keyword == "Staff without updates") {
                    let jsonArray = JSON.parse(response[i].approval_comments);
                    let UpdateForTheDayNotPosted = jsonArray;
                    if (jsonArray == null) {
                      UpdateForTheDayNotPosted = [];
                      jsonArray = [];
                    }
                    if (jsonArray.length == 0) {
                      response[i].approval_comments = "All are posted updates for the day in dayplanner today!";
                      response[i].UpdateForTheDayNotPosted = UpdateForTheDayNotPosted
                      // response[i].TodayUserCount = leaveData.length;
                    }
                    else {
                      response[i].UpdateForTheDayNotPosted = UpdateForTheDayNotPosted.myArrayList;
                      // console.log(response[i].UpdateForTheDayNotPosted);

                    }
                  }
                }

                let todayLeaves = [];
                if (response[i].keyword != null && response[i].keyword != undefined) {
                  if (response[i].keyword == "Staff-leave-today") {
                    let leaveData = JSON.parse(response[i].approval_comments);
                    // let todayleaveDetails = leaveData;
                    // console.log("leaveData...",leaveData);
                    if (leaveData.length == 0) {
                      response[i].approval_comments = "All are working today!";
                      response[i].TodayUserCount = leaveData.length;
                    } else {
                      // let tempDate = moment().format('YYYY-MM-DD');
                      for (let k = 0; k < leaveData.length; k++) {
                        todayLeaves = JSON.parse(leaveData[k].map.half_full_day);
                        for (let j = 0; j < todayLeaves.length; j++) {
                          if (todayLeaves[j].full_half == 'Full Day') {
                            leaveData[k].map.half_full_day = todayLeaves[j].full_half;
                          } else {
                            leaveData[k].map.half_full_day = todayLeaves[j].first_second;
                          }
                        }
                      }

                      response[i].TodayUserCount = leaveData.length;
                      response[i].approval_comments = leaveData;
                    }
                  }
                }

                // if (response[i].to_notifier_prfl_img != undefined) {
                //   let stringArray = new Uint8Array(
                //     response[i].to_notifier_prfl_img
                //   );
                //   const STRING_CHAR = stringArray.reduce((data, byte) => {
                //     return data + String.fromCharCode(byte);
                //   }, "");
                //   let base64String = btoa(STRING_CHAR);
                //   this.image_url = this.domSanitizer.bypassSecurityTrustUrl(
                //     "data:image/jpeg;base64," + base64String
                //   );
                //   response[i].to_notifier_prfl_img = this.image_url;
                // } else {
                //   response[i].to_notifier_prfl_img =
                //     "assets/images/profile.png";
                // }
              }
              this.notification_data = response.reverse();
              this.getEmpImages([...new Set(this.notification_data.map(item => item.notifier))]);
            }
            this.activeemploader = false;
            this.refreshClicked = false;
          },
          (error) => {
            // this.router.navigate(["/404"]);
            // console.log("Error in getting notigications");
            this.isErrorNotification = true;
            this.refreshClicked = false;
            clearInterval(this.notifyInterval);
            // clearInterval(this.notifyInterval2);
          }
        );
    }
  }

  taskEmpObjWithImg: [] = [];
  isGettingEMpImage: boolean = true;
  getEmpImages(ids) {
    this.isGettingEMpImage = true;
    let data = {
      "emp_ids": ids,
    }
    this.settingsService.getEmployeeImagesByIds(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.taskEmpObjWithImg = JSON.parse(data.map.data).map;
        for (var i = 0; i < this.notification_data.length; i++) {
          if (this.notification_data[i].sub_module_name == "My-Timesheets" || this.notification_data[i].sub_module_name == "My-Approvals" || this.notification_data[i].sub_module_name == "My-Leaves" || this.notification_data[i].sub_module_name == "Requests" || this.notification_data[i].keyword == "approved-leave-cancel" || this.notification_data[i].keyword == "cancel-leave") {
            if (this.taskEmpObjWithImg[this.notification_data[i].notifier] != '') {
              let stringArray = new Uint8Array(this.taskEmpObjWithImg[this.notification_data[i].notifier]);
              const STRING_CHAR = stringArray.reduce((data, byte) => {
                return data + String.fromCharCode(byte);
              }, '');
              let base64String = btoa(STRING_CHAR);
              this.notification_data[i].to_notifier_prfl_img = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
            } else {
              this.notification_data[i].to_notifier_prfl_img = 'assets/images/user_person.png';
            }
          } else {
            this.notification_data[i].to_notifier_prfl_img = 'assets/images/user_person.png';
          }
        }
        this.isGettingEMpImage = false;
      } else {
        this.notification_data.map((e) => e.to_notifier_prfl_img = 'assets/images/user_person.png');
        this.isGettingEMpImage = false;
      }
    }, (err) => {
      this.notification_data.map((e) => e.to_notifier_prfl_img = 'assets/images/user_person.png');
      this.isGettingEMpImage = false;
    });
  }

  //special notification function show the comments in the notification
  notification_id: number = 0;
  special_notification(id) {
    if (this.notification_id == id) {
      this.notification_id = 0;
    } else {
      this.notification_id = id;
    }
  }

  loadMore() {
    // console.log("twoOrTwenty = true");
    this.twoOrTwenty = true;
    document.getElementById("topNot").scrollIntoView();
    // this.notification_data =[];
    this.getNotificationByEmpidAndDate();
  }
  cancelMore() {
    // console.log("twoOrTwenty = false");
    this.twoOrTwenty = false;
    this.getNotificationByEmpidAndDate();
    this.notification_id = 0;
  }
  // cancelChatgpt(){

  // }
  // in notification toglllr --> while srcolling to enable the 'go to top' button
  scrollEvent = (event: any): void => {
    // const number = event.srcElement.scrollTop;
    const currentScroll = event.target.scrollTop;
    const totalHeight = event.target.scrollHeight;
    let check = totalHeight / 2;
    if (currentScroll >= check) {
      this.topBtn = true;
    } else {
      this.topBtn = false;
    }
  };

  //to set the leave tracker setting tab to activate the leave type
  setltsettingsls() {
    localStorage.setItem("lt-form", "leavetypes");
    this.router.navigate(["/leave-tracker-settings"]);
  }
  setCompanyPolicy() {
    localStorage.setItem("policy-settings", "companypolicy");
    this.router.navigate(["/company-policy-settings"]);
  }

  //to set the attendance setting tab to activate the manage-action-cards
  SetAtdsettings() {
    localStorage.setItem("atd-settings", "manage-action-cards");
    this.router.navigate(["/attendance-settings"]);
  }

  // Setttsettings(){

  //   this.router.navigate(['/tt-settings'])
  // }


  // get the current day task details
  isSubmitted: Boolean = false;
  isUpdated: Boolean = false;
  getDayTaskDetails() {
    if (localStorage.getItem("LoggedInStatus") == "true" && this.currentUrlRouterLink != "login" && this.currentUrlRouterLink != "user-register" && this.currentUrlRouterLink != '/forgot-password' && this.currentUrlRouterLink != '/404' && this.currentUrlRouterLink != '/privacy-policy' && this.currentUrlRouterLink != '/payment-success' && this.currentUrlRouterLink != '/payments') {
      // console.log("True");
      this.spinner.show();
      let data = {
        org_id: localStorage.getItem("OrgId"),
        emp_id: localStorage.getItem("Id"),
        date: moment().format("YYYY-MM-DD"),
      };
      this.dayPlannerService
        .getDayTaskDetailsByEmpIdAndOrgIdAndDate(data)
        .subscribe((data) => {
          if (data.map.statusMessage == "Success") {
            let response = JSON.parse(data.map.data);
            this.isSubmitted = !response.find(
              (dayTask) => dayTask.is_submitted == true
            );
            this.isUpdated = !response.find(
              (dayTask) => dayTask.is_updated == true
            );
            this.getReminderDetails();
          }
          this.spinner.hide();
        });
    }
  }

  planSetTimeout: any;
  updateSetTimeout: any;
  //get reminder details
  getReminderDetails() {
    clearTimeout(this.planSetTimeout);
    clearTimeout(this.updateSetTimeout);
    let data: Object = {
      org_id: localStorage.getItem("OrgId"),
      module_name: "day-planner",
    };
    this.reminderDetailsService
      .getReminderByOrgIdAndModule(data)
      .subscribe((data) => {
        if (data.map.statusMessage == "Success") {
          let response = JSON.parse(data.map.data);
          this.reminderDetailsList = response;
          this.submitTaskReminder = this.reminderDetailsList.find(
            (r) => r.key_primary === "submit-tasks"
          );
          this.updateTaskReminder = this.reminderDetailsList.find(
            (r) => r.key_primary === "update-tasks"
          );
          // console.log(this.isSubmitted);
          if (this.isSubmitted == true) {
            if (this.submitTaskReminder != null) {
              if (this.submitTaskReminder.is_active == true) {
                if (this.submitTaskReminder.key_secondary) {
                  let empDetails = JSON.parse(
                    this.submitTaskReminder.key_secondary
                  );
                  if (empDetails.find((emp) => emp == this.Emp_id)) {
                    if (this.submitTaskReminder.reminder_type == "Once") {
                      if (
                        moment().toDate() <
                        moment(this.submitTaskReminder.reminder_date).toDate()
                      ) {
                        var timeIsBeing936 = new Date(
                          this.submitTaskReminder.reminder_date
                        ).getTime(),
                          currentTime = new Date().getTime(),
                          subtractMilliSecondsValue =
                            timeIsBeing936 - currentTime;
                        this.planSetTimeout = setTimeout(() => {
                          this.timeToAlert("planForTheDay");
                        }, subtractMilliSecondsValue);
                      }
                    } else if (
                      this.submitTaskReminder.reminder_type == "Daily"
                    ) {
                      let date =
                        moment().format("YYYY-MM-DD") +
                        " " +
                        this.submitTaskReminder.reminder_time_str;
                      // console.log(date);
                      if (moment().toDate() < moment(date).toDate()) {
                        var timeIsBeing936 = new Date(date).getTime(),
                          currentTime = new Date().getTime(),
                          subtractMilliSecondsValue =
                            timeIsBeing936 - currentTime;
                        this.planSetTimeout = setTimeout(() => {
                          this.timeToAlert("planForTheDay");
                        }, subtractMilliSecondsValue);
                      }
                    }
                  }
                }
              }
            }
          }
          if (this.isUpdated) {
            if (this.updateTaskReminder != null) {
              if (this.updateTaskReminder.is_active == true) {
                if (this.updateTaskReminder.key_secondary) {
                  let empDetails = JSON.parse(
                    this.updateTaskReminder.key_secondary
                  );
                  if (empDetails.find((emp) => emp == this.Emp_id)) {
                    if (this.updateTaskReminder.reminder_type == "Once") {
                      if (
                        moment().toDate() <
                        moment(this.updateTaskReminder.reminder_date).toDate()
                      ) {
                        var time = new Date(
                          this.updateTaskReminder.reminder_date
                        ).getTime(),
                          currentTime = new Date().getTime(),
                          subtractMilliSecondsValue = time - currentTime;
                        this.updateSetTimeout = setTimeout(() => {
                          this.timeToAlert("updatesForTheDay");
                        }, subtractMilliSecondsValue);
                      }
                    } else if (
                      this.updateTaskReminder.reminder_type == "Daily"
                    ) {
                      let date =
                        moment().format("YYYY-MM-DD") +
                        " " +
                        this.updateTaskReminder.reminder_time_str;
                      if (moment().toDate() < moment(date).toDate()) {
                        var time = new Date(date).getTime(),
                          currentTime = new Date().getTime(),
                          subtractMilliSecondsValue = time - currentTime;
                        this.updateSetTimeout = setTimeout(() => {
                          this.timeToAlert("updatesForTheDay");
                        }, subtractMilliSecondsValue);
                      }
                    }
                  }
                }
              }
            }
          }
        } else if (data.map.statusMessage == "Error") {
        }
      });
  }
  //to call the reminder dialog
  timeToAlert(keyData) {
    let audio = new Audio();
    audio.src = "../../../assets/remider-ringtones/reminder_tone_1.mp3";
    audio.load();
    audio.play();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = false;
    dialogConfig.width = "25%";
    dialogConfig.height = "105px";
    dialogConfig.panelClass = "custom-viewdialogstyle";
    dialogConfig.data = {
      component: "Reminder",
      key: "day-planner",
      for: keyData,
    };
    dialogConfig.position = { bottom: "25px", right: "25px" };
    const dialogRef = this.dialog.open(
      CommonReminderDialogComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      this.updateEmpDetails(keyData);
    });
  }

  // after close the dialog update the emp details
  reminderEmpList: any = [];
  updateEmpDetails(keyData) {
    // console.log(keyData);
    this.reminderEmpList = [];
    if (keyData == "planForTheDay") {
      if (this.submitTaskReminder != null) {
        if (this.submitTaskReminder.key_secondary) {
          this.reminderEmpList = JSON.parse(
            this.submitTaskReminder.key_secondary
          );
        }
      }
      this.reminderEmpList = this.reminderEmpList.filter(
        (emp) => emp != this.Emp_id
      );
      let data: Object = {
        id: this.submitTaskReminder.id,
        emps_arr: JSON.stringify(this.reminderEmpList),
      };
      this.reminderDetailsService
        .updateReminderEmpDetails(data)
        .subscribe((details) => { });
    } else if (keyData == "updatesForTheDay") {
      if (this.updateTaskReminder != null) {
        if (this.updateTaskReminder.key_secondary) {
          this.reminderEmpList = JSON.parse(
            this.updateTaskReminder.key_secondary
          );
        }
      }
      this.reminderEmpList = this.reminderEmpList.filter(
        (emp) => emp != this.Emp_id
      );
      let data: Object = {
        id: this.updateTaskReminder.id,
        emps_arr: JSON.stringify(this.reminderEmpList),
      };
      this.reminderDetailsService
        .updateReminderEmpDetails(data)
        .subscribe((details) => { });
    }
  }
  sidenavWidth: boolean = false;
  Toggle_sidenav() {
    if (this.sidenavWidth) {
      this.sidenavWidth = false;
    } else {
      this.sidenavWidth = true;
    }
    sessionStorage.setItem("sideNavMaximized", this.sidenavWidth ? "true" : "false");
  }

  //automatically logout the deactivated user
  autoLogoutDactivatedUser() {
    this.utilsService.openSnackBarMC(
      "Org admin deactivated your account",
      "OK"
    );
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      this.utilsService.sendNotificationCheck();
      this.router.navigate(["/login"]);
      sessionStorage.removeItem("More_sidenav");
    }, 2000);
    setTimeout(() => {
      location.reload();
    }, 2500);
  }

  async getReleaseUpdateVersion() {
    await this.releaseService.getReleaseVersion().subscribe(data => {
      let response: any[] = JSON.parse(data.map.data);
      if (response.length != 0) {
        this.newUpdateVersion = (response[0]).toString();
      } else {
        this.newUpdateVersion = "0.0";
      }
    })
  }

  // isGetLeaves: boolean = false;
  // attendanceReminder: any = [];
  // async getReminderByOrgIdAndModuleTodayLeaves() {

  //   // if (localStorage.getItem("LoggedInStatus") == "true" && sessionStorage.getItem("Unwanted_api_reduce") == "false") {
  //   // this.spinner.show();
  //   this.attendanceReminder = [];
  //   let data: Object = {
  //     "org_id": localStorage.getItem('OrgId'),
  //     "module_name": "leave-tracker"
  //   }
  //   await this.reminderDetailsService.getReminderByOrgIdAndModule(data).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       let response = JSON.parse(data.map.data);
  //       // console.log(response);
  //       // this.reminderDetailsList = response;
  //       this.attendanceReminder = response.find(r => r.key_primary == 'today-leaves');
  //       // console.log(this.attendanceReminder);
  //       if (this.attendanceReminder != undefined) {
  //         // console.log(typeof  this.attendanceReminder);
  //         if (this.attendanceReminder.is_active == true) {
  //           this.isGetLeaves = true;

  //         } else {
  //           this.isGetLeaves = false;
  //         }
  //       }
  //       // console.log(this.isGetLeaves);
  //       this.TodayLeaves();
  //     }
  //   });
  //   // this.spinner.hide();
  //   // }

  // }
  // getTodayLeaves = [];
  // isTodayLeaves = false;
  // TodayData: any = [];
  // async TodayLeaves() {
  //   // this.spinner.show();
  //   let zone = moment.tz.guess();
  //   this.getTodayLeaves = [];
  //   this.isTodayLeaves = false;
  //   let data: Object = {
  //     "org_id": localStorage.getItem("OrgId"),
  //     "start_date": moment().startOf('day').toDate(),
  //     "timezone": zone,
  //   }
  //   // console.log("TodayLeaves",data);
  //   let subscription = await this.leavetrackerService.getTodayLeavesByOrgid(data).subscribe(data => {
  //     if (data.map.statusMessage == "Success") {
  //       let response: any[] = JSON.parse(data.map.data);
  //       // console.log(response);
  //       for (var i = 0; i < response.length; i++) {
  //         if (response[i].emp_img != undefined) {
  //           let stringArray = new Uint8Array(response[i].emp_img);
  //           const STRING_CHAR = stringArray.reduce((data, byte) => {
  //             return data + String.fromCharCode(byte);
  //           }, '');
  //           let base64String = btoa(STRING_CHAR);
  //           response[i].emp_img = this.domSanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64," + base64String);
  //         }
  //         else {
  //           response[i].emp_img = "assets/images/profile.png";
  //         }
  //       }
  //       // for to show half day or full day in dashboard today leave section
  //       // for to show half day or full day in dashboard today leave section
  //       let tempDate = moment().format('YYYY-MM-DD');
  //       for (let i = 0; i < response.length; i++) {
  //         this.TodayData = JSON.parse(response[i].half_full_day);
  //         // console.log(this.TodayData);
  //         for (let j = 0; j < this.TodayData.length; j++) {
  //           if (tempDate == this.TodayData[j].date) {
  //             if (this.TodayData[j].full_half == 'Full Day') {
  //               response[i].half_full_day = this.TodayData[j].full_half;
  //             } else {
  //               response[i].half_full_day = this.TodayData[j].first_second;
  //             }
  //           } else { }
  //         }
  //       }
  //       this.getTodayLeaves = response;

  //       setTimeout(() => {// console.log(this.getTodayLeaves);
  //         this.todayLeavePopupChanges(this.getTodayLeaves);
  //       }, 1000);
  //     }
  //   }, (error) => {
  //     this.router.navigate(["/404"]);
  //     // this.spinner.hide();
  //   })

  // }
  // todayLeavePopupChanges(leaves: any) {
  //   let todayLeaves = leaves;
  //   // this.router.events.filter(event:any =>)
  //   // let params = this.activeRoute.snapshot.params;
  //   // console.log(params);
  //   // console.log(todayLeaves);
  //   if (this.currentUrlRouterLink != "login" && this.currentUrlRouterLink != "user-register" && this.currentUrlRouterLink != 'forgot-password' && this.currentUrlRouterLink != '404' && this.currentUrlRouterLink != 'privacy-policy') {
  //     if (todayLeaves.length >= 0) {
  //       if (this.isGetLeaves == true && this.todaySkippedLeave == false && this.isAccessModule == true) {
  //         this.isTodayLeaves = true;
  //         const dialogRef = this.dialog.open(LtCommonDialogComponent, {
  //           width: '30%',
  //           panelClass: 'custom-viewdialogstyle',
  //           data: { todayleaves: todayLeaves, remainder: this.attendanceReminder }
  //         });
  //         dialogRef.afterClosed().subscribe(result => {

  //           this.updateLeavePopupChanges();
  //           // this.updateEmpDetails('attendanceSubmit');

  //         });
  //       }
  //     } else {
  //       this.isTodayLeaves = false;
  //     }
  //   }
  // }
  // async updateLeavePopupChanges() {
  //   let id = localStorage.getItem('Id');
  //   let data = {
  //     "id": id
  //   }
  //   await this.settingsService.updateskippedLeaveDetails(data).subscribe(data => {
  //     // console.log("updateskippedLeaveDetails",data);
  //   })
  // }

  // ***********************This section is used for to notification html code style execute*******************
  sanitizeHtml(html: string): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  }

  // ***********************This section is for new release popup*******************

  getNewRelease() {
    setTimeout(() => {
      this.settingsService.getNewReleaseByEmpId(this.Emp_id).subscribe(
        (data) => {
          if (data == true) {
            this.releaseService.updatenew_release_byEmpId(this.Emp_id).subscribe(
              (data) => { }
            )
            const dialogRef = this.dialog.open(RefreshDialogComponent, {
              width: '30%',
              // height: '21%',
              panelClass: 'custom-viewdialogstyle',
              data: { todayleaves: "todayLeaves" }
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result.data == true) {
                localStorage.clear();
                sessionStorage.clear();
                this.router.navigate(["/login"]);
                sessionStorage.removeItem("More_sidenav");
                setTimeout(async () => {
                  await window.location.reload();
                }, 200);
              }
            });
          }
        })
    }, 1000);
  }

  checkEmpDetailsUpdatedStatus() {
    this.settingsService.checkEmpDetailsUpdatedStatus(localStorage.getItem("Id")).subscribe(data => {
      if (data == true) {
        if (this.accessToModules.length) {
          if (this.accessToModules.includes("settings")) {
            this.utilsService.openSnackBarSettings("Your details have been updated. So your account will logout automatically, please login again", "OK");
          }
          else {
            this.utilsService.openSnackBarSettings("Admin updated your account details, so your account will logout automatically. Please login again", "OK");
          }
        }
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          this.router.navigate(["/login"]);
          sessionStorage.removeItem('More_sidenav');
        }, 6000);
      }
    })
  }
  setExpiredData() {
    let dataToSend = { plan: 'expired' };
    this.dataServiceService.setData(dataToSend);
  }
  // apiKey = environment.apiKey;
  //  genAI = new GoogleGenerativeAI(this.apiKey);
  
  //  model = this.genAI.getGenerativeModel({
  //   model: "gemini-1.5-flash",
  // });
  
  //  generationConfig = {
  //   temperature: 1,
  //   topP: 0.95,
  //   topK: 64,
  //   maxOutputTokens: 8192,
  //   responseMimeType: "text/plain",
  // };

  // async checkResponse() {
  //   const config = {
  //     temperature: 1,
  //     topP: 0.95,
  //     topK: 64,
  //     maxOutputTokens: 8192,
  //     responseMimeType: "text/plain",
  //   };

  //   this.chatgptService.analyzeText({ ...config, history: [{ inputData: this.inputData }] }).subscribe(
  //     response => {
  //       this.result = response;
  //     },
  //     error => {
  //       console.error('Error analyzing text', error);
  //     }
  //   );
    // this.chatgptService.analyzeText({ text: this.inputData }).subscribe(
    //   response => {
    //     this.result = response;
    //   },
    //   error => {
    //     console.error('Error analyzing text', error);
    //   }
    // );
 

//  async checkResponse() {  
//   const genAI = new GoogleGenerativeAI(environment.apiKey);
//   // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

//   const prompt = "Write a story about a magic backpack."

//   this.result= true;
//   const result = await model.generateContent(this.inputData);
//   const textString = await result.response;
//   this.response = textString.text();
// }

    
  }
  //  let input: any= document.getElementById("AiQuestion") ;
  //  this.chatgptService.queryAI(input).subscribe(data => {
    // this.chatgptService.queryAI(input).subscribe(data=> {

    // })
    // const chatSession = this.model.startChat({
    //   ...this.generationConfig,
    //   history: [
    //   ],
    // });
  
    // this.result = await chatSession.sendMessage(this.inputData);
    // console.log(this.result.response.text());
  // }
  //  openai = new OpenAI({
  //   apiKey: environment.apiKey,dangerouslyAllowBrowser: true
  // });
  // async checkResponse() {
  //   const openai = new OpenAI({
  //     apiKey: environment.apiKey,dangerouslyAllowBrowser: true,
  //     maxRetries: 0, // default is 2
  //   });
    
  //   // Or, configure per-request:
  //   await openai.chat.completions.create({ messages: [{ role: 'user', content: 'How can I get the name of the current day in Node.js?' }], model: 'dall-e-2' }, {
  //     maxRetries: 5,
  //   });
  //   this.chatgptService.generateResponse(this.prompt).subscribe(
  //       data => {
  //         this.response = data.choices[0].text;
  //       },
  //       error => {
  //         console.error('There was an error!', error);
  //       }
  //     );
  // }
// }
