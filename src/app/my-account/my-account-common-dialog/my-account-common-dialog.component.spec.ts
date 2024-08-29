import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAccountCommonDialogComponent } from './my-account-common-dialog.component';

describe('MyAccountCommonDialogComponent', () => {
  let component: MyAccountCommonDialogComponent;
  let fixture: ComponentFixture<MyAccountCommonDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyAccountCommonDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAccountCommonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
