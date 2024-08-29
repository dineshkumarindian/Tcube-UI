import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraFormComponent } from './jira-form.component';

describe('JiraFormComponent', () => {
  let component: JiraFormComponent;
  let fixture: ComponentFixture<JiraFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JiraFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
