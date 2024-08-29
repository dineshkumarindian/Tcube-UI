import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonReminderDialogComponent } from './common-reminder-dialog.component';

describe('CommonReminderDialogComponent', () => {
  let component: CommonReminderDialogComponent;
  let fixture: ComponentFixture<CommonReminderDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonReminderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonReminderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
