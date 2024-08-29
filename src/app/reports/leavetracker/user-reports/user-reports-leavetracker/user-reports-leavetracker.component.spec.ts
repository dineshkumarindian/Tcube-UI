import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReportsLeavetrackerComponent } from './user-reports-leavetracker.component';

describe('UserReportsLeavetrackerComponent', () => {
  let component: UserReportsLeavetrackerComponent;
  let fixture: ComponentFixture<UserReportsLeavetrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserReportsLeavetrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserReportsLeavetrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
