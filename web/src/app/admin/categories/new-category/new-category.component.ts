import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';
import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { SlugifyService } from '../../../services/slugify.service';



@Component({
  selector: 'app-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss']
})
export class NewCategoryComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  selectedLang: String;
  multilanguage: any;
  availableLanguages: any;

  loading: Boolean = true;

  mainForm: FormGroup;
  submitted = false;

  @Input() id: string;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _hostService: HostnameService,
    private _router: Router,
    private _slugifyService: SlugifyService,
  ) { }

  ngOnInit() {

    let getSiteInfoHandler = new Promise((resolve, reject) => {
      this._siteService.getPostSiteInfo(this._hostService.getSiteId()).subscribe((result: any) => {
        if (result && result.success) {
          resolve(result.data);
        }
        else {
          resolve([]);
        }
      }, err => {
        if (err.status != 200) {
          resolve([]);
        }
      });
    });

    getSiteInfoHandler.then((siteInfo: any) => {

      if (siteInfo) {

        this.multilanguage = siteInfo.multilanguage;
        this.availableLanguages = (siteInfo.languages) ? siteInfo.languages : [];

        if (!this.selectedLang && this.availableLanguages.length > 0) {
          for (let lang of this.availableLanguages) {
            if (lang.main) {
              this.selectedLang = lang.prefix;
            }
          }
        }

      }


    });

    if (!this.id) {
      this.loading = false;
      this.createForm();
    }
    else {

      this._siteService.getCategory(
        this._hostService.getSiteId(),
        this.id
      ).subscribe((result: any) => {

        this.loading = false;

        if (result.success) {
          
          this.createForm(result.data);

          if(result.data && result.data.lang_prefix) {
            this.selectedLang = result.data.lang_prefix;
          }

        }
        else {
          this.id = null;
          this.createForm();

          this._snackBar.open(result.message, '', {
            duration: 2000,
          });
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

  }

  /**
   * We create the form
   * @param data
   */
  createForm(data?) {
    this.mainForm = this._fb.group({
      name: [(data && data.name) ? data.name : '', Validators.required],
      slug: [(data && data.slug) ? data.slug : '', Validators.required]
    });


    /**
     * Listen for changes on the name
     */
    this.subscription = this.mainForm.get('name').valueChanges
      .pipe(debounceTime(800),
        distinctUntilChanged()
      )
      .subscribe(modelValue => {

        if (!this.mainForm.get('slug').value) {
          this.mainForm.patchValue({
            'slug': this._slugifyService.convertToSlug(this.mainForm.get('name').value)
          });

        }
      });
  }

  onSubmit() {

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      let saveService = (!this.id) ?
        this._siteService.addCategory(
          this._hostService.getSiteId(),
          this.mainForm.value.name,
          this.mainForm.value.slug,
          this.selectedLang
        ) :
        this._siteService.updateCategory(
          this._hostService.getSiteId(),
          this.id,
          this.mainForm.value.name,
          this.mainForm.value.slug,
          this.selectedLang
        )

      saveService.subscribe((result: any) => {

        if (result.success) {
          this._snackBar.open('Saved', '', {
            duration: 2000,
          });
        }
        else {
          this._snackBar.open('Error: ' + result.message, '', {
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


  deleteCategory() {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'You will delete this category',
          text: 'Are you sure that you want to delete this category?',
          leftButton: 'Cancel',
          rightButton: 'Delete'
        }
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        // User agrees

        this._siteService.deleteCategory(
          this._hostService.getSiteId(),
          this.id
        ).subscribe((result: any) => {

          if (result.success) {

            this._router.navigate(['admin/posts/categories']);

            this._snackBar.open('Deleted', '', {
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

    });


  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
