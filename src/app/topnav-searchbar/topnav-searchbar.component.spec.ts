import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopnavSearchbarComponent } from './topnav-searchbar.component';

describe('TopnavSearchbarComponent', () => {
  let component: TopnavSearchbarComponent;
  let fixture: ComponentFixture<TopnavSearchbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopnavSearchbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopnavSearchbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
