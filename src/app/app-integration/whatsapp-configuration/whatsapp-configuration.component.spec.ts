import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappConfigurationComponent } from './whatsapp-configuration.component';

describe('WhatsappConfigurationComponent', () => {
  let component: WhatsappConfigurationComponent;
  let fixture: ComponentFixture<WhatsappConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhatsappConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
