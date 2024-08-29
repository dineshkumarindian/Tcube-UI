import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRelaseDialogComponent } from './update-relase-dialog.component';

describe('UpdateRelaseDialogComponent', () => {
  let component: UpdateRelaseDialogComponent;
  let fixture: ComponentFixture<UpdateRelaseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateRelaseDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateRelaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
