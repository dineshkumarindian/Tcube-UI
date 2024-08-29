import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationDocumentationComponent } from './integration-documentation.component';

describe('IntegrationDocumentationComponent', () => {
  let component: IntegrationDocumentationComponent;
  let fixture: ComponentFixture<IntegrationDocumentationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationDocumentationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
