import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffDayplannerListComponent } from './staff-dayplanner-list.component';

describe('StaffDayplannerListComponent', () => {
  let component: StaffDayplannerListComponent;
  let fixture: ComponentFixture<StaffDayplannerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffDayplannerListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffDayplannerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
