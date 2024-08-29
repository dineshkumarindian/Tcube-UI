import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIntegrationComponent } from './view-integration.component';

describe('ViewIntegrationComponent', () => {
  let component: ViewIntegrationComponent;
  let fixture: ComponentFixture<ViewIntegrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewIntegrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
