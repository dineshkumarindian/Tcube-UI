import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageActionCardsComponent } from './manage-action-cards.component';

describe('ManageActionCardsComponent', () => {
  let component: ManageActionCardsComponent;
  let fixture: ComponentFixture<ManageActionCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageActionCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageActionCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
