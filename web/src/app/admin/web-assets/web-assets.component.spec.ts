import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebAssetsComponent } from './web-assets.component';

describe('WebAssetsComponent', () => {
  let component: WebAssetsComponent;
  let fixture: ComponentFixture<WebAssetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebAssetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
