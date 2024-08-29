import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSuccessPageComponent } from './payment-success-page.component';

describe('PaymentSuccessPageComponent', () => {
  let component: PaymentSuccessPageComponent;
  let fixture: ComponentFixture<PaymentSuccessPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentSuccessPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentSuccessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
