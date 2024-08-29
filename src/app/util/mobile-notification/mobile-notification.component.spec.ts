import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileNotificationComponent } from './mobile-notification.component';

describe('MobileNotificationComponent', () => {
  let component: MobileNotificationComponent;
  let fixture: ComponentFixture<MobileNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
