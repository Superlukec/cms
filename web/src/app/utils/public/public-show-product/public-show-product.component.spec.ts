import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicShowProductComponent } from './public-show-product.component';

describe('PublicShowProductComponent', () => {
  let component: PublicShowProductComponent;
  let fixture: ComponentFixture<PublicShowProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicShowProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicShowProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
