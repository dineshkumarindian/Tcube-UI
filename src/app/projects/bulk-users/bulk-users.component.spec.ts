import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUsersComponent } from './bulk-users.component';

describe('BulkUsersComponent', () => {
  let component: BulkUsersComponent;
  let fixture: ComponentFixture<BulkUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
