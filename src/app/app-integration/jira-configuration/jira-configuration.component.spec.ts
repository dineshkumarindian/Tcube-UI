import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraConfigurationComponent } from './jira-configuration.component';

describe('JiraConfigurationComponent', () => {
  let component: JiraConfigurationComponent;
  let fixture: ComponentFixture<JiraConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JiraConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
