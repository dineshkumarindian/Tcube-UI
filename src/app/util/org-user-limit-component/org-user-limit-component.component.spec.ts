import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgUserLimitComponentComponent } from './org-user-limit-component.component';

describe('OrgUserLimitComponentComponent', () => {
  let component: OrgUserLimitComponentComponent;
  let fixture: ComponentFixture<OrgUserLimitComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgUserLimitComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgUserLimitComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
