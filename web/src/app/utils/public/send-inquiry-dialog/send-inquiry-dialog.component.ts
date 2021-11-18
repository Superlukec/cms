import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { copyFileSync } from 'fs';

@Component({
  selector: 'app-send-inquiry-dialog',
  templateUrl: './send-inquiry-dialog.component.html',
  styleUrls: ['./send-inquiry-dialog.component.scss']
})
export class SendInquiryDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<SendInquiryDialogComponent>,
  ) { }

  ngOnInit(): void {
    if(this.data && !this.data.formId) {
      setTimeout(() => {
        this._dialogRef.close();
      }, 500);      
    }
  }

  onFormCompleted(event) {
    this._dialogRef.close();
  }

}
