import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelLeaveComponent } from './cancel-leave.component';

describe('CancelLeaveComponent', () => {
  let component: CancelLeaveComponent;
  let fixture: ComponentFixture<CancelLeaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelLeaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
