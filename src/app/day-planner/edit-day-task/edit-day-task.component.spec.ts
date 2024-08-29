import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDayTaskComponent } from './edit-day-task.component';

describe('EditDayTaskComponent', () => {
  let component: EditDayTaskComponent;
  let fixture: ComponentFixture<EditDayTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDayTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDayTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
