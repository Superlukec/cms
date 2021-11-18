import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShareablesComponent } from './view-shareables.component';

describe('ViewShareablesComponent', () => {
  let component: ViewShareablesComponent;
  let fixture: ComponentFixture<ViewShareablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewShareablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewShareablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
