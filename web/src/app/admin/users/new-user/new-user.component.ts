import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss']
})
export class NewUserComponent implements OnInit {

  loading: Boolean = true;

  registrationType: String = 'add';

  mainForm: FormGroup;
  submitted = false;
  
  @Input() id: string;
  @Input() role: string;
  @Input() dialog: string;
  @Input() disableEmail: boolean;
  @Output() save = new EventEmitter<any>(); 

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _fb: FormBuilder, 
    private _snackBar: MatSnackBar,
    private _hostService: HostnameService,
    private _router: Router
  ) { }

  ngOnInit() {
    console.log(this.disableEmail);

    if(!this.id) {      
      this.loading = false;
      this.createForm();
    }
    else {

      this._siteService.getUser(this._hostService.getSiteId(), this.id).subscribe((result: any) => {

        this.loading = false;
  
        if (result.success) {  
          console.log('podatki')        
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

  /**
   * We create the form
   * @param data
   */
  createForm(data?) {
    this.mainForm = this._fb.group({
      email: [(data && data.email) ? data.email : '', [Validators.required, Validators.email]],
      password: ['', (!data) ? [Validators.required, Validators.minLength(6)] : null],
      first_name: [(data && data.first_name) ? data.first_name : '', Validators.required],
      last_name: [(data && data.last_name) ? data.last_name : '', Validators.required],
      company: [(data && data.company) ? data.company : ''],
      role: [(data && data.role != undefined) ? data.role : (this.role) ? this.role : '3', Validators.required],
      message: [''],
    });    

  }

  get f() { return this.mainForm.controls; }

  onPasswordChange(data) {
    if(!(data instanceof Event)) {
      this.mainForm.patchValue({
        password: data
      });
    }
  }

  onRoleChange(data) {
    if(!(data instanceof Event)) {
      this.mainForm.patchValue({
        role: data
      });
    }
  }

  onChangeRegType(type) {
    if(type == "add") {
      if(!this.mainForm.contains('password')) {
        this.mainForm.addControl('password', new FormControl('', [Validators.required]));
      }
    }
    else {
      // we hide        
      if(this.mainForm.contains('password')) {
        this.mainForm.removeControl('password');
      }  
    }
  }

  onSubmit() {

    this.submitted = true;

    console.log('saving / updating user')

    if (this.mainForm.status != "INVALID") {

      let saveService = (!this.id) ? 
        this._siteService.addUser(
          this._hostService.getSiteId(), 
          this.registrationType,
          this.mainForm.value.email,
          this.mainForm.value.role,
          this.mainForm.value.first_name,
          this.mainForm.value.last_name,
          this.mainForm.value.password,
          this.mainForm.value.company,
          this.mainForm.value.message,
          this.disableEmail
        ) : 
        this._siteService.updateUser(
          this._hostService.getSiteId(), 
          this.id,
          this.mainForm.value.email,
          this.mainForm.value.role,
          this.mainForm.value.first_name,
          this.mainForm.value.last_name,
          this.mainForm.value.password,
          this.mainForm.value.company
        );      

      saveService.subscribe((result: any) => {
            
        if(result.success) {

          if(this.dialog) {
            this.save.emit(result.data);
          }
          else {
            this._router.navigate(['admin/users']);
          }

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

}
