import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';
import { FormCheckerService } from '../../../services/form-checker.service';

@Component({
  selector: 'app-new-transfer',
  templateUrl: './new-transfer.component.html',
  styleUrls: ['./new-transfer.component.scss']
})
export class NewTransferComponent implements OnInit {

  private formSubscription: Subscription;

  files: any = [];

  loading: Boolean = true;

  mainForm: FormGroup;
  submitted = false;

  constructor(
    private _fb: FormBuilder,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _router: Router,
    private _snackBar: MatSnackBar
  ) { }

  get f() { return this.mainForm.controls; }

  ngOnInit(): void {
    
    this.loading = false;

  }

  onSubmit() {

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

    }
    else {
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
      });
    }

  }

  deleteFile(id) {

    this._siteService.deleteFile(this._hostService.getSiteId(), id).subscribe((result: any) => {

      if (result && result.success) {

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

  onFileUpload(file) {
    this.files.push(file);

    this._snackBar.open('File uploaded', '', {
      duration: 2000,
    });
  }

}
