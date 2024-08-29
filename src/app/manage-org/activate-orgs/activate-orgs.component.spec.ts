import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateOrgsComponent } from './activate-orgs.component';

describe('ActivateOrgsComponent', () => {
  let component: ActivateOrgsComponent;
  let fixture: ComponentFixture<ActivateOrgsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateOrgsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateOrgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
