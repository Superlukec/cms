import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-load-chatbot-template-dialog',
  templateUrl: './load-chatbot-template-dialog.component.html',
  styleUrls: ['./load-chatbot-template-dialog.component.scss']
})
export class LoadChatbotTemplateDialogComponent implements OnInit {

  selectedLang: string = 'en';
  selectedText: string;
  
  intro_text: string;
  intro_btn: string;
  contact_text: string;
  your_name: string;
  your_email: string;
  privacy_text: string;
  continue_text: string;
  welcome_text: string;
  write_message: string;

  textTemplate: any = [{
      lang: "si",
      intro_text: "<h4>Kako vam lahko pomagamo?</h4><p>Pošljite nam kratko sporočilo in odgovorili vam bomo v najkrajšem možnem času</p>",
      intro_btn: "Pošlji sporočilo",
      contact_text: "<p>Za lažjo komunikacijo bi vas prosili, če nam lahko zaupate vaše podatke.</p>",
      your_name: "Vaše ime (opcijsko)",
      your_email: "E-mail",
      privacy_text: "Strinjam se s pogoji",
      continue_text: "Nadaljuj",
      welcome_text: "Kako vam lahko pomagamo?",
      write_message: "Pošlji sporočilo"
    }, {
      lang: "en",
      intro_text: "<h4>How can we help you?</h4><p>Send us a message and we will reply as soon as possible</p>",
      intro_btn: "Send message",
      contact_text: "<p>For easier communication, we would like to ask you form some information.</p>",
      your_name: "Your name (optional)",
      your_email: "E-mail",
      privacy_text: "I agree with the terms",
      continue_text: "Continue",
      welcome_text: "How can we help you?",
      write_message: "Write message"
  }];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<LoadChatbotTemplateDialogComponent>
  ) { }

  ngOnInit() {
    this.selectText(this.selectedLang);
  }

  private selectText(lang) {
    for(let text of this.textTemplate) {
      if(text.lang == lang) {
        
        this.intro_text = text.intro_text;
        this.intro_btn = text.intro_btn;
        this.contact_text = text.contact_text;
        this.your_name = text.your_name;
        this.your_email = text.your_email;
        this.privacy_text = text.privacy_text;
        this.continue_text = text.continue_text;
        this.welcome_text = text.welcome_text;
        this.write_message = text.write_message;

      }
    }
  }

  onChangeLang(lang) {
    this.selectText(lang);
  }

  close() {
    this._dialogRef.close({
        intro_text: this.intro_text,
        intro_btn: this.intro_btn,
        contact_text: this.contact_text,
        your_name: this.your_name,
        your_email: this.your_email,
        privacy_text: this.privacy_text,
        continue_text: this.continue_text,
        welcome_text: this.welcome_text,
        write_message: this.write_message
    });
  }

}
