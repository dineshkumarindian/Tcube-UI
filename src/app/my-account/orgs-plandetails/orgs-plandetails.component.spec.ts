import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgsPlandetailsComponent } from './orgs-plandetails.component';

describe('OrgsPlandetailsComponent', () => {
  let component: OrgsPlandetailsComponent;
  let fixture: ComponentFixture<OrgsPlandetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgsPlandetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgsPlandetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
