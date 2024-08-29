import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DpSettingsComponent } from './dp-settings.component';

describe('DpSettingsComponent', () => {
  let component: DpSettingsComponent;
  let fixture: ComponentFixture<DpSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DpSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DpSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
