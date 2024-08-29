import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsBulkActiveDeactiveComponent } from './settings-bulk-active-deactive.component';

describe('SettingsBulkActiveDeactiveComponent', () => {
  let component: SettingsBulkActiveDeactiveComponent;
  let fixture: ComponentFixture<SettingsBulkActiveDeactiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsBulkActiveDeactiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsBulkActiveDeactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
