import { Component, OnInit, Input, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';


import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';
import { NewFormElementDialogComponent } from './new-form-element-dialog/new-form-element-dialog.component';



@Component({
  selector: 'app-new-form',
  templateUrl: './new-form.component.html',
  styleUrls: ['./new-form.component.scss']
})
export class NewFormComponent implements OnInit {

  new_form:any = {};

  loading: Boolean = true;

  mainForm: FormGroup;
  submitted = false;
  elementsAddSubmit = false;

  addFormDialogRef: MatDialogRef<NewFormElementDialogComponent>;

  email: string;
  elements: any = [];

  @Input() id: string;
  @ViewChild('emailHtml') emailHtml: ElementRef;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _dialog: MatDialog,
    private dialog: MatDialog,
    private _siteService: SiteService,
    private _fb: FormBuilder, 
    private _snackBar: MatSnackBar,
    private _hostService: HostnameService,
    private _router: Router
  ) { }

  get f() { return this.mainForm.controls; }

  ngOnInit() {

    if(!this.id) {            
      this.loading = false;
      this.createForm();
    }
    else {

      this._siteService.getForm(
        this._hostService.getSiteId(), 
        this.id
      ).subscribe((result: any) => {

        this.loading = false;

        if (result.success) {  
          this.createForm(result.data);
          
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

  createForm(data?) {

    this.mainForm = this._fb.group({
      name: [(data && data.name) ? data.name : '', Validators.required],
      recipients: [(data && data.recipients) ? data.recipients : ''],
      email: [(data && data.email) ? data.email : ''],
      submit_btn: [(data && data.submit_btn) ? data.submit_btn : ''],
      html: [(data && data.html) ? data.html : '']
    });

    this.email = (data && data.email) ? data.email : '';

    this.elements = (data && data.elements) ? data.elements : []
  }

  onCkEditorValue(val: string) {
    this.mainForm.patchValue({
      email: val
    });
  }


  onSubmit() {    

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      let saveService = (!this.id) ? 
        this._siteService.addForm(
          this._hostService.getSiteId(), 
          this.mainForm.value.name,
          this.elements,
          this.mainForm.value.recipients,
          this.mainForm.value.email,
          this.mainForm.value.submit_btn,
          this.mainForm.value.html
        ) :
        this._siteService.updateForm(
          this.id,
          this._hostService.getSiteId(), 
          this.mainForm.value.name,
          this.elements,
          this.mainForm.value.recipients,
          this.mainForm.value.email,
          this.mainForm.value.submit_btn,
          this.mainForm.value.html
        )

      saveService.subscribe((result: any) => {

        if(result.success) {

          this.id = result.data;

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
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
      });
    }

  }

  deleteFormElement(index) {

    this.elements.splice(index, 1);

  }

  editFormElement(index) {
    this.addFormDialogRef = this.dialog.open(
      NewFormElementDialogComponent,
      {
        width: '350px',
        data: this.elements[index]
      }
    );

    this.addFormDialogRef.afterClosed().subscribe(element => {

      if(element) {
        this.elements[index] = element;
      }

    });
  }

  addElement() {
    this.addFormDialogRef = this.dialog.open(
      NewFormElementDialogComponent,
      {
        width: '350px'
      }
    );

    this.addFormDialogRef.afterClosed().subscribe(element => {

      if(element) {
        this.elements.push(element);
      }

    });
  }

  deleteForm() {
    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'You will delete this form',
          text: 'Are you sure that you want to delete this form and its submissions?',
          leftButton: 'Cancel',
          rightButton: 'Delete'
        }
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        this._siteService.deleteForm(
          this._hostService.getSiteId(),
          this.id
        ).subscribe((result: any) => {

          if (result.success) {            

            this._router.navigate(['admin/forms']);

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

  onHTMLData(html) {
    this.mainForm.patchValue({
      html: html
    })
  }

}
