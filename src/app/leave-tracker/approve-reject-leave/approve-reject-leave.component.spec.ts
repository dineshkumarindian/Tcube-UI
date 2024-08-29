import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveRejectLeaveComponent } from './approve-reject-leave.component';

describe('ApproveRejectLeaveComponent', () => {
  let component: ApproveRejectLeaveComponent;
  let fixture: ComponentFixture<ApproveRejectLeaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveRejectLeaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveRejectLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
