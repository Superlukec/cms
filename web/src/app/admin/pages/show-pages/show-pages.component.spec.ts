import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPagesComponent } from './show-pages.component';

describe('ShowPagesComponent', () => {
  let component: ShowPagesComponent;
  let fixture: ComponentFixture<ShowPagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowPagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
