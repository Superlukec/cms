import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCategoryPropertiesDialogComponent } from './show-category-properties-dialog.component';

describe('ShowCategoryPropertiesDialogComponent', () => {
  let component: ShowCategoryPropertiesDialogComponent;
  let fixture: ComponentFixture<ShowCategoryPropertiesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowCategoryPropertiesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowCategoryPropertiesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
