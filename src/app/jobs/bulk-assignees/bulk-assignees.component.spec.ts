import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkAssigneesComponent } from './bulk-assignees.component';

describe('BulkAssigneesComponent', () => {
  let component: BulkAssigneesComponent;
  let fixture: ComponentFixture<BulkAssigneesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkAssigneesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkAssigneesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
