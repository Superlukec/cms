import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddImageSizeDialogComponent } from './add-image-size-dialog.component';

describe('AddImageSizeDialogComponent', () => {
  let component: AddImageSizeDialogComponent;
  let fixture: ComponentFixture<AddImageSizeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddImageSizeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddImageSizeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
