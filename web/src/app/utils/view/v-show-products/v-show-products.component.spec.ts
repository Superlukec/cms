import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VShowProductsComponent } from './v-show-products.component';

describe('VShowProductsComponent', () => {
  let component: VShowProductsComponent;
  let fixture: ComponentFixture<VShowProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VShowProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VShowProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
