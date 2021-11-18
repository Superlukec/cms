import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VShowNewsComponent } from './v-show-news.component';

describe('VShowNewsComponent', () => {
  let component: VShowNewsComponent;
  let fixture: ComponentFixture<VShowNewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VShowNewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VShowNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
