import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeactivateOrgComponent } from './deactivate-org.component';

describe('DeactivateOrgComponent', () => {
  let component: DeactivateOrgComponent;
  let fixture: ComponentFixture<DeactivateOrgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeactivateOrgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeactivateOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
