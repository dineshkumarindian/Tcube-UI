import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewNotesComponent } from './preview-notes.component';

describe('PreviewNotesComponent', () => {
  let component: PreviewNotesComponent;
  let fixture: ComponentFixture<PreviewNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
