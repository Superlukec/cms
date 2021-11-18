import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashShowQuickStatsComponent } from './dash-show-quick-stats.component';

describe('DashShowQuickStatsComponent', () => {
  let component: DashShowQuickStatsComponent;
  let fixture: ComponentFixture<DashShowQuickStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashShowQuickStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashShowQuickStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
