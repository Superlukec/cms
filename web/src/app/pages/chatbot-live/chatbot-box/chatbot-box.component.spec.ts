import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotBoxComponent } from './chatbot-box.component';

describe('ChatbotBoxComponent', () => {
  let component: ChatbotBoxComponent;
  let fixture: ComponentFixture<ChatbotBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatbotBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatbotBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
