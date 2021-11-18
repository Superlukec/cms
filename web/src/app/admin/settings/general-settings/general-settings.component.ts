import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AddLanguageComponent } from './add-language/add-language.component';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { SlugifyService } from '../../../services/slugify.service';
import { FormCheckerService } from '../../../services/form-checker.service';
import { ConfigService } from '../../../services/config.service';
import { FaviconService } from 'src/app/services/favicon.service';
import { link } from 'fs';

//import config from '../../../config';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {

  private formSubscription: Subscription;

  loading: boolean = true;

  mainForm: FormGroup;
  submitted = false;

  addLanguageDialogRef: MatDialogRef<AddLanguageComponent>;

  sitemap_uri: String;
  languages: any = [];

  faviconUrl: String;

  constructor(
    private dialog: MatDialog,
    private _siteService: SiteService,
    private _fb: FormBuilder,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _formCheckerService: FormCheckerService,
    private _slugifyService: SlugifyService,
    private _config: ConfigService,
    private _faviconService: FaviconService
  ) { }

  ngOnInit() {

    console.log(this._hostService.getHostname());

    this._siteService.getSettingsSiteInfo(this._hostService.getSiteId()).subscribe((result: any) => {

      this.loading = false;

      if (result.success) {

        this.languages = (result.data.languages) ? result.data.languages : [];

        this.createForm(result.data);

        if(result.data && result.data.favicon) {
          this.faviconUrl = result.data.favicon;
        }

      }

    }, err => {
      if (err.status != 200) {
        this._snackBar.open('Error on the server', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });

  }

  /**
   * We create the form
   * @param data
   */
  createForm(data?) {
    this.mainForm = this._fb.group({
      title: [(data && data.title) ? data.title : '', Validators.required],
      domain: [(data && data.domain) ? data.domain : '', Validators.required],
      public: [(data && data.public) ? '' + data.public : 'false', Validators.required],
      seo: [(data && data.seo) ? '' + data.seo : 'false', Validators.required],
      multilanguage: [(data && data.multilanguage) ? data.multilanguage : false, Validators.required],
      sitemap_enabled: [(data && data.sitemap_enabled) ? '' + data.sitemap_enabled : 'false', Validators.required],
      languages: this.languages
    });

    let sitemap_xml_name = 'sitemap.xml';
    if (this.mainForm.value.domain != '') {
      sitemap_xml_name = this._slugifyService.slugify(this.mainForm.value.domain) + '.xml';
    }

    // we generate sitemap uri
    if (this._config.isDevelopment()) {
      this.sitemap_uri = 'localhost:4200/sitemap/' + sitemap_xml_name;
    }
    else {
      this.sitemap_uri = this.mainForm.value.domain + '/sitemap/' + sitemap_xml_name;
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

  /**
   * Dialog for adding the language to multilanguage tab
   */
  addLanguage() {
    this.addLanguageDialogRef = this.dialog.open(
      AddLanguageComponent,
      {
        width: '350px',
        data: { text: 'Are you sure to approve this consultant' },
        //disableClose: true
      }
    );

    this.addLanguageDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.languages = result;
      }
    });
  }

  get f() { return this.mainForm.controls; }

  setMainLanguage(prefix: String) {

    this._formCheckerService.formChanged(true);

    for (let lang of this.languages) {
      if (lang['prefix'] == prefix) {
        lang['main'] = true;
      }
      else {
        lang['main'] = false;
      }
    }

  }

  onFaviconUpload(img) {
    console.log('on upload');
    console.log(img);

    if (img && img.file_dimensions && img.file_dimensions.length > 0) {

      let favicon = img.file_dimensions[0].filename;
      let originalFilename = img.filename;
      let originalUrl = img.url;

      let faviconUrl = originalUrl.replace(originalFilename, favicon);      
      console.log(faviconUrl)


      this._faviconService.saveFavicon(this._hostService.getSiteId(), faviconUrl).subscribe((result: any) => {

        if (result && result.success) {

          // we update icon
          this.faviconUrl = faviconUrl;

        }
        else {
          this._snackBar.open('Error saving favicon image', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }

      }, err => {
        if (err.status != 200) {
          this._snackBar.open('Error saving favicon image', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });

    }
    else {
      this._snackBar.open('Error saving favicon image', '', {
        duration: 2000,
        panelClass: ['error-snackbar']
      });
    }

  }

  deleteFavicon() {

    let tmp = this.faviconUrl.split('/');
    let withoutUrlFilename = tmp[tmp.length - 1];

    this._siteService.deleteFileByName(this._hostService.getSiteId(), withoutUrlFilename).subscribe((result: any) => {

      if(result && result.success) {

        this._faviconService.deleteFavicon(this._hostService.getSiteId()).subscribe((result: any) => {

          if (result && result.success) {
    
            // we delete icon and replace it with default
            this.faviconUrl = null;
    
          }
          else {
            this._snackBar.open('Error saving favicon image', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }
    
    
        }, err => {
    
          if (err.status != 200) {
            this._snackBar.open('Error saving favicon image', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }
    
        });

      }
      else {
        this._snackBar.open('Error deleting favicon image', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }

    }, (err) => {
      if (err.status != 200) {
        this._snackBar.open('Error deleting favicon image', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });

  }

  onSubmit() {
    this.submitted = true;

    console.log('saving / updating settings')

    if (this.mainForm.status != "INVALID") {

      /**
       * Is this really neccessary?
       */
      if (this.mainForm.value.multilanguage && this.languages.length == 0) {

        this._snackBar.open('You have selected multilanguage setting. Please add languages.', '', {
          duration: 2000,
        });

      }
      else {

        this._siteService.updateSiteSettings(
          this._hostService.getSiteId(),
          this.mainForm.value.title,
          this.mainForm.value.domain,
          this.mainForm.value.public,
          this.mainForm.value.seo,
          this.mainForm.value.multilanguage,
          this.mainForm.value.sitemap_enabled,
          this.languages
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

    }
    else {
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
      });
    }

  }
}
