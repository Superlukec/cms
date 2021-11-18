import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPortalSpecificShareableComponent } from './show-portal-specific-shareable.component';

describe('ShowPortalSpecificShareableComponent', () => {
  let component: ShowPortalSpecificShareableComponent;
  let fixture: ComponentFixture<ShowPortalSpecificShareableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowPortalSpecificShareableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowPortalSpecificShareableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
