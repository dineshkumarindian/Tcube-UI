import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoleavetypeActionComponent } from './noleavetype-action.component';

describe('NoleavetypeActionComponent', () => {
  let component: NoleavetypeActionComponent;
  let fixture: ComponentFixture<NoleavetypeActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoleavetypeActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoleavetypeActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
