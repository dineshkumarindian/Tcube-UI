import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteInternshipComponent } from './delete-internship.component';

describe('DeleteInternshipComponent', () => {
  let component: DeleteInternshipComponent;
  let fixture: ComponentFixture<DeleteInternshipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteInternshipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteInternshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
