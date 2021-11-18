import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewShareableComponent } from './new-shareable.component';

describe('NewShareableComponent', () => {
  let component: NewShareableComponent;
  let fixture: ComponentFixture<NewShareableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewShareableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewShareableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
