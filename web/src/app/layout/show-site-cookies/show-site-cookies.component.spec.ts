import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowSiteCookiesComponent } from './show-site-cookies.component';

describe('ShowSiteCookiesComponent', () => {
  let component: ShowSiteCookiesComponent;
  let fixture: ComponentFixture<ShowSiteCookiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowSiteCookiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowSiteCookiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
