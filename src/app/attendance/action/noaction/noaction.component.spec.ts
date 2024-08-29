import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoactionComponent } from './noaction.component';

describe('NoactionComponent', () => {
  let component: NoactionComponent;
  let fixture: ComponentFixture<NoactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
