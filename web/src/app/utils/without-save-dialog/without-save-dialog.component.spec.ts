import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithoutSaveDialogComponent } from './without-save-dialog.component';

describe('WithoutSaveDialogComponent', () => {
  let component: WithoutSaveDialogComponent;
  let fixture: ComponentFixture<WithoutSaveDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithoutSaveDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithoutSaveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
