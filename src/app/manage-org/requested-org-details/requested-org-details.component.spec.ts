import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestedOrgDetailsComponent } from './requested-org-details.component';

describe('RequestedOrgDetailsComponent', () => {
  let component: RequestedOrgDetailsComponent;
  let fixture: ComponentFixture<RequestedOrgDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestedOrgDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestedOrgDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
