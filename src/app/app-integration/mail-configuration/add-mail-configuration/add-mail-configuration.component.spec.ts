import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMailConfigurationComponent } from './add-mail-configuration.component';

describe('AddMailConfigurationComponent', () => {
  let component: AddMailConfigurationComponent;
  let fixture: ComponentFixture<AddMailConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMailConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMailConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
