import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LtSettingsComponent } from './lt-settings.component';

describe('LtSettingsComponent', () => {
  let component: LtSettingsComponent;
  let fixture: ComponentFixture<LtSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LtSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LtSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
