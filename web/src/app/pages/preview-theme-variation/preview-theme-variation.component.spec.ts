import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewThemeVariationComponent } from './preview-theme-variation.component';

describe('PreviewThemeVariationComponent', () => {
  let component: PreviewThemeVariationComponent;
  let fixture: ComponentFixture<PreviewThemeVariationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewThemeVariationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewThemeVariationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
