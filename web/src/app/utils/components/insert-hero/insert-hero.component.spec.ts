import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertHeroComponent } from './insert-hero.component';

describe('InsertHeroComponent', () => {
  let component: InsertHeroComponent;
  let fixture: ComponentFixture<InsertHeroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertHeroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
