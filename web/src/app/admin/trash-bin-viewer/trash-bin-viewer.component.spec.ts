import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrashBinViewerComponent } from './trash-bin-viewer.component';

describe('TrashBinViewerComponent', () => {
  let component: TrashBinViewerComponent;
  let fixture: ComponentFixture<TrashBinViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrashBinViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrashBinViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
