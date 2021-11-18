import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { LoadCookieTemplateDialogComponent } from '../../../utils/load-cookie-template-dialog/load-cookie-template-dialog.component';
import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';
import { FormCheckerService } from '../../../services/form-checker.service';


@Component({
  selector: 'app-cookie-settings',
  templateUrl: './cookie-settings.component.html',
  styleUrls: ['./cookie-settings.component.scss']
})
export class CookieSettingsComponent implements OnInit {

  loading: boolean = true;
  cookiesAvailable: any = [];

  mainForm: FormGroup;
  submitted = false;

  multilanguage: any;
  // availableLanguages: any;
  currentLang: number = 0;

  cookiesData: any = [];  
  
  loadedTemplate: boolean;
  loadTemplateDialogRef: MatDialogRef<LoadCookieTemplateDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _fb: FormBuilder,
    private _cookieService: CookieService,
    private _formCheckerService: FormCheckerService
  ) { }

  ngOnInit() {

    let cookies = this._cookieService.getAll();
    for(let c in cookies) {
      this.cookiesAvailable.push({
        name: c
      });
    }


    let getSiteInfoHandler = this.getSiteInfo(this._hostService.getSiteId());

    getSiteInfoHandler.then((siteInfo: any) => {

      if (siteInfo) {
       
        this.multilanguage = siteInfo.multilanguage;

        var promise = new Promise((resolve, reject) => {

          if(siteInfo.languages) {
  
            for(let i = 0; i < siteInfo.languages.length; i++) {  

              if(siteInfo.cookies_info.length > 0 ) { 

                for(let j = 0; j < siteInfo.cookies_info.length; j++) {  

                  if(siteInfo.languages[i].prefix == siteInfo.cookies_info[j].lang) {

                    //console.log(siteInfo.cookies_info[j])
                  
                    this.cookiesData.push({
                      language: siteInfo.languages[i].language,
                      text:  siteInfo.cookies_info[j].text,
                      agree_text: siteInfo.cookies_info[j].agree_text,
                      more_information: (siteInfo.cookies_info[j].more_information) ? (siteInfo.cookies_info[j].more_information) : '',
                      cookie_information: (siteInfo.cookies_info[j].cookie_information) ? (siteInfo.cookies_info[j].cookie_information) : '',
                      lang: siteInfo.languages[i].prefix,
                      cookies: siteInfo.cookies_info[j].cookies,
                      error: false
                    })

                  }

                }
              }
              else {
                this.cookiesData.push({
                  language: siteInfo.languages[i].language,
                  text: '',
                  agree_text: '',
                  more_information: '',
                  cookie_information: '',
                  lang: siteInfo.languages[i].prefix,
                  cookies: this.cookiesAvailable,
                  error: false
                })
              }

            }

            resolve();
          }
          else {

            if(siteInfo.cookies_enabled && siteInfo.cookie_info[0]) {
              this.cookiesData.push({
                language: 'Main',
                text: siteInfo.cookie_info[0].text,
                agree_text: siteInfo.cookie_info[0].agree_text,
                more_information: (siteInfo.cookie_info[0].more_information) ? siteInfo.cookie_info[0].more_information : '',
                cookie_information: (siteInfo.cookie_info[0].cookie_information) ? siteInfo.cookie_info[0].cookie_information : '',
                lang: 'all',
                cookies: siteInfo.cookie_info[0].cookies,
                error: false
              })
            }
            else {
              this.cookiesData.push({
                language: 'Main',
                text: '',
                agree_text: '',
                more_information: '',
                cookie_information: '',
                lang: 'all',
                cookies: this.cookiesAvailable,
                error: false
              })
            }

            resolve();
          }
        
        });

        promise.then((data: any) => {

          
          this.createForm(siteInfo);
          this.loading = false;



        });

      }

    });


  }

  get f() { return this.mainForm.controls; }

  createForm(data?) {

    this.mainForm = this._fb.group({
      cookies: [(data && data.cookies_enabled) ? data.cookies_enabled : false, Validators.required],
    });

    if(data && data.cookies_enabled) {
      if(!this.mainForm.contains('cookieData')) {
        this.mainForm.addControl('cookieData', new FormControl([], [Validators.required]));
      }
    }

  }

  onCkEditorValue(text) {
    if(!this.loadedTemplate) {
      this.cookiesData[this.currentLang].text = text;
      this.loadedTemplate = false;
    }
  }


  onChangeLang(index: number) {

    this.currentLang = index;

  }

  onChangeConsent(val) {
    if(val) {
      if(!this.mainForm.contains('cookieData')) {
        this.mainForm.addControl('cookieData', new FormControl([], [Validators.required]));
      }
    } else {
      if(this.mainForm.contains('cookieData')) {
        this.mainForm.removeControl('cookieData');
      } 
    }
  }

  loadCookieTemplate() {

    this.loadTemplateDialogRef = this._dialog.open(
      LoadCookieTemplateDialogComponent,
      {
        width: '400px',
        data: {}
      }
    );

    this.loadTemplateDialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.loadedTemplate = true;

        this.cookiesData[this.currentLang].text =  result.text;
        this.cookiesData[this.currentLang].agree_text =  result.agree_text;
        this.cookiesData[this.currentLang].more_information = result.more_information;
        this.cookiesData[this.currentLang].cookie_information = result.cookie_information;
        this.cookiesData[this.currentLang].cookies = result.cookies;
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
            panelClass: ['error-snackbar']
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

  onSubmit() {

    let firstTime = true;
    let valid = true;
    
    for(let c of this.cookiesData) {     

      if((c.text && c.text.length > 0) && (c.agree_text && c.agree_text.length > 0)) {
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
      
      for(let c of this.cookiesData) {
        prepareData.push({
          text: c.text,
          agree_text: c.agree_text,
          more_information: c.more_information,
          cookie_information: c.cookie_information,
          lang: c.lang,
          cookies: c.cookies
        });
      }

      this.mainForm.patchValue({
        cookieData: prepareData
      });

    }

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {


      this._siteService.saveCookieSettings(
        this._hostService.getSiteId(),
        this.mainForm.value.cookies,
        this.mainForm.value.cookieData,
      )
      .subscribe((result: any) => {

        if (result.success) {

          this._snackBar.open('Cookie settings updated', '', {
            duration: 2000,
          });

          this._formCheckerService.formChanged(false);
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
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
      });
    }

  }

}
