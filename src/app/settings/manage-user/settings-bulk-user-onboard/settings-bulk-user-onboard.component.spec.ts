import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsBulkUserOnBoardComponent } from './settings-bulk-user-onboard.component';

describe('SettingsImportBulkUserComponent', () => {
  let component: SettingsBulkUserOnBoardComponent;
  let fixture: ComponentFixture<SettingsBulkUserOnBoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsBulkUserOnBoardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsBulkUserOnBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
