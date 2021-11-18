import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPageMenuComponent } from './add-page-menu.component';

describe('AddPageMenuComponent', () => {
  let component: AddPageMenuComponent;
  let fixture: ComponentFixture<AddPageMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPageMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPageMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
