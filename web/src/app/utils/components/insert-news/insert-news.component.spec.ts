import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertNewsComponent } from './insert-news.component';

describe('InsertNewsComponent', () => {
  let component: InsertNewsComponent;
  let fixture: ComponentFixture<InsertNewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertNewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
