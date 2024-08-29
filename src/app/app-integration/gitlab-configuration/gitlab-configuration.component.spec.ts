import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GitlabConfigurationComponent } from './gitlab-configuration.component';

describe('GitlabConfigurationComponent', () => {
  let component: GitlabConfigurationComponent;
  let fixture: ComponentFixture<GitlabConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GitlabConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GitlabConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
