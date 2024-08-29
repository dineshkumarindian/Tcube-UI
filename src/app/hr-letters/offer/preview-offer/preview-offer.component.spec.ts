import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewOfferComponent } from './preview-offer.component';

describe('PreviewOfferComponent', () => {
  let component: PreviewOfferComponent;
  let fixture: ComponentFixture<PreviewOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
