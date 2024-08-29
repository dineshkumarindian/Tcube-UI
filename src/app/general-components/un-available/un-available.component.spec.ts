import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnAvailableComponent } from './un-available.component';

describe('UnAvailableComponent', () => {
  let component: UnAvailableComponent;
  let fixture: ComponentFixture<UnAvailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnAvailableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
