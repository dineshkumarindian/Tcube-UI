import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishNotesComponent } from './publish-notes.component';

describe('PublishNotesComponent', () => {
  let component: PublishNotesComponent;
  let fixture: ComponentFixture<PublishNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublishNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
