import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFilterComponentsDialogComponent } from './add-filter-components-dialog.component';

describe('AddFilterComponentsDialogComponent', () => {
  let component: AddFilterComponentsDialogComponent;
  let fixture: ComponentFixture<AddFilterComponentsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFilterComponentsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFilterComponentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
