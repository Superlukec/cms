import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTabsComponent } from './add-tabs.component';

describe('AddTabsComponent', () => {
  let component: AddTabsComponent;
  let fixture: ComponentFixture<AddTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
