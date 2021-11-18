import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';



@Component({
  selector: 'app-add-feature-dialog',
  templateUrl: './add-feature-dialog.component.html',
  styleUrls: ['./add-feature-dialog.component.scss']
})
export class AddFeatureDialogComponent implements OnInit {

  loading:boolean = true;

  mainForm: FormGroup;
  submitted = false;

  constructor(
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dialogRef: MatDialogRef<AddFeatureDialogComponent>,
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
      text: [(data && data.text) ? data.text : '']      
    });
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
