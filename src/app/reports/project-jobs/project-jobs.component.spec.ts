import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectJobsComponent } from './project-jobs.component';

describe('ProjectJobsComponent', () => {
  let component: ProjectJobsComponent;
  let fixture: ComponentFixture<ProjectJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectJobsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
