import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLeavetypeDialogComponent } from './view-leavetype-dialog.component';

describe('ViewLeavetypeDialogComponent', () => {
  let component: ViewLeavetypeDialogComponent;
  let fixture: ComponentFixture<ViewLeavetypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewLeavetypeDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewLeavetypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
