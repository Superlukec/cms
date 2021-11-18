import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFormElementDialogComponent } from './new-form-element-dialog.component';

describe('NewFormElementDialogComponent', () => {
  let component: NewFormElementDialogComponent;
  let fixture: ComponentFixture<NewFormElementDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewFormElementDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFormElementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
