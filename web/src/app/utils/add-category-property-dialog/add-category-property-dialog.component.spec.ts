import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCategoryPropertyDialogComponent } from './add-category-property-dialog.component';

describe('AddCategoryPropertyDialogComponent', () => {
  let component: AddCategoryPropertyDialogComponent;
  let fixture: ComponentFixture<AddCategoryPropertyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCategoryPropertyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCategoryPropertyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
