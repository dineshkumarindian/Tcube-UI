import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserCountsComponent } from './view-user-counts.component';

describe('ViewUserCountsComponent', () => {
  let component: ViewUserCountsComponent;
  let fixture: ComponentFixture<ViewUserCountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewUserCountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUserCountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
