import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDesignationComponent } from './manage-designation.component';

describe('ManageDesignationComponent', () => {
  let component: ManageDesignationComponent;
  let fixture: ComponentFixture<ManageDesignationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageDesignationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageDesignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
