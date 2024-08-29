import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AddBacklogsComponent } from './add-backlogs/add-backlogs.component';

interface backlogdata {
  issuetype: string;
  project: string;
  summary: string;
  labels: string;
  priority: string;
  assignee: string;
  reporter: string;
  status: string;
  duedate: string;
  children?: backlogdata[];
}

const TREE_DATA: backlogdata[] = [
  {
    issuetype: 'Bug',
    project: 'Tcube',
    summary: 'Attendance -> Notification issue',
    labels: 'UI',
    priority: 'Highest',
    assignee: 'HK',
    reporter: 'RA',
    status: 'In progress',
    duedate: '01-12-2022',
    children: [
      {
        issuetype: 'Task',
        project: 'Tcube',
        summary: 'Attendance -> Notification issue after tasks submitted there is notification the manager',
        labels: 'UI',
        priority: 'High',
        assignee: 'HK',
        reporter: 'RA',
        status: 'To do',
        duedate: '01-12-2022',
        children: [
          {
            issuetype: 'Bug',
            project: 'Tcube',
            summary: 'Attendance -> Notification issue',
            labels: 'UI',
            priority: 'Medium',
            assignee: 'HK',
            reporter: 'RA',
            status: 'Done',
            duedate: '01-12-2022'
          },
        ]
      },
    ]
  }, {
    issuetype: 'Bug',
    project: 'Tcube',
    summary: 'Time trakcer -> Notification issue --> after tasks submitted there is notification the manager',
    labels: 'UI',
    priority: 'Low',
    assignee: 'HK',
    reporter: 'RA',
    status: 'To do',
    duedate: '01-12-2022'
  },
];

interface ExampleFlatNode {
  expandable: boolean;
  issuetype: string;
  project: string;
  summary: string;
  labels: string;
  priority: string;
  assignee: string;
  reporter: string;
  status: string;
  duedate: string;
  level: number;
}

@Component({
  selector: 'app-backlogs',
  templateUrl: './backlogs.component.html',
  styleUrls: ['./backlogs.component.less']
})
export class BacklogsComponent implements OnInit {

  displayedColumns: string[] = ['issuetype', 'project','summary','labels','priority','assignee','reporter','status','duedate','actions'];

  private transformer = (node: backlogdata, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      issuetype: node.issuetype,
      project: node.project,
      summary: node.summary,
      labels: node.labels,
      priority: node.priority,
      assignee: node.assignee,
      reporter: node.reporter,
      status: node.status,
      duedate: node.duedate,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level,
    node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    public matDialog: MatDialog,
  ) {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  ngOnInit() {
  }

  addTask(){
      const dialogRef = this.matDialog.open(AddBacklogsComponent,
        {
          width: '750px',
          panelClass: 'custom-dialogstyle'
        }
      );
  
      dialogRef.afterClosed().subscribe(result => {
      });
  }
}
