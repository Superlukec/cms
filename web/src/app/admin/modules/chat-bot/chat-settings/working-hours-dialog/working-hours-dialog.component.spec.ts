import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingHoursDialogComponent } from './working-hours-dialog.component';

describe('WorkingHoursDialogComponent', () => {
  let component: WorkingHoursDialogComponent;
  let fixture: ComponentFixture<WorkingHoursDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkingHoursDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingHoursDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
