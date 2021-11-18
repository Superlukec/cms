import { Component, OnInit, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<AddUserDialogComponent>
  ) { }

  ngOnInit() {
    if(!this.data) {
      this.data = {};
    }
  }

  onSave(data) {
    this._dialogRef.close(data._id);
  }

}
