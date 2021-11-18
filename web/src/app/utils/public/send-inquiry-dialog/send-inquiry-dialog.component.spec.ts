import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendInquiryDialogComponent } from './send-inquiry-dialog.component';

describe('SendInquiryDialogComponent', () => {
  let component: SendInquiryDialogComponent;
  let fixture: ComponentFixture<SendInquiryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendInquiryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendInquiryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
