import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBacklogsComponent } from './add-backlogs.component';

describe('AddBacklogsComponent', () => {
  let component: AddBacklogsComponent;
  let fixture: ComponentFixture<AddBacklogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBacklogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBacklogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
