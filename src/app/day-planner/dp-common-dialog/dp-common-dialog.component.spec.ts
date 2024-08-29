import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DpCommonDialogComponent } from './dp-common-dialog.component';

describe('DpCommonDialogComponent', () => {
  let component: DpCommonDialogComponent;
  let fixture: ComponentFixture<DpCommonDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DpCommonDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DpCommonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
