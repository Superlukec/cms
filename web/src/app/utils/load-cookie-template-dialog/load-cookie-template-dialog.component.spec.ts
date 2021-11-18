import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadCookieTemplateDialogComponent } from './load-cookie-template-dialog.component';

describe('LoadCookieTemplateDialogComponent', () => {
  let component: LoadCookieTemplateDialogComponent;
  let fixture: ComponentFixture<LoadCookieTemplateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadCookieTemplateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadCookieTemplateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
