import { Component, OnInit } from '@angular/core';
import *as Highcharts from 'highcharts';
import { Router } from '@angular/router';
import { RegisterService } from '../services/register.service';
import {SuperAdminDashboardService } from '../services/super-admin/SA-dashboard/super-admin-dashboard.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManagePricingPlanService } from '../services/super-admin/manage-pricing-plan/manage-pricing-plan.service';

export interface PeriodicElement {
  S_No:number;
  Id: number;
  Organization:string;
  Client: string;
  Renewal_Date: string;
  Renewal_plan: string;
  Renewal_amount:number;
  Bill_no:number;
}
export interface Element{
  S_No:number;
  Id:string;
  Organization:string;
  Client: string;
  Client_Name:String;
  client_email:String;
  particular:String;
  Transaction_Date:String;
  charge_amount:number;

}
const ELEMENT_DATA= [
  {S_No:1,Id: 101, Organization:"Ysets",Client: 'flipkart', Renewal_Date:"01/08/2022",Renewal_plan :"3 month of plan",Renewal_amount:500,Bill_no:101},
  {S_No:2,Id: 102,Organization:"Ysets", Client: 'amazon', Renewal_Date:"01/08/2022",Renewal_plan :"1 month of plan",Renewal_amount:150,Bill_no:102},
  {S_No:3,Id: 103,Organization:"Ysets", Client: 'zoho', Renewal_Date:"01/08/2022",Renewal_plan :"2 month of plan",Renewal_amount:250,Bill_no:103},
  {S_No:4,Id: 104,Organization:"Ysets", Client: 'cognizant', Renewal_Date:"01/08/2022",Renewal_plan :"2 month of plan",Renewal_amount:250,Bill_no:104},
  {S_No:5,Id: 105,Organization:"Ysets", Client: 'calibraint', Renewal_Date:"01/08/2022",Renewal_plan :"1 month of plan",Renewal_amount:150,Bill_no:105},
]
const Transaction=[
  {S_No:1,Id:"#101",Organization:"Ysets",Client: "flipkart",Client_Name:"Dinesh",particular:"paid",client_email:"dinesh@gmail.com",Transaction_Date:"02/08/2022", charge_amount:1500},
  {S_No:2,Id:"#102",Organization:"Ysets",Client: "amazon",Client_Name:"logu",particular:"unpaid",client_email:"logu@gmail.com",Transaction_Date:"02/08/2022",charge_amount:1500},
  {S_No:3,Id:"#103",Organization:"Ysets",Client: "zoho",Client_Name:"guhan",particular:"paid",client_email:"guhan@gmail.com",Transaction_Date:"02/08/2022",charge_amount:1500},
  {S_No:4,Id:"#104",Organization:"Ysets",Client: "infosys",Client_Name:"bala",particular:"unpaid",client_email:"bala@gmail.com",Transaction_Date:"02/08/2022",charge_amount:1500}


]
@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.less']
})

export class SuperAdminDashboardComponent implements OnInit {
  option: any;
  series: any[] = ["Overall", "Active", "Inactive"];
  yaw_c: any[] = ["overall", "active", "Inactive"];
  activecountloader :boolean = true;
  // countDetails: any;
  activeCount:any;
  inactiveCount :any;
  rejectedCount :any;
  pendingCount :any;
  totalCount :any;
  planCount : any;
  constructor(
    // public highCharts:Highcharts
    public router: Router,
    private registerService: RegisterService, 
    private superadminService :SuperAdminDashboardService,
    private spinner: NgxSpinnerService,
    private managePricingPlanService : ManagePricingPlanService,

  ) { }

  ngOnInit() {
    setTimeout(() => {
      new Highcharts.Chart('container', this.adminChartOption());
    }, 1000);
    this.getTotalCountDetails();
    this.getTotalPlanDetails();
  }

  getTotalPlanDetails() {
    this.spinner.show();
    this.managePricingPlanService.getAllPlanDetails().subscribe(data => {
      // this.plancountLoader = true;
      if (data.map.statusMessage == "Success") {
        let response: any[] = JSON.parse(data.map.data);
        this.planCount = response.length;
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  getTotalCountDetails() {
    this.spinner.show();
    this.superadminService.getTotalOrgCount().subscribe(data => {
      this.activecountloader =true;
      if (data.map.statusMessage == "Success") {
        const response = JSON.parse(data.map.data);
        if(response.length){
        // this.countDetails = response.pop();
        this.activeCount = response[0].activeCountInfo;
        this.inactiveCount = response[0].inActiveCountInfo;
        this.rejectedCount = response[0].rejectCountInfo;
        this.pendingCount = response[0].pendingCountInfo;
        this.totalCount = response[0].totalCountInfo;
        this.activecountloader = false;
        }
      }
      this.spinner.hide();
    }, (error) => {
      this.router.navigate(["/404"]);
      this.spinner.hide();
    })
  }

  // Highcharts.chart('container',{});
  adminChartOption() {
    this.option = {

      chart: {
        type: 'column'
      },
      title: {
        align: 'left',
        text: 'Overall Clients,active and Inactive Clients'
      },
      // subtitle: {
      //   align: 'left',
      //   // text: 'Click the columns to view versions. Source: <a href="http://statcounter.com" target="_blank">statcounter.com</a>'
      // },
      accessibility: {
        announceNewData: {
          enabled: true
        }
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: 'Client_details'
        }

      },
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y:.1f}%'
          }
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
      },
      series: [
        {
          name: "Clients details",
          // colorByPoint: true,
          data: [
            {
              name: "overall Clients",
              y: 62.74,
              drilldown: "overall Clients",
              color:"#85c88a"
            },
            {
              name: "Active Clients",
              y: 10.57,
              drilldown: "Clients",
              color:"#6fb2d2"

            },
            {
              name: "InActive Clients",
              y: 7.23,
              drilldown: "InActive Clients",
              color:"#C51F1F"
            },

          ]
        }
      ],
      drilldown: {
        breadcrumbs: {
          position: {
            align: 'right'
          }
        },
        series: [
          {
            name: "overall Clients",
            id: "overall Clients",
            color:"#85c88a",
            data: [
              [
                "v65.0",
                0.1
              ],
              [
                "v64.0",
                1.3
              ],
              [
                "v63.0",
                53.02
              ],
              [
                "v62.0",
                1.4
              ],
              [
                "v61.0",
                0.88
              ],
              [
                "v60.0",
                0.56
              ],
              [
                "v59.0",
                0.45
              ],
              [
                "v58.0",
                0.49
              ],
              [
                "v57.0",
                0.32
              ],
              [
                "v56.0",
                0.29
              ],
              [
                "v55.0",
                0.79
              ],
              [
                "v54.0",
                0.18
              ],
              [
                "v51.0",
                0.13
              ],
              [
                "v49.0",
                2.16
              ],
              [
                "v48.0",
                0.13
              ],
              [
                "v47.0",
                0.11
              ],
              [
                "v43.0",
                0.17
              ],
              [
                "v29.0",
                0.26
              ]
            ]
          },
          {
            name: "Active Clients",
            id: "Active Clients",
            color:"#6fb2d2",
            data: [
              [
                "v58.0",
                1.02
              ],
              [
                "v57.0",
                7.36
              ],
              [
                "v56.0",
                0.35
              ],
              [
                "v55.0",
                0.11
              ],
              [
                "v54.0",
                0.1
              ],
              [
                "v52.0",
                0.95
              ],
              [
                "v51.0",
                0.15
              ],
              [
                "v50.0",
                0.1
              ],
              [
                "v48.0",
                0.31
              ],
              [
                "v47.0",
                0.12
              ]
            ]
          },
          {
            name: "InActive Clients",
            id: "InActive Clients",
            color:"#C51F1F",
            data: [
              [
                "v11.0",
                6.2
              ],
              [
                "v10.0",
                0.29
              ],
              [
                "v9.0",
                0.27
              ],
              [
                "v8.0",
                0.47
              ]
            ]
          },
          
        ]
          
        
      }
    }
    return this.option;
  }
  displayedColumns: string[] = [ "S_No","Id","Organization","Client","Renewal_Date","Renewal_plan","Renewal_amount","Bill_no"];
  dataSource = ELEMENT_DATA;
  displayedColumns1: string[] = ["S_No","Id","Organization","Client","Client_Name","particular","Transaction_Date","charge_amount"];
  dataSource1= Transaction;
  
}
