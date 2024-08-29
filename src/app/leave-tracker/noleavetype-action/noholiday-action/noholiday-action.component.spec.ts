import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoholidayActionComponent } from './noholiday-action.component';

describe('NoholidayActionComponent', () => {
  let component: NoholidayActionComponent;
  let fixture: ComponentFixture<NoholidayActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoholidayActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoholidayActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
