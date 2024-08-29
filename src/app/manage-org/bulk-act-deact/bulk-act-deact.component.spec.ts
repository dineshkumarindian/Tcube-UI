import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkActDeactComponent } from './bulk-act-deact.component';

describe('BulkActDeactComponent', () => {
  let component: BulkActDeactComponent;
  let fixture: ComponentFixture<BulkActDeactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkActDeactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkActDeactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
