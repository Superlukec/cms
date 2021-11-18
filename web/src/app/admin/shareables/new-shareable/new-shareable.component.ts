import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';
import { AddUserDialogComponent } from '../../../utils/add-user-dialog/add-user-dialog.component';
import { FormCheckerService } from '../../../services/form-checker.service';

@Component({
  selector: 'app-new-shareable',
  templateUrl: './new-shareable.component.html',
  styleUrls: ['./new-shareable.component.scss']
})
export class NewShareableComponent implements OnInit {

  private formSubscription: Subscription;

  subpage: string = 'info';

  sendEmail: boolean = true;
  duration: string = 'false';
  limitDownload: string = 'false';
  limitAccess: string = 'false';  
  selectedUsers: any = [];

  displayedColumns: string[] = ['select', 'email', 'name'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;

  users: any = [];
  files: any = [];
  access: any = [];
  downloaded: any = [];

  loading: Boolean = true;

  mainForm: FormGroup;
  submitted = false;

  @Input() id: string;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;
  addUserDialogRef: MatDialogRef<AddUserDialogComponent>;


  constructor(
    private _dialog: MatDialog,
    private _fb: FormBuilder, 
    private _snackBar: MatSnackBar,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _router: Router,
    private _formCheckerService: FormCheckerService
  ) { }

  get f() { return this.mainForm.controls; }

  ngOnInit() {


    let getData = new Promise((resolve, reject) => {

      if(this.id) {
        this.sendEmail = false;
        this.getShareableInfo(this.id).then((data: any) => {          
          
          if(data.access && data.access.length > 0) {
            for(let a of data.access) {
              this.selectedUsers.push(a.user_id);
            }
          }
          
          this.loading = false;
          this.createForm(data);

          this.downloaded = (data.downloaded) ? data.downloaded : [];

          resolve(true);
        });
      }
      else {        
        this.loading = false;
        this.createForm();
        resolve(true);
      }

    });

    getData.then(() => {
      this.getUsers();
    }); 
    
  }

  getUsers() {
    this._siteService.getShareableUsers(this._hostService.getSiteId()).subscribe((result: any) => {

      if (result.success) {

        if(this.selectedUsers.length > 0) {
          for(let access of this.selectedUsers) {
            for(let user of result.data) {
              if(user._id == access) {
                user.selected = true;
              }
            }
          }
        }

        this.users = result.data;

        this.pagesData = new MatTableDataSource(result.data);      
        this.resultsLength = result.count;

        console.log(result.data);
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

  createForm(data?) {

    this.mainForm = this._fb.group({
      name: [(data && data.name) ? data.name : '', Validators.required],
      duration: [(data && data.duration) ? data.duration : false, Validators.required],
      limitDownload: [(data && data.limit_download) ? data.limit_download : false, Validators.required],
      limitAccess: [(data && data.limit_access) ? data.limit_access : false, Validators.required],
      //password: [(data && data.password) ? data.password : '', [Validators.required, Validators.minLength(6)]],      
    });

    if(data) {
      if(data.duration) {
        this.mainForm.addControl('durationTime', new FormControl((data && data.duration_time) ? data.duration_time : '', [Validators.required]));
        this.duration = data.duration.toString();
      }
      if(data.limit_download) {
        this.mainForm.addControl('downloadNumber', new FormControl((data && data.download_number) ? data.download_number : '', [Validators.required]));
        this.limitDownload = data.limit_download.toString();
      }
      if(data.limit_access) {
        this.limitAccess = data.limit_access.toString();
      }
      if(data.files) {
        for(let f of data.files) {
          this.files.push(f);
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

  onChangeDuration(val) {

    if(val == 'true') {
      if(!this.mainForm.contains('durationTime')) {
        this.mainForm.addControl('durationTime', new FormControl('', [Validators.required]));
      }
    }
    else {
      if(this.mainForm.contains('durationTime')) {
        this.mainForm.removeControl('durationTime');
      }      
    }

    this.mainForm.patchValue({
      duration: val
    });
  }

  onLimitDownloadChange(val) {

    if(val == 'true') {
      if(!this.mainForm.contains('downloadNumber')) {
        this.mainForm.addControl('downloadNumber', new FormControl('', [Validators.required]));
      }
    }
    else {
      if(this.mainForm.contains('downloadNumber')) {
        this.mainForm.removeControl('downloadNumber');
      }      
    }

    this.mainForm.patchValue({
      limitDownload: val
    });

  }

  onLimitAccessChange(val) {

    this.mainForm.patchValue({
      limitAccess: val
    });

  }

  onPasswordChange(data) {
    if(!(data instanceof Event)) {
      this.mainForm.patchValue({
        password: data
      });
    }
  }

  onFileUpload(file) {
    this._formCheckerService.formChanged(true);
    this.files.push(file);
  }

  deleteFile(id) {

    this._siteService.deleteFile(this._hostService.getSiteId(), id).subscribe((result: any) => {

      if (result && result.success) {

        this._formCheckerService.formChanged(true);

        for (let i = 0; i < this.files.length; i++) {
          if (this.files[i]._id == id) {
            this.files.splice(i, 1);
          }
        }

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

  }


  addUser() {
    this.addUserDialogRef = this._dialog.open(
      AddUserDialogComponent,
      {
        width: '750px' //,
        /*data: {
          email: true
        } */       
      }
    );

    this.addUserDialogRef.afterClosed().subscribe(result => {

      if (result) {
        this._formCheckerService.formChanged(true);

        this.selectedUsers.push(result);
        this.getUsers();
      }

    });
  }

  private validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  getShareableInfo(id: string) {
    var promise = new Promise((resolve, reject) => {

      if (!this.id) {
        resolve(null);
      }
      else {

        this._siteService.getShareable(this._hostService.getSiteId(), this.id).subscribe((result: any) => {

          if (result && result.success) {
            resolve(result.data);
          }
          else {
            resolve(null);
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
    return promise;
  }

  deleteShareable() {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'You will delete this shareable',
          text: 'Are you sure that you want to delete this shareable?',
          leftButton: 'Cancel',
          rightButton: 'Delete'
        }
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        this._siteService.deleteShareable(
          this._hostService.getSiteId(),
          this.id
        ).subscribe((result: any) => {

          if (result.success) {

            this._formCheckerService.formChanged(false);

            this._router.navigate(['admin/shareables']);

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


  showPage(page:string) {
    this.subpage = page;
  }

  onSubmit() {

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      if(this.users.length > 0) {
        for(let user of this.users) {
          if(user.selected) {
            this.access.push(user);
          }
        }
      }

      if(this.mainForm.value.limitAccess == 'true' && this.access.length == 0) {
        this._snackBar.open('Add people for access', '', {
          duration: 2000,
        });

        return;
      }

      if(this.files.length == 0) {
          this._snackBar.open('Add files', '', {
            duration: 2000,
          });

          return;
      }


      let saveService = (!this.id) ? this._siteService.addShareable(
        this._hostService.getSiteId(),
        this.mainForm.value.name,
        this.mainForm.value.duration,
        this.mainForm.value.durationTime,
        this.mainForm.value.limitDownload,
        this.mainForm.value.downloadNumber,
        this.mainForm.value.limitAccess,
        this.access,
        this.files,
        this.sendEmail
      ) : 
      this._siteService.updateShareable(
        this._hostService.getSiteId(),
        this.id,
        this.mainForm.value.name,
        this.mainForm.value.duration,
        this.mainForm.value.durationTime,
        this.mainForm.value.limitDownload,
        this.mainForm.value.downloadNumber,
        this.mainForm.value.limitAccess,
        this.access,
        this.files,
        this.sendEmail
      );

      saveService.subscribe((result: any) => {

        if (result && result.success) {

          this._snackBar.open((this.id) ? 'Updated' : 'Saved', '', {
            duration: 2000,
          });

          this.id = result.data;

          this._formCheckerService.formChanged(false);
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

    }
    else {
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
      });
    }

  }

  searchPeople(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.pagesData.filter = filterValue.trim().toLowerCase();
  }

}
