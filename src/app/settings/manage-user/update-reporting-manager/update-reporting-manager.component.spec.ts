import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateReportingManagerComponent } from './update-reporting-manager.component';

describe('UpdateReportingManagerComponent', () => {
  let component: UpdateReportingManagerComponent;
  let fixture: ComponentFixture<UpdateReportingManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateReportingManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateReportingManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
