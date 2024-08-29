import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlackConfigurationComponent } from './slack-configuration.component';

describe('SlackConfigurationComponent', () => {
  let component: SlackConfigurationComponent;
  let fixture: ComponentFixture<SlackConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlackConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlackConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
