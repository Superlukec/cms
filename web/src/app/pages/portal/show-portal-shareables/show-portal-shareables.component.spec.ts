import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPortalShareablesComponent } from './show-portal-shareables.component';

describe('ShowPortalShareablesComponent', () => {
  let component: ShowPortalShareablesComponent;
  let fixture: ComponentFixture<ShowPortalShareablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowPortalShareablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowPortalShareablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
