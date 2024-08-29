import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgDeleteComponent } from './org-delete.component';

describe('OrgDeleteComponent', () => {
  let component: OrgDeleteComponent;
  let fixture: ComponentFixture<OrgDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
