import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowShareableUsersComponent } from './show-shareable-users.component';

describe('ShowShareableUsersComponent', () => {
  let component: ShowShareableUsersComponent;
  let fixture: ComponentFixture<ShowShareableUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowShareableUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowShareableUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
