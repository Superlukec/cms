import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowGoogleMapsComponent } from './show-google-maps.component';

describe('ShowGoogleMapsComponent', () => {
  let component: ShowGoogleMapsComponent;
  let fixture: ComponentFixture<ShowGoogleMapsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowGoogleMapsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowGoogleMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
