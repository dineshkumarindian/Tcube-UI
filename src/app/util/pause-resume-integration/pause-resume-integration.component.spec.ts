import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PauseResumeIntegrationComponent } from './pause-resume-integration.component';

describe('PauseResumeIntegrationComponent', () => {
  let component: PauseResumeIntegrationComponent;
  let fixture: ComponentFixture<PauseResumeIntegrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PauseResumeIntegrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PauseResumeIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
