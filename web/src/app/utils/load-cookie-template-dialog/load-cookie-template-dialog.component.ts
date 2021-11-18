import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-load-cookie-template-dialog',
  templateUrl: './load-cookie-template-dialog.component.html',
  styleUrls: ['./load-cookie-template-dialog.component.scss']
})
export class LoadCookieTemplateDialogComponent implements OnInit {

  selectedLang: string = 'en';
  selectedText: string;
  agreeText: string;
  cookieInformation: string;
  moreInfoButton: string;
  cookies: any = [];

  textTemplate: any = [{
    text: 'Dovolite nam uporabo posebnih piškotkov, s katerimi nudimo boljšo uporabniško izkušnjo pri brskanju po spletni strani.',
    agree_text: 'Strinjam se',
    more_information: 'Več informacij',
    cookie_information: 'Informacije o piškotih',
    cookies: [{
      name: 'jwtToken',
      text: 'Avtentifikacijski žeton'
    }],
    lang: 'sl'
  }, {
    text: 'By continuing to use the site, you agree to the use of cookies',
    agree_text: 'I agree',
    more_information: 'More information',
    cookie_information: 'Cookie information',
    cookies: [{
      name: 'jwtToken',
      text: 'User token'
    }],
    lang: 'en'
  }];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<LoadCookieTemplateDialogComponent>
  ) { }

  ngOnInit() {
    this.selectText(this.selectedLang);
  }

  private selectText(lang) {
    for(let text of this.textTemplate) {
      if(text.lang == lang) {
        this.selectedText = text.text;
        this.agreeText = text.agree_text;
        this.cookieInformation = text.cookie_information;
        this.moreInfoButton = text.more_information;        
        this.cookies = text.cookies;
      }
    }
  }

  onChangeLang(lang) {
    this.selectText(lang);
  }

  close() {
    this._dialogRef.close({
      text: this.selectedText,
      agree_text: this.agreeText,
      cookie_information: this.moreInfoButton,
      more_information: this.moreInfoButton,
      cookies: this.cookies
    });
  }

}
