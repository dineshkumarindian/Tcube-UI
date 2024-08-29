import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { RegisterService } from "../services/register.service";
import { PaymentService } from "../services/payment/payment.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { UtilService } from "../services/util.service";
import { ManagePricingPlanService } from "../services/super-admin/manage-pricing-plan/manage-pricing-plan.service";
import { DataServiceService } from '../util/shared/data-service.service';
import moment from 'moment';
import { NotificationService } from '../services/notification.service';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-payment-success-page',
  templateUrl: './payment-success-page.component.html',
  styleUrls: ['./payment-success-page.component.less']
})
export class PaymentSuccessPageComponent implements AfterViewInit {

  orgDetails: any;
  orgId: any;
  pricingPlandetails: any = [];
  transactionId: any;
  isPaymentProcess: boolean = true;
  isPaymentPass: boolean = false;
  isPaymentFailed: boolean = false;
  roleofEmployee: string;
  employeeDetails: any = [];

  constructor(private registerService: RegisterService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private paymentService: PaymentService,
    private utilsService: UtilService,
    private managePricingPlanService: ManagePricingPlanService,
    private ngZone: NgZone, private notificationService: NotificationService,
    private dataServiceService: DataServiceService, private employeeDetailService: EmployeeService) {

  }

  ngAfterViewInit(): void {
    this.orgId = localStorage.getItem("OrgId");
    this.roleofEmployee = localStorage.getItem("Role");
    this.getEmployeeById();
    this.getOrgdetailsByid();
  }

  payment_action: string = '';
  active_plan: string = '';
  async getOrgdetailsByid() {
    this.spinner.show();
    await this.registerService.getOrgDetailsById(this.orgId).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response: any = [];
          response = JSON.parse(data.map.data);
          this.orgDetails = response;
          // console.log(this.orgDetails);
          if (this.orgDetails.status === "Pending") {
            // debugger;
            this.payment_action = "Approve";
            this.managePricingPlanService
              .getPlanById(this.orgDetails.pricingPlanDetails.id)
              .subscribe(
                (res) => {
                  if (res.map.statusMessage == "Success") {
                    this.pricingPlandetails = JSON.parse(res.map.data);

                    if (
                      parseInt(this.pricingPlandetails.userslimit) <
                      parseInt(this.orgDetails.userslimit)
                    ) {
                      let amount =
                        this.pricingPlandetails.amount /
                        this.pricingPlandetails.userslimit;
                      this.pricingPlandetails.amount = (
                        amount * parseInt(this.orgDetails.userslimit)
                      ).toFixed(2);
                    }
                    let word = this.pricingPlandetails.currency;
                    this.pricingPlandetails.currency = word.split(" ").pop();
                    this.pricingPlandetails.modules = JSON.parse(
                      this.pricingPlandetails.modules
                    );
                    this.active_plan = this.pricingPlandetails.plan;
                  }
                  this.getLastPaymentDetails();
                },
                (error) => {
                  this.router.navigate(["/404"]);
                  this.spinner.hide();
                }
              );
          }
          if (
            this.orgDetails.status === "Expired" ||
            this.orgDetails.status === "Approved" ||
            this.orgDetails.status === "Trial"
          ) {
            if (this.orgDetails.plan_renewal == true) {
              this.payment_action = "Renewal";
            }
            if (
              // this.orgdetails.status === "Expired" ||
              this.orgDetails.plan_upgrade == true
            ) {
              // debugger;
              this.payment_action = "Upgrade";
              this.managePricingPlanService
                .getPlanById(this.orgDetails.upgradeRequestPlan)
                .subscribe(
                  (res) => {
                    if (res.map.statusMessage == "Success") {
                      this.pricingPlandetails = JSON.parse(res.map.data);
                      if (
                        parseInt(this.pricingPlandetails.userslimit) <
                        parseInt(this.orgDetails.userslimit)
                      ) {
                        let amount =
                          this.pricingPlandetails.amount /
                          this.pricingPlandetails.userslimit;
                        this.pricingPlandetails.amount = (
                          amount * parseInt(this.orgDetails.userslimit)
                        ).toFixed(2);
                      }
                      let word = this.pricingPlandetails.currency;
                      this.pricingPlandetails.currency = word.split(" ").pop();
                      this.pricingPlandetails.modules = JSON.parse(
                        this.pricingPlandetails.modules
                      );
                      this.active_plan = this.pricingPlandetails.plan;
                    }
                    this.getLastPaymentDetails();
                  },
                  (error) => {
                    this.router.navigate(["/404"]);
                    this.spinner.hide();
                  }
                );
            } else {
              // debugger
              this.pricingPlandetails = response.pricingPlanDetails;
              if (
                parseInt(this.pricingPlandetails.userslimit) <
                parseInt(this.orgDetails.userslimit)
              ) {
                let amount =
                  this.pricingPlandetails.amount /
                  this.pricingPlandetails.userslimit;
                this.pricingPlandetails.amount = (
                  amount * parseInt(this.orgDetails.userslimit)
                ).toFixed(2);
              }
              let word = this.pricingPlandetails.currency;
              this.pricingPlandetails.currency = word.split(" ").pop();
              this.pricingPlandetails.modules = JSON.parse(
                this.pricingPlandetails.modules
              );
              this.active_plan = this.pricingPlandetails.plan;
              this.getLastPaymentDetails();
            }
          }
        }
        this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }

  async getEmployeeById() {
    this.spinner.show();
    let email = localStorage.getItem('Email');
    await this.employeeDetailService.getEmployeeDetails(email).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.employeeDetails = JSON.parse(data.map.data);
        console.log(this.employeeDetails);
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      // this.spinner.hide();
    })
  }

  lastPaymentDetails: any = [];
  async getLastPaymentDetails() {
    this.spinner.show();
    await this.paymentService.lastPaymentDetails(this.orgId).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        this.lastPaymentDetails = JSON.parse(data.map.data);
        this.transactionId = this.lastPaymentDetails.transaction_id;
        this.verifyPaymentDetails();
      } else {
        this.spinner.hide();
      }
    })
  }

  paymentIntentDetails: any = {};
  async verifyPaymentDetails() {
    // debugger;
    this.spinner.show();
    let object_data = {
      "paymentIntentId": this.transactionId
    }
    this.paymentIntentDetails = {};
    await this.paymentService.verifyPaymentDetails(object_data).subscribe(data => {
      // debugger;
      if (data != "") {
        let response: string = data.payment_details;
        // console.log(response);
        let split_value = response.split('JSON: ')[1];
        this.paymentIntentDetails = JSON.parse(split_value);
        // console.log(this.paymentIntentDetails);
        if (this.paymentIntentDetails.status === 'succeeded') {
          setTimeout(() => {
            this.isPaymentProcess = false;
            this.isPaymentFailed = true;
            this.paymentStatusUpdate("failed");
          }, 1000);
          setTimeout(() => { this.paymentFailedProcess() }, 3000);
          // setTimeout(() => {
          //   this.isPaymentProcess = false;
          //   this.isPaymentPass = true;
          //   this.paymentStatusUpdate("success");
          // }, 1000);
          // setTimeout(() => { this.updateStripeSuccessUrlMoveLoginPage() }, 3000);
          // Handle successful payment verification (e.g., update UI)
        } else {
          // console.error('Payment verification failed.');
          setTimeout(() => {
            this.isPaymentProcess = false;
            this.isPaymentFailed = true;
            this.paymentStatusUpdate("failed");
          }, 1000);
          setTimeout(() => { this.paymentFailedProcess() }, 3000);
          // Handle payment verification failure (e.g., display error message)
        }
        this.spinner.hide();
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  async paymentStatusUpdate(status: any) {
    let pay_status = status;
    let data = {
      "orderId": this.lastPaymentDetails.orderId,
      "status": pay_status
    }
    await this.paymentService.paymentStatusUpdate(data).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
      }
    })
  }


  redirectPage(msg: any) {
    if (msg == "Success") {
      this.updateStripeSuccessUrlMoveLoginPage();
    }
    if (msg == "Failure") {
      this.paymentFailedProcess();
    }
  }

  async updateStripeSuccessUrlMoveLoginPage() {
    this.spinner.show();
    // debugger;
    let url: any = window.location.href;
    url = url.split("/");
    let status = "";
    let modules: any[] = this.pricingPlandetails.modules;

    if (this.orgDetails.status === "Pending") {
      status = "approved";
    }
    if (
      this.orgDetails.status === "Expired" ||
      this.orgDetails.status === "Approved" ||
      this.orgDetails.status === "Trial"
    ) {
      if (
        this.orgDetails.status === "Expired" ||
        this.orgDetails.plan_renewal == true
      ) {
        status = "renew";
      }
      if (this.orgDetails.plan_upgrade == true) {
        status = "upgrade";
      }
    }
    for (var i = 0; i < modules.length; i++) {
      // console.log(modules[i]);
      if (modules[i] == "project/jobs") {
        modules.splice(i + 1, 0, "client-settings");
        i = i + 1;
      } else if (modules[i] == "time-tracker") {
        modules.splice(
          i + 1,
          0,
          "time-tracker-settings"
        );
        i = i + 1;
      } else if (modules[i] == "leave-tracker") {
        modules.splice(
          i + 1,
          0,
          "leave-tracker-settings"
        );
        i = i + 1;
      } else if (modules[i] == "attendance") {
        modules.splice(i + 1, 0, "attendance-settings");
        i = i + 1;
      } else if (modules[i] == "day-planner") {
        modules.splice(i + 1, 0, "my-day-planner");
        modules.splice(
          i + 2,
          0,
          "day-planner-settings"
        );
        i = i + 2;
      }
      else if (modules[i] == "company-policy") {
        modules.splice(i + 1, 0, "company-policy-settings");
        i = i + 1;
      }
    }
    let formdata = {
      org_id: this.orgDetails.org_id,
      id: this.orgDetails.org_id,
      plan_id: this.pricingPlandetails.id,
      planrequest: status,
      plan_amount: (this.pricingPlandetails.amount).toString(),
      modules: JSON.stringify(modules),
      orderId: this.lastPaymentDetails.orderId,
      url: url[2],
      login: url[0] + "/" + url[1] + "/" + url[2] + "/#/login",
      role: this.roleofEmployee,
      employee_mail: this.employeeDetails.email,
      employee_id: this.employeeDetails.id,
      // payment_status: "success",
      paymentId: this.lastPaymentDetails.paymentId,
      transaction_id: this.lastPaymentDetails.transaction_id,
      payment_plan: this.pricingPlandetails.plan,
      billing_address: this.paymentIntentDetails.charges.data[0].billing_details.address != null ? JSON.stringify(this.paymentIntentDetails.charges.data[0].billing_details.address) : '-',
      billing_email: this.paymentIntentDetails.charges.data[0].billing_details.email != null ? this.paymentIntentDetails.charges.data[0].billing_details.email : '-',
      billing_name: this.paymentIntentDetails.charges.data[0].billing_details.name != null ? this.paymentIntentDetails.charges.data[0].billing_details.name : '-',
      billing_phone: this.paymentIntentDetails.charges.data[0].billing_details.phone != null ? this.paymentIntentDetails.charges.data[0].billing_details.phone : '-',
      receipt_no: this.paymentIntentDetails.charges.data[0].receipt_number != null ? this.paymentIntentDetails.charges.data[0].receipt_number : '-',
      receipt_url: this.paymentIntentDetails.charges.data[0].receipt_url != null ? this.paymentIntentDetails.charges.data[0].receipt_url : '-',
      payment_method: this.paymentIntentDetails.charges.data[0].payment_method_details.card.brand != null ? (this.paymentIntentDetails.charges.data[0].payment_method_details.card.brand).toUpperCase() + " - " + this.paymentIntentDetails.charges.data[0].payment_method_details.card.last4 : '-'
    };
    // console.log(formdata);
    await this.paymentService.stripePaymentStatusSuccessPage(formdata).subscribe((data: any) => {
      if (data.map.statusMessage == "Success" && data.map.Error == "Error in sending confirmation mail due to issue in mail configuration, check the configuration details") {
        // debugger;
        let response = JSON.parse(data.map.data);
        let dataToSend = { plan: 'activated' };
        this.dataServiceService.setData(dataToSend);
        this.spinner.hide();
        this.notificationWithEmailMsg();
        this.ngZone.run(() => {
          // debugger;
          if (this.orgDetails.plan_renewal == true || this.orgDetails.plan_upgrade == true) {
            localStorage.setItem("OrganizationPlan", "active");
            window.localStorage.setItem('newTabId', 'completed');
            this.router.navigate(["/subscription"]);
            setTimeout(() => {
              window.location.reload();
            });
          }
          else {
            window.localStorage.setItem('newTabId', 'completed');
            this.router.navigate(['/'], { replaceUrl: true });
            setTimeout(() => {
              window.location.reload();
            });
          }
        }, 500);
      } else if (data.map.statusMessage == "Success") {
        // debugger;
        let dataToSend = { plan: 'activated' };
        this.dataServiceService.setData(dataToSend);
        this.spinner.hide();
        this.ngZone.run(() => {
          // debugger;
          if (this.orgDetails.plan_renewal == true || this.orgDetails.plan_upgrade == true) {
            localStorage.setItem("OrganizationPlan", "active");
            window.localStorage.setItem('newTabId', 'completed');
            this.router.navigate(["/subscription"]);
            setTimeout(() => {
              window.location.reload();
            });
          }
          else {
            window.localStorage.setItem('newTabId', 'completed');
            this.router.navigate(['/'], { replaceUrl: true });
            setTimeout(() => {
              window.location.reload();
            });
          }
        }, 500);
      } else {
        this.spinner.hide();
        this.utilsService.openSnackBarMC(
          "Your payment is successfully processed, Facing some internal issue, Please contact sales@tcube.io",
          "OK"
        );
        window.localStorage.setItem('newTabId', 'completed');
        this.router.navigate(['/'], { replaceUrl: true });
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }
  paymentFailedProcess() {
    // debugger;
    // console.log(this.paymentIntentDetails);
    let url: any = window.location.href;
    url = url.split("/");
    this.spinner.show();
    let formData = {
      org_id: this.orgDetails.org_id,
      id: this.orgDetails.org_id,
      plan_id: this.pricingPlandetails.id,
      orderId: this.lastPaymentDetails.orderId,
      url: url[2],
      login: url[0] + "/" + url[1] + "/" + url[2] + "/#/login",
      role: this.roleofEmployee,
      employee_mail: this.employeeDetails.email,
      employee_id: this.employeeDetails.id,
      // payment_status: "failed",
      plan_amount: (this.pricingPlandetails.amount).toString(),
      paymentId: this.lastPaymentDetails.paymentId,
      transaction_id: this.lastPaymentDetails.transaction_id,
      payment_plan: this.pricingPlandetails.plan,
      billing_address: this.paymentIntentDetails.charges.data[0].billing_details.address != null ? JSON.stringify(this.paymentIntentDetails.charges.data[0].billing_details.address) : '-',
      billing_email: this.paymentIntentDetails.charges.data[0].billing_details.email != null ? this.paymentIntentDetails.charges.data[0].billing_details.email : '-',
      billing_name: this.paymentIntentDetails.charges.data[0].billing_details.name != null ? this.paymentIntentDetails.charges.data[0].billing_details.name : '-',
      billing_phone: this.paymentIntentDetails.charges.data[0].billing_details.phone != null ? this.paymentIntentDetails.charges.data[0].billing_details.phone : '-',
      receipt_no: this.paymentIntentDetails.charges.data[0].receipt_number != null ? this.paymentIntentDetails.charges.data[0].receipt_number : '-',
      receipt_url: this.paymentIntentDetails.charges.data[0].receipt_url != null ? this.paymentIntentDetails.charges.data[0].receipt_url : '-',
      payment_method: this.paymentIntentDetails.charges.data[0].payment_method_details.card.brand != null ? (this.paymentIntentDetails.charges.data[0].payment_method_details.card.brand).toUpperCase() + " - " + this.paymentIntentDetails.charges.data[0].payment_method_details.card.last4 : '-'
    }
    console.log(formData);
    this.paymentService.stripePaymentStatusTransectionFailed(formData).subscribe((data: any) => {
      if (data.map.statusMessage == "Success" && data.map.Error == "Error in sending confirmation mail due to issue in mail configuration, check the configuration details") {
        let dataToSend = { plan: 'activated' };
        this.dataServiceService.setData(dataToSend);
        this.spinner.hide();
        this.notificationWithEmailMsg();
        this.ngZone.run(() => {
          if (this.orgDetails.plan_renewal == true || this.orgDetails.plan_upgrade == true) {
            localStorage.setItem("OrganizationPlan", "active");
            window.localStorage.setItem('newTabId', 'completed');
            this.utilsService.openSnackBarMC(
              "Your Stripe payment has failed. The amount will be refunded. Please try again later",
              "OK"
            );
            this.router.navigate(["/subscription"]);
          }
          else {
            window.localStorage.setItem('newTabId', 'completed');
            this.utilsService.openSnackBarMC(
              "Your Stripe payment has failed. Please try again later",
              "OK"
            );
            this.router.navigate(['/'], { replaceUrl: true });
          }
          setTimeout(() => {
            window.location.reload();
          });
        }, 500);
      } else if (data.map.statusMessage == "Success") {
        let dataToSend = { plan: 'activated' };
        this.dataServiceService.setData(dataToSend);
        this.spinner.hide();
        this.ngZone.run(() => {
          if (this.orgDetails.plan_renewal == true || this.orgDetails.plan_upgrade == true) {
            localStorage.setItem("OrganizationPlan", "active");
            window.localStorage.setItem('newTabId', 'completed');
            this.utilsService.openSnackBarMC(
              "Your Stripe payment has failed. The amount will be refunded. Please try again later",
              "OK"
            );
            this.router.navigate(["/subscription"]);
          }
          else {
            window.localStorage.setItem('newTabId', 'completed');
            this.utilsService.openSnackBarMC(
              "Your Stripe payment has failed. Please try again later",
              "OK"
            );
            this.router.navigate(['/'], { replaceUrl: true });
          }
          setTimeout(() => {
            window.location.reload();
          });
        }, 500);
        // this.spinner.hide();
      } else {
        this.utilsService.openSnackBarMC(
          "We are currently experiencing some issues with our product site. Our team is working to resolve the problem as quickly as possible. We appreciate your patience and understanding during this time",
          "OK"
        );
        this.spinner.hide();
        this.router.navigate(['/'], { replaceUrl: true });
      }
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  async notificationWithEmailMsg() {
    this.spinner.show();
    let notify_id;
    let zone = moment.tz.guess();
    let message =
      "Mail configuration issue encountered while " + this.employeeDetails.id + " trying to process the payment.";
    let formdata = {
      "org_id": 1,
      "message": message,
      "to_notify_id": 1, // Super admin id
      "notifier": this.employeeDetails.id,
      "keyword": "mail-issue",
      "timezone": zone,
    };
    await this.notificationService
      .postNotification(formdata)
      .subscribe((data) => {
        if (data.map.statusMessage == "Success") {
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      });
  }
}
