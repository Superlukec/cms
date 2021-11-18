import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleMapsCompComponent } from './google-maps-comp.component';

describe('GoogleMapsCompComponent', () => {
  let component: GoogleMapsCompComponent;
  let fixture: ComponentFixture<GoogleMapsCompComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoogleMapsCompComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleMapsCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
