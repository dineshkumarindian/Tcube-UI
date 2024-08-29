import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientFormComponent } from './add-client-form.component';

describe('AddClientFormComponent', () => {
  let component: AddClientFormComponent;
  let fixture: ComponentFixture<AddClientFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddClientFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
