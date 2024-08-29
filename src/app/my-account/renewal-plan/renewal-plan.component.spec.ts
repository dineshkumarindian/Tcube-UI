import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalPlanComponent } from './renewal-plan.component';

describe('RenewalPlanComponent', () => {
  let component: RenewalPlanComponent;
  let fixture: ComponentFixture<RenewalPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenewalPlanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenewalPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
