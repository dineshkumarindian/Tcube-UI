import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsBulkDeleteComponent } from './settings-bulk-delete.component';

describe('SettingsBulkDeleteComponent', () => {
  let component: SettingsBulkDeleteComponent;
  let fixture: ComponentFixture<SettingsBulkDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsBulkDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsBulkDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
