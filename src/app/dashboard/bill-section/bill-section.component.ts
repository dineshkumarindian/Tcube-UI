import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
import { noDataMessage } from 'src/app/util/constants';

@Component({
  selector: 'app-bill-section',
  templateUrl: './bill-section.component.html',
  styleUrls: ['./bill-section.component.less']
})
export class BillSectionComponent implements OnInit, OnDestroy {
  nodataMsg = noDataMessage;
  No_Data_Found: boolean;
  No_Data_Found_mybillable: boolean;
  isShown: boolean = false;
  billable_time: string = "0";
  non_billable_time: string = "0";
  billable: number = 0;
  non_billable: number = 0;
  monthChartProjects = [];
  monthChartBillableMS: any = [];
  monthChartBillable: any = [];
  monthChartNonBillableMS: any = [];
  monthChartNonBillable: any = [];
  subscriptions : Subscription[] = [];
  options: any;
  org_id:any;
  constructor( public router: Router, private timetrackerservice: TimeTrackerService,) { }

  ngOnDestroy() {
    this.subscriptions.forEach(x => {
      if(!x.closed) {
        x.unsubscribe();
      }
    });
  }
  ngOnInit() {
    this.org_id = localStorage.getItem("OrgId");
    if (localStorage.getItem("Role") === "org_admin") {
      this.isShown = true;
    } else {
      this.isShown = false;
    }
    let formdata = {
      "empid": localStorage.getItem("Id"),
      "startdate": moment().format("01-MM-YYYY"),
      "enddate": moment().daysInMonth() + moment().format("-MM-YYYY"),
    }
    let subscription1 = this.timetrackerservice.getbillingchartmonth(formdata).subscribe(data => {
      if (data.map.statusMessage == "Success") {
        let response: any = data.map.data.map;
        if(response.billable_time == 0 && response.non_billable_time==0){
          this.No_Data_Found_mybillable=true;
        }
        this.billable = Number(response.billable_time);
        this.non_billable = Number(response.non_billable_time);
      }

      setTimeout(() => {
        Highcharts.chart('bill_status', this.setchartoption());

      }, 1000);
    }, (error) => {
      this.router.navigate(["/404"]);
    })

    let data: Object = {
      "org_id": this.org_id,
      "sd_date": moment().startOf('month').format("YYYY-MM-DD").toString(),
      "ed_date": moment().endOf('month').format("YYYY-MM-DD").toString(),
    }
    let subscription = this.timetrackerservice.getBillAndNonBillHoursByOrgIdAndProjects(data).subscribe(details => {
      if (details.map.statusMessage == "Success") {
        let projects = details.map.projects.myArrayList;
        if(projects.length ==0){
          this.No_Data_Found = true
        }
        else{
          this.monthChartProjects = projects;
        this.monthChartBillableMS = details.map.billable.myArrayList;
        // let billable = details.map.billable.myArrayList;
        this.monthChartNonBillableMS = details.map.non_billable.myArrayList;
        // let nonbillable = details.map.non_billable.myArrayList;
        for (let i = 0; i < this.monthChartBillableMS.length; i++) {
          var hrsValue = this.millisToMinutesAndSeconds(this.monthChartBillableMS[i]);
          // let tempData:any = parseInt(hrsValue);
          this.monthChartBillable.push(hrsValue);
        }
        // console.log(this.monthChartBillable);
        for (let i = 0; i < this.monthChartNonBillableMS.length; i++) {
          let hrsValue = this.millisToMinutesAndSeconds(this.monthChartNonBillableMS[i]);
          // let tempData = parseFloat(hrsValue);
          this.monthChartNonBillable.push(hrsValue);
        }
        // console.log(this.monthChartNonBillable);
        }
      }
      setTimeout(() => {
        Highcharts.chart('monthly_bill_hours', this.setMonthlychartoption());
      }, 1000);

    }, (error) => {
      this.router.navigate(["/404"]);
    })

    this.subscriptions.push(subscription);
    this.subscriptions.push(subscription1);
  }

  setchartoption() {
    //pie chart
    this.options = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        type: 'pie'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Current Month Billable/Non Billable Status',
        style: {
          fontSize: '16px'
        }
      },
      tooltip: {
        pointFormat: '{series.name}: {point.percentage:.1f}% ({point.time})'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          // size: '200px',
          allowPointSelect: true,
          cursor: 'pointer',

          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.1f} % ({point.time})'
          },
          showInLegend: true
        }
      },
      series: [{
        name: 'Hours',
        colorByPoint: true,
        data: [{
          name: 'Billable',
          y: this.billable,
          color: '#ff6e40',
          sliced: true,
          selected: true,
          // time: this.billable_time
          time: this.millisecondsToStr(this.billable)
        }, {
          name: 'Non Billable',
          color: '#6FB2D2',
          y: this.non_billable,
          // time: this.non_billable_time
          time: this.millisecondsToStr(this.non_billable)
        }]
      }]
    }
    return this.options;
  }

  setMonthlychartoption() {
    this.options = {
      chart: {
        type: 'column'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Current Month Billable/Non Billable Hours Based On Projects',
        style: {
          fontSize: '16px'
        }
      },
      xAxis: {
        categories: this.monthChartProjects,
        crosshair: true
      },
      yAxis: {
        title: {
          useHTML: true,
          text: 'Hours'
          // text: 'Million tonnes CO<sub>2</sub>-equivalents'
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:.1f}Hrs</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        },
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y:.1f}Hrs',
          }
        }
      },
      series: [{
        name: 'Billable',
        color: '#ff6e40',
        data: this.monthChartBillable

      }, {
        name: 'Non Billable',
        color: '#6FB2D2',
        data: this.monthChartNonBillable
      }]
    }
    return this.options;
  }

  millisecondsToStr(milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    var value = "";

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    if (years) {
      // value+= years + ' year' + this.numberEnding(years);
      value += years + ' year ';
    }
    //TODO: Months! Maybe weeks? 
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
      // value+=  days + ' day ' + this.numberEnding(days);
      value += days + ' day ';
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
      // value+=  hours + ' hour ' + this.numberEnding(hours);
      value += hours + ' hours ';
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
      // value+= minutes + ' minute ' + this.numberEnding(minutes);
      value += minutes + ' minutes ';
    }
    var seconds = temp % 60;
    if (seconds) {
      // value+= seconds + ' second' + this.numberEnding(seconds);
      value += seconds + ' seconds';
      // console.log(seconds );
    }
    if (value == "") {
      value = 'less than a second'  //'just now' //or other string you like;
    }
    return value;
  }

  millisToMinutesAndSeconds(ms) {
    var minutes: any = Math.floor((ms / (1000 * 60)) % 60);
    var hours: any = Math.floor((ms / (1000 * 60 * 60)) % 24);
    // hours = (hours < 10) ? + 0 + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    var days: any = Math.floor((ms / (1000 * 60 * 60 * 24)));
    if (days > 0) {
      hours = (days * 24) + hours;
    }
    let str: string = hours + "." + minutes;
    let tempHrs: Number = parseFloat(str);
    return tempHrs;
  }
}
