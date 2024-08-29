import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReleaseComponent } from './view-release.component';

describe('ViewReleaseComponent', () => {
  let component: ViewReleaseComponent;
  let fixture: ComponentFixture<ViewReleaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewReleaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
