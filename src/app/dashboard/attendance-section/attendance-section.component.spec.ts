import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceSectionComponent } from './attendance-section.component';

describe('AttendanceSectionComponent', () => {
  let component: AttendanceSectionComponent;
  let fixture: ComponentFixture<AttendanceSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
