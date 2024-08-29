import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpSettingsComponent } from './cp-settings.component';

describe('CpSettingsComponent', () => {
  let component: CpSettingsComponent;
  let fixture: ComponentFixture<CpSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
