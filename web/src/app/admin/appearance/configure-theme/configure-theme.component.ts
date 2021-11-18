import { Component, OnInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { SiteService } from '../../../services/site.service';
import { ActivatedRoute } from '@angular/router';
import { HostnameService } from '../../../services/hostname.service';
import { FormCheckerService } from '../../../services/form-checker.service';
import { ThemeService } from '../../../services/theme.service';
import { ConfigService } from '../../../services/config.service';
import { LayoutService } from '../../../services/layout.service';

import { LargeCodeDialogComponent } from '../../../utils/large-code-dialog/large-code-dialog.component';
import { UploadFileDialogComponent } from '../../../utils/upload-file-dialog/upload-file-dialog.component';
import { RevertThemeDialogComponent } from '../../../utils/revert-theme-dialog/revert-theme-dialog.component';


//import config from '../../../config';

@Component({
  selector: 'app-configure-theme',
  templateUrl: './configure-theme.component.html',
  styleUrls: ['./configure-theme.component.scss']
})
export class ConfigureThemeComponent implements OnInit {

  private webUrl; //= config.api_url;
  private formSubscription: Subscription;

  themeUploadSaveWarning: boolean;

  loading: Boolean = true;

  mainForm: FormGroup;
  submitted = false;

  themeInfo: any;
  themeId: String;
  newTheme: Boolean;
  availableMenus: [any];

  codeMirror: any;
  headerEditor: any;
  footerEditor: any;
  cssEditor: any;
  jsEditor: any;
  @ViewChild('headerhtml') headerhtml: ElementRef;
  @ViewChild('footerhtml') footerhtml: ElementRef;
  @ViewChild('themecss') themecss: ElementRef;
  @ViewChild('themejs') themejs: ElementRef;

  largeViewDialogRef: MatDialogRef<LargeCodeDialogComponent>;
  uploadFileDialogRef: MatDialogRef<UploadFileDialogComponent>;
  revertThemeDialogRef: MatDialogRef<RevertThemeDialogComponent>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _fb: FormBuilder,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _route: ActivatedRoute,
    private _hostService: HostnameService,
    private _formCheckerService: FormCheckerService,
    private _themeService: ThemeService,
    private _dialog: MatDialog,
    private _config: ConfigService,
    private _layoutSizeService: LayoutService
  ) {
  }

  ngAfterViewInit() {

    if (isPlatformBrowser(this.platformId)) {

      var _self = this;

      this._layoutSizeService.loadScripts('codemirror', [
        '/assets/codemirror/lib/codemirror.js',
        '/assets/codemirror/mode/xml/xml.js',
        '/assets/codemirror/mode/javascript/javascript.js',
        '/assets/codemirror/mode/css/css.js'
      ], true, true).then(() => {

        this.codeMirror = (window as any).CodeMirror;


        this.headerEditor = this.codeMirror.fromTextArea(this.headerhtml.nativeElement, {
          lineNumbers: true,
          mode: 'xml'
        });

        this.headerEditor.on("change", function (cm, change) {
          _self.mainForm.patchValue({
            header: cm.getValue()
          });
        });

        this.footerEditor = this.codeMirror.fromTextArea(this.footerhtml.nativeElement, {
          lineNumbers: true,
          mode: 'xml'
        });

        this.footerEditor.on("change", function (cm, change) {
          _self.mainForm.patchValue({
            footer: cm.getValue()
          });
        });

        this.cssEditor = this.codeMirror.fromTextArea(this.themecss.nativeElement, {
          lineNumbers: true,
          mode: 'css'
        });

        this.cssEditor.on("change", function (cm, change) {
          _self.mainForm.patchValue({
            css: cm.getValue()
          });
        });

        this.jsEditor = this.codeMirror.fromTextArea(this.themejs.nativeElement, {
          lineNumbers: true,
          mode: 'javascript'
        });

        this.jsEditor.on("change", function (cm, change) {
          _self.mainForm.patchValue({
            jsfile: cm.getValue()
          });
        });


      });     
    }


  }

  ngOnInit() {
    this.webUrl = this._config.getApiUrl();

    this.createForm();

    this.themeId = this._route.snapshot.paramMap.get('subpage');

    this.getMenus().then((val: any) => {

      this.availableMenus = val;

      if (this.themeId == 'new') {
        this.newTheme = true;
        this.loading = false;
      }
      else {

        this._siteService.getSpecificTheme(this.themeId).subscribe((result: any) => {

          if (result.success) {

            this.loading = false;
            this.themeInfo = result.data;
            this.createForm(result.data);

            if (isPlatformBrowser(this.platformId)) {

              if (this.headerEditor &&
                this.footerEditor &&
                this.cssEditor &&
                this.jsEditor
              ) {
                this.headerEditor.getDoc().setValue(this.mainForm.value.header);
                this.footerEditor.getDoc().setValue(this.mainForm.value.footer);
                this.cssEditor.getDoc().setValue(this.mainForm.value.css);
                this.jsEditor.getDoc().setValue(this.mainForm.value.jsfile);
              }

            }

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

    }).catch(error => {

      console.error(error);

    });


  }

  getMenus() {

    return new Promise((resolve, reject) => {

      this._siteService.getAllMenus(this._hostService.getSiteId()).subscribe((result: any) => {

        if (result.success) {
          resolve(result.data);
        }
        else {
          reject();
        }

      }, err => {

        if (err.status != 200) {
          reject();
        }

      });

    });

  }

  /**
   * We create the form
   * @param data
   */
  createForm(data?) {

    let layout: any = {};

    if (data && data.configuration) {
      let conf = data.configuration[data.configuration.length - 1];

      layout = {
        header: conf.layout.header,
        footer: conf.layout.footer,
        css: conf.css,
        jsfile: conf.jsfile
      }
    }

    this.mainForm = this._fb.group({
      name: [(data && data.name) ? data.name : '', Validators.required],
      description: [(data && data.description) ? data.description : '', Validators.required],
      header: [(layout && layout.header) ? layout.header : '', Validators.required],
      footer: [(layout && layout.footer) ? layout.footer : '', Validators.required],
      css: [(layout && layout.css) ? layout.css : ''],
      jsfile: [(layout && layout.jsfile) ? layout.jsfile : '']
    });

    this.checkForm();

  }

  checkForm() {

    this.formSubscription = this.mainForm.valueChanges
      .subscribe(x => {

        this._formCheckerService.formChanged(true);

        this.formSubscription.unsubscribe();

      });

  }

  uploadTheme() {
    this.uploadFileDialogRef = this._dialog.open(
      UploadFileDialogComponent,
      {
        width: '400px',
        data: {
          themeId: this.themeId
        },
        disableClose: true
      }
    );

    this.uploadFileDialogRef.afterClosed().subscribe(result => {

      if (result && result.length > 0) {

        this.themeUploadSaveWarning = true;

        for (let i = 0; i < result.length; i++) {

          let type = result[i].name;

          let obj = {};
          obj[type] = result[i].value;

          if (type == 'header') {
            this.headerEditor.setValue(result[i].value);
          } else if (type == 'footer') {
            this.footerEditor.setValue(result[i].value);
          } else if (type == 'css') {
            this.cssEditor.setValue(result[i].value);
          } else if (type == 'jsfile') {
            this.jsEditor.setValue(result[i].value);
          }

          this.mainForm.patchValue(obj);

        }

      }

    });
  }

  backupTheme() {

    this._themeService.downloadBackup(
      this.themeId,
      this._hostService.getSiteId()
    ).subscribe((result: any) => {

      if (result && result.success) {
        window.open(this.webUrl + "/download/zip/" + result.data, "_blank");
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

  onSubmit() {
    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      let saveService;

      if (this.newTheme) {
        // in case of a new theme we calls service for saving
        saveService = this._siteService.addTheme(
          this._hostService.getSiteId(),
          this.mainForm.value.name,
          this.mainForm.value.description,
          this.mainForm.value.header,
          this.mainForm.value.footer,
          this.mainForm.value.css,
          this.mainForm.value.jsfile
        );

      }
      else {
        // in case of a existing theme we calls service for updating
        saveService = this._siteService.updateTheme(
          this.themeId,
          this._hostService.getSiteId(),
          this.mainForm.value.name,
          this.mainForm.value.description,
          this.mainForm.value.header,
          this.mainForm.value.footer,
          this.mainForm.value.css,
          this.mainForm.value.jsfile
        );

      }

      saveService.subscribe((result: any) => {

        if (result.success) {

          this.themeUploadSaveWarning = false;

          this._formCheckerService.formChanged(false);
          this.checkForm();

          this._snackBar.open('Saved', '', {
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
      this._snackBar.open('Please enter the data', '', {
        duration: 2000,
      });
    }
  }

  enlarge(type: string) {
    this.largeViewDialogRef = this._dialog.open(
      LargeCodeDialogComponent,
      {
        width: '100vw',
        data: {
          code: this.mainForm.value[type]
        }
      }
    );

    this.largeViewDialogRef.afterClosed().subscribe(result => {
      if (result) {

        let obj = {};
        obj[type] = result;

        if (type == 'header') {
          this.headerEditor.setValue(result);
        } else if (type == 'footer') {
          this.footerEditor.setValue(result);
        } else if (type == 'css') {
          this.cssEditor.setValue(result);
        } else if (type == 'jsfile') {
          this.jsEditor.setValue(result);
        }

        this.mainForm.patchValue(obj);
      }
    });
  }

  revertTheme() {

    this.revertThemeDialogRef = this._dialog.open(
      RevertThemeDialogComponent,
      {
        width: '550px',
        data: {
          themeId: this.themeId
        }
      }
    );

    this.revertThemeDialogRef.afterClosed().subscribe(result => {


      if (result) {


        this.headerEditor.setValue(result.layout.header);
        this.mainForm.patchValue({
          header: result.layout.header
        });

        this.footerEditor.setValue(result.layout.footer);
        this.mainForm.patchValue({
          footer: result.layout.footer
        });

        this.cssEditor.setValue(result.css);
        this.mainForm.patchValue({
          css: result.css
        });

        this.jsEditor.setValue(result.jsfile);
        this.mainForm.patchValue({
          jsfile: result.jsfile
        });


      }

    });

  }

}
