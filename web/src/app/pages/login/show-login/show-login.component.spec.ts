import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowLoginComponent } from './show-login.component';

describe('ShowLoginComponent', () => {
  let component: ShowLoginComponent;
  let fixture: ComponentFixture<ShowLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
