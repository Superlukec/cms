import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotLiveComponent } from './chatbot-live.component';

describe('ChatbotLiveComponent', () => {
  let component: ChatbotLiveComponent;
  let fixture: ComponentFixture<ChatbotLiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatbotLiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatbotLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
