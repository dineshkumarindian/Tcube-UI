import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateClientUserComponent } from './activate-client-user.component';

describe('ActivateClientUserComponent', () => {
  let component: ActivateClientUserComponent;
  let fixture: ComponentFixture<ActivateClientUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateClientUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateClientUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
