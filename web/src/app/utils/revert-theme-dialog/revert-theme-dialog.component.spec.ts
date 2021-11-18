import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevertThemeDialogComponent } from './revert-theme-dialog.component';

describe('RevertThemeDialogComponent', () => {
  let component: RevertThemeDialogComponent;
  let fixture: ComponentFixture<RevertThemeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevertThemeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevertThemeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
