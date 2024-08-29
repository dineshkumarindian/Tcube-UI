import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectJobTimeSectionComponent } from './project-job-time-section.component';

describe('ProjectJobTimeSectionComponent', () => {
  let component: ProjectJobTimeSectionComponent;
  let fixture: ComponentFixture<ProjectJobTimeSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectJobTimeSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectJobTimeSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
