import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelogSubmitComponent } from './timelog-submit.component';

describe('TimelogSubmitComponent', () => {
  let component: TimelogSubmitComponent;
  let fixture: ComponentFixture<TimelogSubmitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelogSubmitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelogSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
