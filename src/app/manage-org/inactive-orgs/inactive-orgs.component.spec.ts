import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveOrgsComponent } from './inactive-orgs.component';

describe('InactiveOrgsComponent', () => {
  let component: InactiveOrgsComponent;
  let fixture: ComponentFixture<InactiveOrgsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InactiveOrgsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InactiveOrgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
