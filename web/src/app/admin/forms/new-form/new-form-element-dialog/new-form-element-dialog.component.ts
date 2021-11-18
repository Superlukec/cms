import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-new-form-element-dialog',
  templateUrl: './new-form-element-dialog.component.html',
  styleUrls: ['./new-form-element-dialog.component.scss']
})
export class NewFormElementDialogComponent implements OnInit {

  mainForm: FormGroup;
  submitted = false;

  constructor(
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _dialogRef: MatDialogRef<NewFormElementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    

    if(this.data) {
      this.createForm(this.data);
    }
    else {
      this.createForm();
    }

  }

  /**
   * We create the form
   * @param data
   */
  createForm(data?) {
    this.mainForm = this._fb.group({
      label: [(data && data.label) ? data.label : '', Validators.required],      
      name: [(data && data.name) ? data.name : '', Validators.required],
      type: [(data && data.type) ? data.type : '', Validators.required],
      required: [(data && data.required) ? data.required : false]            
    });
  }

  onSubmit() {
    this.submitted = true;
    
    console.log('saving / updating forms')

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
