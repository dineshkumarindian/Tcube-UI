import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageClientDetailsComponent } from './manage-client-details.component';

describe('ManageClientDetailsComponent', () => {
  let component: ManageClientDetailsComponent;
  let fixture: ComponentFixture<ManageClientDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageClientDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageClientDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
