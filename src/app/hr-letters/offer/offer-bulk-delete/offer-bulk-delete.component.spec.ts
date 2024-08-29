import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferBulkDeleteComponent } from './offer-bulk-delete.component';

describe('OfferBulkDeleteComponent', () => {
  let component: OfferBulkDeleteComponent;
  let fixture: ComponentFixture<OfferBulkDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfferBulkDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferBulkDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
