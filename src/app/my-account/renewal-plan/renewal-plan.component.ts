import { Component, NgZone, OnInit } from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";
import { RegisterService } from "../../services/register.service";
import { NgxSpinnerService } from "ngx-spinner";
import { PaymentService } from "../../services/payment/payment.service";
import { ManagePricingPlanService } from "../../services/super-admin/manage-pricing-plan/manage-pricing-plan.service";
import { environment } from "src/environments/environment";
import { UtilService } from "../../services/util.service";
import { DataServiceService } from "../../util/shared/data-service.service";
import { loadStripe } from '@stripe/stripe-js';
import { ManageOrgService } from 'src/app/services/super-admin/manage-org/manage-org.service';
import {EmployeeService} from 'src/app/services/employee.service';

declare var Razorpay: any;
@Component({
  selector: 'app-renewal-plan',
  templateUrl: './renewal-plan.component.html',
  styleUrls: ['./renewal-plan.component.less']
})
export class RenewalPlanComponent implements OnInit {
  payment: string = "";
  Org_id: string;
  pricingPlandetails: any = [];
  heading: string;
  url: any = window.location.href;
  renewalId:number = 0;
  roleofEmployee:string;
  employeeDetails:any = [];

  constructor(private registerService: RegisterService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private paymentService: PaymentService,
    private managePricingPlanService: ManagePricingPlanService,
    private utilsService: UtilService,
    private ngZone: NgZone,
    private dataServiceService: DataServiceService,
    private manageOrgService: ManageOrgService,
    private activatedRoute : ActivatedRoute,
    private employeeDetailService:EmployeeService) {
    this.url = this.url.split('/');
    this.heading = '';
    if (this.url[4] == 'update-plan') {
      this.heading = 'Upgrade Plan';
    } else {
      if (this.url[4] == 'renewal-plan') {
        this.heading = 'Renewal Plan';
        // this.renewalId = this.activatedRoute.snapshot.params.id;
      }
    }
  }

  ngOnInit(): void {
    this.payment = '';
    this.Org_id = localStorage.getItem("OrgId");
    this.getOrgdetailsByid();
    this.roleofEmployee = localStorage.getItem("Role");
    if(this.roleofEmployee != 'org_admin') {
      this.getEmployeeById();
    }

    // if (localStorage.getItem("Role") != "org_admin") {
    //   this.router.navigate(["/login"]);
    // }
  }
  
  // isShowDivIf = false;
  // isActiveProject: boolean = false;
  // showPriceCard() {
  //   this.isShowDivIf = !this.isShowDivIf;
  //   setTimeout(() => {
  //     const element = document.getElementById("scrollToPricingPlan");
  //     element.scrollIntoView({
  //       behavior: "smooth",
  //       block: "center",
  //       inline: "center",
  //     });
  //   }, 100);
  // }


  active_plan: any;
  orgDetails: any = [];
  payment_action: String;
  async getOrgdetailsByid() {
    this.spinner.show();
    await this.registerService.getOrgDetailsById(this.Org_id).subscribe(
      (data) => {
        if (data.map.statusMessage == "Success") {
          let response: any = [];
          response = JSON.parse(data.map.data);
          this.orgDetails = response;
          // console.log(this.orgDetails);
          if (this.orgDetails.status === "Pending") {
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
                  },
                  (error) => {
                    this.router.navigate(["/404"]);
                    this.spinner.hide();
                  }
                );
            } else {
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

  async getEmployeeById(){
    this.spinner.show();
    let email = localStorage.getItem('Email');
    await this.employeeDetailService.getEmployeeDetails(email).subscribe(data =>{
      if(data.map.statusMessage == "Success"){
        this.employeeDetails = JSON.parse(data.map.data);
        // console.log(this.employeeDetails);
        this.spinner.hide();
      }
      else{
        this.spinner.hide();
      }
    },(error) => {
      this.router.navigate(["/404"]);
      // this.spinner.hide();
    })
  }
  // async getOrgdetailsByid() {
  //   this.spinner.show();
  //   this.pricingPlandetails = [];
  //   this.orgdetails = [];
  //   await this.registerService.getOrgDetailsById(this.Org_id).subscribe(
  //     (data) => {
  //       // debugger;
  //       if (data.map.statusMessage == "Success") {
  //         let response: any = [];
  //         response = JSON.parse(data.map.data);
  //         this.orgdetails = response;
  //         // console.log(this.orgdetails);
  //         if (this.orgdetails.plan_renewal == true) {
  //           // debugger;
  //           if (data.map.statusMessage == "Success") {
  //             this.managePricingPlanService.getPlanById(this.orgdetails.pricingPlanDetails.id).subscribe(
  //               (res) => {
  //                 if (res.map.statusMessage == "Success") {
  //                   this.pricingPlandetails = JSON.parse(res.map.data);
  //                   this.spinner.hide();
  //                 }
  //               })
  //           }
  //         } else {
  //           if (this.orgdetails.plan_upgrade == true) {
  //             this.managePricingPlanService.getPlanById(this.orgdetails.upgradeRequestPlan).subscribe(
  //               (res) => {
  //                 if (res.map.statusMessage == "Success") {
  //                   // debugger;
  //                   this.pricingPlandetails = JSON.parse(res.map.data);
  //                   // console.log("this.pricingPlandetails....", this.pricingPlandetails)
  //                   this.spinner.hide();
  //                 }
  //               })
  //           }
  //         }
  //         // console.log(this.pricingPlandetails);
  //         // if (this.orgdetails.status === "Pending") {
  //         //   this.payment_action = "Approve";
  //         //   this.managePricingPlanService
  //         //     .getPlanById(this.orgdetails.pricingPlanDetails.id)
  //         //     .subscribe(
  //         //       (res) => {
  //         //         if (res.map.statusMessage == "Success") {
  //         //           this.pricingPlandetails = JSON.parse(res.map.data);
  //         //           if (
  //         //             parseInt(this.pricingPlandetails.userslimit) <
  //         //             parseInt(this.orgdetails.userslimit)
  //         //           ) {
  //         //             let amount =
  //         //               this.pricingPlandetails.amount /
  //         //               this.pricingPlandetails.userslimit;
  //         //             this.pricingPlandetails.amount = (
  //         //               amount * parseInt(this.orgdetails.userslimit)
  //         //             ).toFixed(2);
  //         //           }
  //         //           let word = this.pricingPlandetails.currency;
  //         //           this.pricingPlandetails.currency = word.split(" ").pop();
  //         //           this.pricingPlandetails.modules = JSON.parse(
  //         //             this.pricingPlandetails.modules
  //         //           );
  //         //           this.active_plan = this.pricingPlandetails.plan;
  //         //         }
  //         //         this.spinner.hide();
  //         //       },
  //         //       (error) => {
  //         //         this.router.navigate(["/404"]);
  //         //         this.spinner.hide();
  //         //       }
  //         //     );
  //         // }
  //         // if (
  //         //   this.orgdetails.status === "Expired" ||
  //         //   this.orgdetails.status === "Approved" ||
  //         //   this.orgdetails.status === "Trial"
  //         // ) {
  //         //   if (this.orgdetails.plan_renewal == true) {
  //         //     this.payment_action = "Renewal";
  //         //   }
  //         //   if (
  //         //     // this.orgdetails.status === "Expired" ||
  //         //     this.orgdetails.plan_upgrade == true
  //         //   ) {
  //         //     this.payment_action = "Upgrade";
  //         //     this.managePricingPlanService
  //         //       .getPlanById(this.orgdetails.upgradeRequestPlan)
  //         //       .subscribe(
  //         //         (res) => {
  //         //           if (res.map.statusMessage == "Success") {
  //         //             this.pricingPlandetails = JSON.parse(res.map.data);
  //         //             if (
  //         //               parseInt(this.pricingPlandetails.userslimit) <
  //         //               parseInt(this.orgdetails.userslimit)
  //         //             ) {
  //         //               let amount =
  //         //                 this.pricingPlandetails.amount /
  //         //                 this.pricingPlandetails.userslimit;
  //         //               this.pricingPlandetails.amount = (
  //         //                 amount * parseInt(this.orgdetails.userslimit)
  //         //               ).toFixed(2);
  //         //             }
  //         //             let word = this.pricingPlandetails.currency;
  //         //             this.pricingPlandetails.currency = word.split(" ").pop();
  //         //             this.pricingPlandetails.modules = JSON.parse(
  //         //               this.pricingPlandetails.modules
  //         //             );
  //         //             this.active_plan = this.pricingPlandetails.plan;
  //         //           }
  //         //           this.spinner.hide();
  //         //         },
  //         //         (error) => {
  //         //           this.router.navigate(["/404"]);
  //         //           this.spinner.hide();
  //         //         }
  //         //       );
  //         //   } else {
  //         //     this.pricingPlandetails = response.pricingPlanDetails;
  //         //     if (
  //         //       parseInt(this.pricingPlandetails.userslimit) <
  //         //       parseInt(this.orgdetails.userslimit)
  //         //     ) {
  //         //       let amount =
  //         //         this.pricingPlandetails.amount /
  //         //         this.pricingPlandetails.userslimit;
  //         //       this.pricingPlandetails.amount = (
  //         //         amount * parseInt(this.orgdetails.userslimit)
  //         //       ).toFixed(2);
  //         //     }
  //         //     let word = this.pricingPlandetails.currency;
  //         //     this.pricingPlandetails.currency = word.split(" ").pop();
  //         //     this.pricingPlandetails.modules = JSON.parse(
  //         //       this.pricingPlandetails.modules
  //         //     );
  //         //     this.active_plan = this.pricingPlandetails.plan;
  //         //     this.spinner.hide();
  //         //   }
  //         // }
  //       }
  //     },
  //     (error) => {
  //       this.router.navigate(["/404"]);
  //       this.spinner.hide();
  //     }
  //   );
  // }


  clickPaymentValue() {
    if (this.payment == 'razorpay') {
      this.makePayment();
    } else if (this.payment == 'stripe') {
      this.redirectToCheckout();
    }
    else if (this.payment == 'cashfree') {
    }
  }

  makePayment() {
    this.spinner.show();
    let formdata = {
      orgId: this.Org_id,
      orgName: this.orgDetails.company_name,
      currency: this.pricingPlandetails.currency,
      amount: this.pricingPlandetails.amount,
      key_note: 'Razorpay',
    };
    this.paymentService.createPaymentOrder(formdata).subscribe(
      (data) => {
        // this.spinner.hide();
        if (data.map.statusMessage == "Success") {
          this.redirectToPaymentGateway(data.map.data);
        }
        // this.spinner.hide();
      },
      (error) => {
        this.router.navigate(["/404"]);
        // this.spinner.hide();
      }
    );
  }


  redirectToPaymentGateway(order_id) {
    const options = {
      key: environment.razorpayKey,
      amount: this.pricingPlandetails.amount, // Payment amount in paise (e.g., 10000 paise = INR 100)
      currency: this.pricingPlandetails.currency,
      name: "Tcube",
      description: "Payment for Product",
      image: "https://app.tcube.io/assets/images/App_web_logo.jpg", // Path to your logo image
      order_id: order_id, // The Razorpay order ID will be set dynamically
      handler: (response: any) => {
        let status = "";
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
        let url: any = window.location.href;

        url = url.split("/");
        this.addSettings();
        // Handle the payment success response
        let formdata = {
          org_id: this.Org_id,
          id: this.Org_id,
          plan_id: this.pricingPlandetails.id,
          planrequest: status,
          modules: JSON.stringify(this.pricingPlandetails.modules),
          url: url[2],
          login: url[0] + "/" + url[1] + "/" + url[2] + "/#/login",
          // "orderId": order_id,
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        };
        // setTimeout(() => {this.successHandle(formdata);},1000);
        this.successHandle(formdata);
      },
      modal: {
        ondismiss: () => {
          // This callback will be called when the payment modal is closed
          this.spinner.hide();
          // Perform actions you want when the modal is closed
        }
      },
      // prefill: {
      //   name: this.orgdetails.firstname+" "+this.orgdetails.lastname,
      //   email: this.orgdetails.email,
      //   // contact: ''
      // },
      // notes: {
      //   address: ''
      // },
      theme: {
        color: "#00214c", // Customize the Razorpay checkout theme color
      },
    };

    const rzp = new Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      // Handle the payment failure response
      this.spinner.hide();
    });

    rzp.open();
  }

  successHandle(payload) {
    // this.spinner.show();
    this.paymentService.handlePaymentCallback(payload).subscribe(
      async (data) => {
        if (data.map.statusMessage == "Success") {
          let dataToSend = { plan: 'activated' };
          this.dataServiceService.setData(dataToSend);
          this.spinner.hide();
          this.ngZone.run(() => {
            localStorage.clear();
            this.router.navigate(['/'], { replaceUrl: true });
            this.utilsService.openSnackBarAC("Plan updated successfully", "OK");
            setTimeout(() => {
              window.location.reload();
            });
          }, 500);
          // this.router.navigate(["/login"]); 


          // this.router.navigate(["/"]).then(() => {            
          //   window.location.reload();
          //   this.utilsService.openSnackBarAC("Plan updated successfully", "OK");
          // });          
          // setTimeout(() => {
          //   // localStorage.clear();
          //   // sessionStorage.clear();
          //   this.spinner.hide();
          //   this.router.navigate(["/"]).then(() => {
          //     window.location.reload();
          //   });
          //   // window.location.reload();
          // }, 500);

        } else {
          this.spinner.hide();
          this.utilsService.openSnackBarMC(
            "Failed to update Plan integration",
            "OK"
          );
        }
      },
      (error) => {
        this.router.navigate(["/404"]);
        this.spinner.hide();
      }
    );
  }


  async redirectToCheckout() {
    // Replace with your actual product details
    this.spinner.show();
    // let word = this.pricingPlandetails.currency;
    // this.pricingPlandetails.currency = word.split(" ").pop().toLowerCase();
    // this.pricingPlandetails.modules = JSON.parse(this.pricingPlandetails.modules);
    let url: any = window.location.href;
    url = url.split("/");
    let productData:any; 
    if(this.roleofEmployee == 'org_admin'){
      productData = {
      orgId: this.Org_id,
      orgName: this.orgDetails.company_name,
      quantity: 1,
      amount: this.pricingPlandetails.amount, // amount in cents
      productName: "Tcube",
      userName: this.orgDetails.firstname+" "+this.orgDetails.lastname,
      address: this.orgDetails.login_mobilenumber,
      email:this.orgDetails.email,
      currency: this.pricingPlandetails.currency,
      category_year: this.pricingPlandetails.category,
      key_note: 'Stripe',
      success_url: url[0] + "/" + url[1] + "/" + url[2] + "/#/payment-success",
      cancel_url: url[0] + "/" + url[1] + "/" + url[2] + "/#/subscription"
    };
  } else {
    productData = {
      orgId: this.Org_id,
      orgName: this.orgDetails.company_name,
      quantity: 1,
      amount: this.pricingPlandetails.amount, // amount in cents
      productName: "Tcube",
      userName: this.employeeDetails.firstname+" "+this.employeeDetails.lastname,
      address: this.employeeDetails.login_mobilenumber,
      email:this.employeeDetails.email,
      currency: this.pricingPlandetails.currency,
      category_year: this.pricingPlandetails.category,
      key_note: 'Stripe',
      success_url: url[0] + "/" + url[1] + "/" + url[2] + "/#/payment-success",
      cancel_url: url[0] + "/" + url[1] + "/" + url[2] + "/#/subscription"
    };
  }
  // console.log(this.roleofEmployee,"   ",productData);
    await this.paymentService.createStripePaymentCheckout(productData).subscribe(async (response: any) => {
      let data = response;
      if (data.map.error) {
        this.spinner.hide();
      } else {
        localStorage.setItem('stripeId', data.map.id);
        localStorage.setItem('transactionId', data.map.payment_intent);
        window.localStorage.setItem('newTabId', 'opened');
        let stripePublishKey = environment.PublishableKey;
        await loadStripe(stripePublishKey); // replace with your actual publishable key
        // console.log(stripe)
        // stripe!.redirectToCheckout({ sessionId: data.id });
        window.open(data.map.stripe_url, "_blank");
        
        // console.log(stripe!.redirectToCheckout({ sessionId: data.id }))
        this.spinner.hide();
      }
    });
  }

  addSettings() {
    for (var i = 0; i < this.pricingPlandetails.modules.length; i++) {
      if (this.pricingPlandetails.modules[i] == "project/jobs") {
        this.pricingPlandetails.modules.splice(i + 1, 0, "client-settings");
        i = i + 1;
      } else if (this.pricingPlandetails.modules[i] == "time-tracker") {
        this.pricingPlandetails.modules.splice(
          i + 1,
          0,
          "time-tracker-settings"
        );
        i = i + 1;
      } else if (this.pricingPlandetails.modules[i] == "leave-tracker") {
        this.pricingPlandetails.modules.splice(
          i + 1,
          0,
          "leave-tracker-settings"
        );
        i = i + 1;
      } else if (this.pricingPlandetails.modules[i] == "attendance") {
        this.pricingPlandetails.modules.splice(i + 1, 0, "attendance-settings");
        i = i + 1;
      } else if (this.pricingPlandetails.modules[i] == "day-planner") {
        this.pricingPlandetails.modules.splice(i + 1, 0, "my-day-planner");
        this.pricingPlandetails.modules.splice(
          i + 2,
          0,
          "day-planner-settings"
        );
        i = i + 2;
      }
      else if (this.pricingPlandetails.modules[i] == "company-policy") {
        this.pricingPlandetails.modules.splice(i + 1, 0, "company-policy-settings");
        i = i + 1;
      }
    }
  }

}
