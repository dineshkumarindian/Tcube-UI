import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskBulkDeleteComponent } from './task-bulk-delete.component';

describe('TaskBulkDeleteComponent', () => {
  let component: TaskBulkDeleteComponent;
  let fixture: ComponentFixture<TaskBulkDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskBulkDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskBulkDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
