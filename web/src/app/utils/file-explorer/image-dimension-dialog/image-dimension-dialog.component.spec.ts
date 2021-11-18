import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDimensionDialogComponent } from './image-dimension-dialog.component';

describe('ImageDimensionDialogComponent', () => {
  let component: ImageDimensionDialogComponent;
  let fixture: ComponentFixture<ImageDimensionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageDimensionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageDimensionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
