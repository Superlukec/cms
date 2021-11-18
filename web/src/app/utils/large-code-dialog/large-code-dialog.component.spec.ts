import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LargeCodeDialogComponent } from './large-code-dialog.component';

describe('LargeCodeDialogComponent', () => {
  let component: LargeCodeDialogComponent;
  let fixture: ComponentFixture<LargeCodeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LargeCodeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LargeCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
