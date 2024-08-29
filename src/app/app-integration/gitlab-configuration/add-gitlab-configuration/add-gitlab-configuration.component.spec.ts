import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGitlabConfigurationComponent } from './add-gitlab-configuration.component';

describe('AddGitlabConfigurationComponent', () => {
  let component: AddGitlabConfigurationComponent;
  let fixture: ComponentFixture<AddGitlabConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGitlabConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGitlabConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
