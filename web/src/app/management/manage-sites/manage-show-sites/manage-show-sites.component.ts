import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ManagementService } from '../../../services/management.service';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-manage-show-sites',
  templateUrl: './manage-show-sites.component.html',
  styleUrls: ['./manage-show-sites.component.scss']
})
export class ManageShowSitesComponent implements OnInit {

  mainForm: FormGroup;
  submitted = false;

  add_site: boolean = false;
  loading: boolean = true;
  sites: [];

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _fb: FormBuilder,
    private _manService: ManagementService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    this.getSites();

  }

  getSites() {

    this._manService.getSites()
      .subscribe((result: any) => {

        this.loading = false;

        if (result.success) {

          this.sites = result.data;

        }
        else {
          this._snackBar.open('Error. Please try again.', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }

      }, err => {

        if (err.status != 200) {

          this.loading = false;


          // snackbar
          this._snackBar.open('Error', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });

  }

  addSite(add: boolean): void {

    if (add) {
      this.add_site = true;
      this.createForm();
    }

    this.add_site = add;

  }

  createForm() {
    this.mainForm = this._fb.group({
      domain: ['', Validators.required],
      title: ['', Validators.required],
      configuration: false
    });
  }

  get f() { return this.mainForm.controls; }

  addSiteSubmit() {

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {


      this._manService.addSite(
        this.mainForm.value.title,
        this.mainForm.value.domain,
        this.mainForm.value.configuration
      )
        .subscribe((result: any) => {

          if (result.success) {

            this.getSites(); 
            this.add_site = false;    

          }
          else {
            this._snackBar.open(result.message, '', {
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

  deleteSite(siteId: string) {
    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this site?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {


        this._manService.deleteSite(siteId)
          .subscribe((result: any) => {
  
            if (result.success) {
  
              this.getSites(); 

            }
            else {
              this._snackBar.open(result.message, '', {
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

}
