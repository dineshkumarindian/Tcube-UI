import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCommonDialogComponent } from './register-common-dialog.component';

describe('RegisterCommonDialogComponent', () => {
  let component: RegisterCommonDialogComponent;
  let fixture: ComponentFixture<RegisterCommonDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterCommonDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterCommonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
