import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { HostnameService } from '../../../../services/hostname.service';
import { SiteService } from '../../../../services/site.service';
import { FormCheckerService } from '../../../../services/form-checker.service';
import { LoadChatbotTemplateDialogComponent } from '../../../../utils/load-chatbot-template-dialog/load-chatbot-template-dialog.component';

import { WorkingHoursDialogComponent } from './working-hours-dialog/working-hours-dialog.component';

import weekdays from './weekdays'


@Component({
  selector: 'app-chat-settings',
  templateUrl: './chat-settings.component.html',
  styleUrls: ['./chat-settings.component.scss']
})
export class ChatSettingsComponent implements OnInit {

  private formSubscription: Subscription;

  loading: boolean = true;

  mainForm: FormGroup;
  submitted = false;

  multilanguage: any;
  currentLang: number = 0;

  workingHourDialogRef: MatDialogRef<WorkingHoursDialogComponent>;

  textData: any = [];  
  weekDays: any[] = weekdays.weekdays;

  loadedTemplate: boolean;
  loadTemplateDialogRef: MatDialogRef<LoadChatbotTemplateDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _fb: FormBuilder,
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _formCheckerService: FormCheckerService
  ) { }

  get f() { return this.mainForm.controls; }

  ngOnInit() {

    let getSiteInfoHandler = this.getSiteInfo(this._hostService.getSiteId());

    getSiteInfoHandler.then((siteInfo: any) => {

      if (siteInfo) {
        this.multilanguage = siteInfo.multilanguage;

        var promise = new Promise((resolve, reject) => {

          if(siteInfo.languages) {

            for(let i = 0; i < siteInfo.languages.length; i++) {  

              if(siteInfo.chat_settings && 
                siteInfo.chat_settings.text && 
                siteInfo.chat_settings.text.length > 0) {

                for(let j = 0; j < siteInfo.chat_settings.text.length; j++) {

                  if(siteInfo.languages[i].prefix == siteInfo.chat_settings.text[j].lang) {

                    this.textData.push({
                      language: siteInfo.languages[i].language,
                      //
                      introText: siteInfo.chat_settings.text[j].intro_text,
                      introBtn: siteInfo.chat_settings.text[j].intro_btn,
                      contactText: siteInfo.chat_settings.text[j].contact_text,                    
                      yourName: siteInfo.chat_settings.text[j].your_name,
                      yourEmail: siteInfo.chat_settings.text[j].your_email,
                      privacyText: siteInfo.chat_settings.text[j].privacy_text,
                      privacyLink: siteInfo.chat_settings.text[j].privacy_link,
                      continueText: siteInfo.chat_settings.text[j].continue_text,
                      welcomeText: siteInfo.chat_settings.text[j].welcome_text,
                      writeMessage: siteInfo.chat_settings.text[j].write_message,
                      //
                      lang: siteInfo.languages[i].prefix,
                      error: false
                    });

                  }

                }

              }
              else {
                this.textData.push({
                  language: siteInfo.languages[i].language,      
                  //
                  introText: '',
                  introBtn: '',
                  contactText: '',                    
                  yourName: '',
                  yourEmail: '',
                  privacyText: '',
                  privacyLink: '',
                  continueText: '',
                  welcomeText: '',
                  writeMessage: '',
                  //            
                  lang: siteInfo.languages[i].prefix,
                  error: false
                })
              }

            }

            resolve();

          }
          else {

            if(siteInfo.chat_enabled && siteInfo.chat_settings[0]) {
              this.textData.push({
                language: 'Main',               
                //
                introText: siteInfo.chat_settings.text[0].intro_text,
                introBtn: siteInfo.chat_settings.text[0].intro_btn,
                contactText: siteInfo.chat_settings.text[0].contact_text,                    
                yourName: siteInfo.chat_settings.text[0].your_name,
                yourEmail: siteInfo.chat_settings.text[0].your_email,
                privacyText: siteInfo.chat_settings.text[0].privacy_text,
                privacyLink: siteInfo.chat_settings.text[0].privacy_link,
                continueText: siteInfo.chat_settings.text[0].continue_text,
                welcomeText: siteInfo.chat_settings.text[0].welcome_text,
                writeMessage: siteInfo.chat_settings.text[0].write_message,
                //
                lang: 'all',
                error: false
              })
            }
            else {
              this.textData.push({
                language: 'Main',  
                //
                introText: '',
                introBtn: '',
                contactText: '',                    
                yourName: '',
                yourEmail: '',
                privacyText: '',
                privacyLink: '',
                continueText: '',
                welcomeText: '',
                writeMessage: '',
                //                
                lang: 'all',
                error: false
              })
            }

            resolve();

          }

          


        });

        promise.then((data: any) => {

          
          this._siteService.getChatbotSettings(
            this._hostService.getSiteId()
          ).subscribe((result: any) => {
      
            this.loading = false;  
      
            if (result.success) {

              this.loading = false;  
              this.createForm(result.data);
              this.checkForm();
      
            }
            else {
              this._snackBar.open(result.message, '', {
                duration: 2000,
              });
            }
      
          }, err => {
      
            if (err.status != 200) {
              // snackbar
              this._snackBar.open('Error', '', {
                duration: 2000,
                panelClass: ['error-snackbar']
              });
            }
          });



        });

      }
      
      

    });   

  }

  createForm(data?) {
    this.mainForm = this._fb.group({
      chatEnabled: [(data && data.chat_enabled) ? data.chat_enabled : 'false', Validators.required],
      workingHours: [(data && data.chat_settings && data.chat_settings.working_hours_enabled) ? (data.chat_settings.working_hours_enabled + '') : 'false', Validators.required],
      workingHoursType: [(data && data.chat_settings && data.chat_settings.working_hours_type) ? data.chat_settings.working_hours_type : 'everyday']
    });

    if(data && data.chat_enabled) {
      if(!this.mainForm.contains('textData')) {
        this.mainForm.addControl('textData', new FormControl([], [Validators.required]));
      }
    }

    if(data && data.chat_settings && data.chat_settings.working_hours && data.chat_settings.working_hours.length > 0) {
     
      for(let day of data.chat_settings.working_hours) {

        for(let wday of this.weekDays) {

          if(day.day == wday.day) {

            wday.fromHour = day.from_hour;
            wday.fromMinutes = day.from_minutes;
            wday.toHour = day.to_hour;
            wday.toMinutes = day.to_minutes;

          }

        }        

      }

    }

    this.checkForm();
  }

  checkForm() {

    this.formSubscription = this.mainForm.valueChanges    
    .subscribe(x => {

        this._formCheckerService.formChanged(true);

        this.formSubscription.unsubscribe();

    });

  }

  loadChatTemplate() {

    console.log('load chat template')

    this.loadTemplateDialogRef = this._dialog.open(
      LoadChatbotTemplateDialogComponent,
      {
        width: '400px',
        data: {}
      }
    );

    this.loadTemplateDialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.loadedTemplate = true;
       
        this.textData[this.currentLang].introText =  result.intro_text;
        this.textData[this.currentLang].introBtn =  result.intro_btn;
        this.textData[this.currentLang].contactText = result.contact_text;
        this.textData[this.currentLang].yourName = result.your_name;
        this.textData[this.currentLang].yourEmail = result.your_email;
        this.textData[this.currentLang].privacyText = result.privacy_text;
        this.textData[this.currentLang].continueText = result.continue_text;
        this.textData[this.currentLang].welcomeText = result.welcome_text;
        this.textData[this.currentLang].writeMessage = result.write_message;
      }
    });

  }

  getSiteInfo(site_id) {

    return new Promise((resolve, reject) => {

      this._siteService.getPostSiteInfo(site_id).subscribe((result: any) => {

        if (result.success) {
          resolve(result.data);
        }
        else {

          resolve([]);

          this._snackBar.open('Error: ' + result.message, '', {
            duration: 2000,
          });
        }

      }, err => {

        if (err.status != 200) {

          resolve([]);

          // snackbar
          this._snackBar.open('Error', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });


    });

  }

  onCkEditorValue(value, variableName) {          
    this.textData[this.currentLang][variableName] = value;
  }

  onChangeLang(index: number) {
    this.currentLang = index;
  }

  editSingleHour(everyday: boolean, day: any) {

    this.workingHourDialogRef = this._dialog.open(
      WorkingHoursDialogComponent,
      {
        width: '450px',
        data: {          
          multi: false,
          everyday: everyday,
          day: day
        }
      }
    );

    this.workingHourDialogRef.afterClosed().subscribe(result => {
      if (result) {
        
        if(everyday) {
          // everyday

          for(let w of this.weekDays) {

            w.fromHour = parseInt(result.fromHour);
            w.fromMinutes = parseInt(result.fromMinutes);
            w.toHour = parseInt(result.toHour);
            w.toMinutes = parseInt(result.toMinutes);
            w.closed = false;

          }

        }
        else {          
          // weekdays

          for(let w of this.weekDays) {

            if(w.day != 0 && w.day != 6) {
              // if not weekend

              w.fromHour = parseInt(result.fromHour);
              w.fromMinutes = parseInt(result.fromMinutes);
              w.toHour = parseInt(result.toHour);
              w.toMinutes = parseInt(result.toMinutes);

            }
            else {
              w.closed = true;
            }
            
          }

        }

      }
    });

  }

  editMultiHour() {

    this.workingHourDialogRef = this._dialog.open(
      WorkingHoursDialogComponent,
      {
        width: '550px',
        data: {
          multi: true,
          weekDays: this.weekDays
        }
      }
    );

    this.workingHourDialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result)
      }
    });

  }

  changeWorkingHours(type: string): void {
    for(let w of this.weekDays) {

      if(type == 'weekdays') {

        if(w.day == 0 || w.day == 6) {
          w.closed = true;
        }
        
      }
      else if(type == 'everyday') {
        w.closed = false;
      }

    }
  } 

  chatEnableChange(value: string) {
    
    let enable = (value == 'true') ? true : false;

    if(enable) {
      if(!this.mainForm.contains('textData')) {
        this.mainForm.addControl('textData', new FormControl([], [Validators.required]));
      }
    }
    else {
      if(this.mainForm.contains('textData')) {
        this.mainForm.removeControl('textData');
      }
    }  
  }

  onSubmit() {
    let firstTime = true;
    let valid = true;
    
    for(let c of this.textData) {     

      if(
        (c.introText && c.introText.length > 0) &&
        (c.introBtn && c.introBtn.length > 0) &&
        (c.contactText && c.contactText.length > 0) &&
        (c.yourName && c.yourName.length > 0) &&
        (c.yourEmail && c.yourEmail.length > 0) && 
        (c.privacyText && c.privacyText.length > 0) &&
        (c.privacyLink && c.privacyLink.length > 0) &&
        (c.continueText && c.continueText.length > 0) &&
        (c.welcomeText && c.welcomeText.length > 0) &&
        (c.writeMessage && c.writeMessage.length > 0)        
        ) {
        c.error = false;
      }
      else {

        if(firstTime) {
          valid = false;
          firstTime = false;
        }

        c.error = true;
      }
    }

    if(valid) {

      let prepareData = [];
      
      for(let c of this.textData) {
        prepareData.push({
          intro_text: c.introText,
          intro_btn: c.introBtn,
          contact_text: c.contactText,
          your_name: c.yourName,
          your_email: c.yourEmail,
          privacy_text: c.privacyText,
          privacy_link: c.privacyLink,
          continue_text: c.continueText,
          welcome_text: c.welcomeText,
          write_message: c.writeMessage,
          lang: c.lang
        });
      }

      this.mainForm.patchValue({
        textData: prepareData
      });

    }

    console.log(this.mainForm.value.chatEnabled);
    if(this.mainForm.value.chatEnabled == 'false') {
      valid = true;
    }

    this.submitted = true;

    console.log('saving / updating settings')

    if (this.mainForm.status != "INVALID" && valid) {

      this._siteService.updateChatbotSettings(
        this._hostService.getSiteId(),
        this.mainForm.value.chatEnabled,        
        this.mainForm.value.textData,
        this.mainForm.value.workingHours,
        this.mainForm.value.workingHoursType,
        this.weekDays
      ).subscribe((result: any) => {

        if (result.success) {

          this._formCheckerService.formChanged(false);
          this.checkForm();

          this._snackBar.open('Settings updated', '', {
            duration: 2000,
          });
        }
        else {
          this._snackBar.open('Error. Please try again.', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }

      }, err => {

        if (err.status != 200) {
          // snackbar
          this._snackBar.open('Error', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });

    }
    else {
      this._snackBar.open('Please enter the data.', '', {
        duration: 2000,
      });
    }

  }

}
