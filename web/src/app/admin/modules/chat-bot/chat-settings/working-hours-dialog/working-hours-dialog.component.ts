import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-working-hours-dialog',
  templateUrl: './working-hours-dialog.component.html',
  styleUrls: ['./working-hours-dialog.component.scss']
})
export class WorkingHoursDialogComponent implements OnInit {

  formvalid: boolean = true;

  multi: boolean = false;
  weekDays: any[] = [];
  errors: any[] = [];
  day: any;

  hours: any[] = new Array(24);
  minutes: any[] = new Array(60);

  mainForm: FormGroup;
  submitted = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<WorkingHoursDialogComponent>,
    private _fb: FormBuilder, 
    private _snackBar: MatSnackBar
  ) { }

  get f() { return this.mainForm.controls; }


  ngOnInit(): void {

    if(this.data) {
      this.multi = (this.data.multi != undefined) ? this.data.multi : false;
      this.weekDays = (this.data.weekDays) ? this.data.weekDays : [];
      this.day = (this.data.day) ? this.data.day : null;
    }

    if(this.day) {

      // if single

      this.mainForm = this._fb.group({
        fromHour: [(this.day.fromHour) ? ('' + this.day.fromHour) : ('' + 0), Validators.required],
        fromMinutes: [(this.day.fromMinutes) ? ('' + this.day.fromMinutes) : ('' + 0), Validators.required],
        toHour: [(this.day.toHour) ? ('' + this.day.toHour) : ('' + 0), Validators.required],
        toMinutes: [(this.day.toMinutes) ? ('' + this.day.toMinutes) : ('' + 0), Validators.required]
      });

    }
    else {

      // if multidays

      this.mainForm = this._fb.group({
        weekdays: this.weekDays
      });

    }    
  }

  changeTime(fieldName: string, index? : number) {

    this.formvalid = true;

    if(index == undefined) {

      switch(fieldName) {

        case 'fromHour': {

          let from = parseInt(this.mainForm.value[fieldName])
          let to = parseInt(this.mainForm.value.toHour);          

          if(from < to) {
            this.errors[fieldName] = null;

            if(this.errors['toHour']) {
              this.errors['toHour'] = null;
            }
          }
          else {
            this.errors[fieldName] = true;
            this.errors['toHour'] = true;

            this.formvalid = false;
          }

          break;
        }        
        case 'toHour': {

          let to = parseInt(this.mainForm.value[fieldName])
          let from = parseInt(this.mainForm.value.fromHour);

          if(from < to) {
            this.errors[fieldName] = null;

            if(this.errors['fromHour']) {
              this.errors['fromHour'] = null;
            }
          }
          else {
            this.errors[fieldName] = true;
            this.errors['fromHour'] = true;

            this.formvalid = false;
          }

          break;
        }        
        default: {
          break;
        }

      }

      

    }
    else {

      let to = parseInt(this.weekDays[index].toHour);
      let from = parseInt(this.weekDays[index].fromHour);

      if(from < to) {
        this.weekDays[index].error = false;
      }
      else {
        this.weekDays[index].error = true;

        this.formvalid = false;
      }

    }

  }  

  onSubmit(): void {
    this.submitted = true;

    if (this.mainForm.status != "INVALID" && this.formvalid) {

      if(this.day) {
        this._dialogRef.close(this.mainForm.value);
      }
      else {
        this._dialogRef.close(this.weekDays);
      }
      
    }
    else {

      this._snackBar.open('Please check for form errors', '', {
        duration: 2000,
      });

    }
  }

}
