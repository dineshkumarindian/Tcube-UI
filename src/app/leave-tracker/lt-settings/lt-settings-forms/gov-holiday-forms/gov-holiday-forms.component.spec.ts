import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GovHolidayFormsComponent } from './gov-holiday-forms.component';

describe('GovHolidayFormsComponent', () => {
  let component: GovHolidayFormsComponent;
  let fixture: ComponentFixture<GovHolidayFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GovHolidayFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GovHolidayFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
