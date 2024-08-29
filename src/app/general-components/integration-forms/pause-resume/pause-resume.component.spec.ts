import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PauseResumeComponent } from './pause-resume.component';

describe('PauseResumeComponent', () => {
  let component: PauseResumeComponent;
  let fixture: ComponentFixture<PauseResumeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PauseResumeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PauseResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
