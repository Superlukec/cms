import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CkeditorCustomLinkDialogComponent } from './ckeditor-custom-link-dialog.component';

describe('CkeditorCustomLinkDialogComponent', () => {
  let component: CkeditorCustomLinkDialogComponent;
  let fixture: ComponentFixture<CkeditorCustomLinkDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CkeditorCustomLinkDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CkeditorCustomLinkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
