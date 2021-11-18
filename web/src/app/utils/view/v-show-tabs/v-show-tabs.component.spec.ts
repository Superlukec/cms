import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VShowTabsComponent } from './v-show-tabs.component';

describe('VShowTabsComponent', () => {
  let component: VShowTabsComponent;
  let fixture: ComponentFixture<VShowTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VShowTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VShowTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
