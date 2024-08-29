import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-add-backlogs',
  templateUrl: './add-backlogs.component.html',
  styleUrls: ['./add-backlogs.component.less']
})
export class AddBacklogsComponent implements OnInit {
  // addTaskForm: FormGroup;
  maxDate = new Date();
  /** list of project */
  project: any[] = [];
  /** list of issue type */
  issueType: any[] = [];

  /** list of assignee */
  assignee: any[] = [];

  labels:any[] = [];

  priority:any[] = [];

  reporter:any[] = [];
  public editorData = '';
  ckconfig = {};
  public model = {
    editorData: ''
  };
  description = new UntypedFormControl('', [Validators.required, Validators.maxLength(2000)]);

  constructor(private formBuilder: UntypedFormBuilder,) { }

  ngOnInit() {
    
  }
  addTaskForm:UntypedFormGroup = this.formBuilder.group({
    project: ['', Validators.required],
    issuetype: ['', Validators.required],
    tasks: ['', Validators.required],
    assignee: ['',Validators.required],
    label: ['',Validators.required],
    priority: ['',Validators.required],
    reporter: ['',Validators.required],
    duedate: ['']
  })
  public onReady(editor: any) {
    // editor.ui.view.editable.element.style.line_height = "1px";
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }

  @Output()
  open: EventEmitter<any> = new EventEmitter();
  Editor = ClassicEditor;

  /** control for the MatSelect filter keyword */
  public projectFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of project filtered by search keyword */
  public filteredproject: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the MatSelect filter keyword */
  public issueTypeFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of issuetype filtered by search keyword */
  public filteredissuetype: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the MatSelect filter keyword */
  public assigneeFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of assignee filtered by search keyword */
  public filteredassignee: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  /** control for the MatSelect filter keyword */
  public labelFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of label filtered by search keyword */
  public filteredlabel: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  /** control for the MatSelect filter keyword */
  public priorityFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of priority filtered by search keyword */
  public filteredpriority: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    /** control for the MatSelect filter keyword */
    public reporterFilterCtrl: UntypedFormControl = new UntypedFormControl();

    /** list of reporter filtered by search keyword */
    public filteredreporter: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
}
