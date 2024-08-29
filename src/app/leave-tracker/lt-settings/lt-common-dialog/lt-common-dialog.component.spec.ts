import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LtCommonDialogComponent } from './lt-common-dialog.component';

describe('LtCommonDialogComponent', () => {
  let component: LtCommonDialogComponent;
  let fixture: ComponentFixture<LtCommonDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LtCommonDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LtCommonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
