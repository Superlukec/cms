import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicShowMenuChildrenComponent } from './public-show-menu-children.component';

describe('PublicShowMenuChildrenComponent', () => {
  let component: PublicShowMenuChildrenComponent;
  let fixture: ComponentFixture<PublicShowMenuChildrenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicShowMenuChildrenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicShowMenuChildrenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
