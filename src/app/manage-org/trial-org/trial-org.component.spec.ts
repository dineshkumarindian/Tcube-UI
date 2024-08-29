import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialOrgComponent } from './trial-org.component';

describe('TrialOrgComponent', () => {
  let component: TrialOrgComponent;
  let fixture: ComponentFixture<TrialOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrialOrgComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrialOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
