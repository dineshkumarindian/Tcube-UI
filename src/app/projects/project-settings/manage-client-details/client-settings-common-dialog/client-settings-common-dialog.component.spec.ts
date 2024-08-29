import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSettingsCommonDialogComponent } from './client-settings-common-dialog.component';

describe('ClientSettingsCommonDialogComponent', () => {
  let component: ClientSettingsCommonDialogComponent;
  let fixture: ComponentFixture<ClientSettingsCommonDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientSettingsCommonDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientSettingsCommonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
