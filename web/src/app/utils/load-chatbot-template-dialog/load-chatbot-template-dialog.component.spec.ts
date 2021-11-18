import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadChatbotTemplateDialogComponent } from './load-chatbot-template-dialog.component';

describe('LoadChatbotTemplateDialogComponent', () => {
  let component: LoadChatbotTemplateDialogComponent;
  let fixture: ComponentFixture<LoadChatbotTemplateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadChatbotTemplateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadChatbotTemplateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
