import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveSectionComponent } from './leave-section.component';

describe('LeaveSectionComponent', () => {
  let component: LeaveSectionComponent;
  let fixture: ComponentFixture<LeaveSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaveSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
