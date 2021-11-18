import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VShowGalleryComponent } from './v-show-gallery.component';

describe('VShowGalleryComponent', () => {
  let component: VShowGalleryComponent;
  let fixture: ComponentFixture<VShowGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VShowGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VShowGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
