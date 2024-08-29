import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrgDetailsComponent } from './view-org-details.component';

describe('ViewOrgDetailsComponent', () => {
  let component: ViewOrgDetailsComponent;
  let fixture: ComponentFixture<ViewOrgDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewOrgDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewOrgDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
