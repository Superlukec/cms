import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertHtmlComponent } from './insert-html.component';

describe('InsertHtmlComponent', () => {
  let component: InsertHtmlComponent;
  let fixture: ComponentFixture<InsertHtmlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertHtmlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
