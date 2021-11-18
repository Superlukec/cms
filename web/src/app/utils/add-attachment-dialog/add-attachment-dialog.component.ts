import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { HostnameService } from '../../services/hostname.service';
import { SiteService } from '../../services/site.service';


@Component({
  selector: 'app-add-attachment-dialog',
  templateUrl: './add-attachment-dialog.component.html',
  styleUrls: ['./add-attachment-dialog.component.scss']
})
export class AddAttachmentDialogComponent implements OnInit {

  loading:boolean = true;

  mainForm: FormGroup;
  submitted = false;

  file: any;

  constructor(
    private _hostService: HostnameService,
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _siteService: SiteService,
    private _dialogRef: MatDialogRef<AddAttachmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  get f() { return this.mainForm.controls; }

  ngOnInit() {
    this.createForm(this.data);
    this.loading = false;
  }

  createForm(data?) {
    this.mainForm = this._fb.group({
      icon: [(data && data.icon) ? data.icon : '', Validators.required],
      name: [(data && data.name) ? data.name : '', Validators.required],
      file: [(data && data.file) ? data.file : '', Validators.required]      
    });

    console.log(data.file)

    if(data && data.file) {
      this.file = data.file;
    }
  }

  selectedIcon(icon: string) {
    this.mainForm.patchValue({
      icon: icon
    });
  }

  onCkEditorValue(text) {
    this.mainForm.patchValue({
      text: text
    });
  }

  onFileUpload(file) {
    console.log('file')
    console.log(file);
    this.file = file;

    this.mainForm.patchValue({
      file: this.file
    });
  }

  deleteAttachment(id: string) {
    console.log('Briši etečment ' + id)

    this._siteService.deleteFile(this._hostService.getSiteId(), id).subscribe((result: any) => {

      if (result && result.success) {

        this.file = null;

        this._snackBar.open('Deleted', '', {
          duration: 2000,
        });

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

  onSubmit() {

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {



      this._dialogRef.close(this.mainForm.value);
    }
    else {
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
      });
    }

  }

}
