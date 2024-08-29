import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWorkingDaysComponent } from './add-working-days.component';

describe('AddWorkingDaysComponent', () => {
  let component: AddWorkingDaysComponent;
  let fixture: ComponentFixture<AddWorkingDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddWorkingDaysComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWorkingDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
