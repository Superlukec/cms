import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTransferComponent } from './view-transfer.component';

describe('ViewTransferComponent', () => {
  let component: ViewTransferComponent;
  let fixture: ComponentFixture<ViewTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
