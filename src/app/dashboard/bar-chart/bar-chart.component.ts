import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { TimeTrackerService } from 'src/app/services/time-tracker.service';
declare var google:any;

@Component({
  selector: 'bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.less']
})
export class BarChartComponent implements OnInit {
  // options: any;
  // billable: number = 0;
  // non_billable: number = 0;
  static chart: any;
  constructor( private timetrackerservice: TimeTrackerService,) { }

  ngOnInit() {
    google.charts.load('current', {packages: ['corechart','bar']});
    google.charts.setOnLoadCallback(this.setchartoption);

    // let formdata = {
    //   // "projectname": localStorage.getItem("Id"),
    //   "startdate": moment().format("01-MM-YYYY"),
    //   "enddate": moment().daysInMonth() + moment().format("-MM-YYYY"),
    // }

    // this.timetrackerservice.getbillingchartmonths(formdata).subscribe(data => {
    //   if (data.map.statusMessage == "Success") {
    //     let response: any = data.map.data.map;
    //     this.billable = Number(response.billable_time);
    //     this.non_billable = Number(response.non_billable_time);
    //     console.log(response);
    //   }

    //   setTimeout(() => {
    //     BarChartComponent.chart('bill_status', this.setchartoption());

    //   }, 1000);
    // })
  }
  //Bar chart
  setchartoption(){
    var data = google.visualization.arrayToDataTable([
      ['project name', 'Billable hours',{ role:"style"},{ role: 'annotation' }, 'Non-Billable hours',{ role:"style"},{ role: 'annotation' }],
      ['Project 1', 8,'color:#85C88A','Billable Hours', 1, 'color:#6FB2D2','Non-Billable Hours'],
      ['Project 2', 3,'color:#85C88A','Billable Hours', 1, 'color:#6FB2D2','Non-Billable Hours'],
      ['Project 3', 9,'color:#85C88A','Billable Hours', 3, "#6FB2D2",'Non-Billable Hours'],
      ['Project 4', 7,'color:#85C88A','Billable Hours', 0.5, "#6FB2D2",'Non-Billable Hours']
    ]);

    var options={
      'is3D':true,
      'width':700,
      'height':430,
     
      title:'Current Month Billable/Non Billable Status',
      // chartArea: {width: '50%'},
        hAxis: {
          title: 'Hours',
          minValue: 0,
        },
        series: {
          0: {color: '#85C88A'},
          1:{color: '#6FB2D2' },
        } ,
      vAxis: {
        title: 'Project Name',
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
          size: '200px',
          allowPointSelect: true,
          cursor: 'pointer',

          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.1f} % ({point.time})'
          },
          showInLegend: true
        }
      },
    }
    var chart = new google.visualization.BarChart(document.getElementById("divBarChart"));
    chart.draw(data, options);
  }

} 