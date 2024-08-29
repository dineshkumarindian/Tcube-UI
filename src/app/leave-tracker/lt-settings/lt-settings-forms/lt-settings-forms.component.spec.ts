import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LtSettingsFormsComponent } from './lt-settings-forms.component';

describe('LtSettingsFormsComponent', () => {
  let component: LtSettingsFormsComponent;
  let fixture: ComponentFixture<LtSettingsFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LtSettingsFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LtSettingsFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
