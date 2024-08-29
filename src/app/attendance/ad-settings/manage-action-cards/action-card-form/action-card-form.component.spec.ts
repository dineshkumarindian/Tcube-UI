import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionCardFormComponent } from './action-card-form.component';

describe('ActionCardFormComponent', () => {
  let component: ActionCardFormComponent;
  let fixture: ComponentFixture<ActionCardFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionCardFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionCardFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
