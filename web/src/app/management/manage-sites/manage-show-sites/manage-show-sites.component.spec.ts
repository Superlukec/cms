import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageShowSitesComponent } from './manage-show-sites.component';

describe('ManageShowSitesComponent', () => {
  let component: ManageShowSitesComponent;
  let fixture: ComponentFixture<ManageShowSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageShowSitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageShowSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
