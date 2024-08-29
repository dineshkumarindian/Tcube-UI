import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewLetterComponent } from './preview-letter.component';

describe('PreviewLetterComponent', () => {
  let component: PreviewLetterComponent;
  let fixture: ComponentFixture<PreviewLetterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewLetterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
