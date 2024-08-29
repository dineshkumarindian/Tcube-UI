import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NextPreviousYearRequestsComponent } from './next-previous-year-requests.component';

describe('NextPreviousYearRequestsComponent', () => {
  let component: NextPreviousYearRequestsComponent;
  let fixture: ComponentFixture<NextPreviousYearRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NextPreviousYearRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NextPreviousYearRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
