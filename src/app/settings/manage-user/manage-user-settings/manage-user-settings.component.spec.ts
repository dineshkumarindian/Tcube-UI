import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUserSettingsComponent } from './manage-user-settings.component';

describe('ManageUserSettingsComponent', () => {
  let component: ManageUserSettingsComponent;
  let fixture: ComponentFixture<ManageUserSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageUserSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUserSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
