import { Component, OnInit, Inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-image-dimension-dialog',
  templateUrl: './image-dimension-dialog.component.html',
  styleUrls: ['./image-dimension-dialog.component.scss']
})
export class ImageDimensionDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _snackBar: MatSnackBar
  ) { }

  copied(event) {
    if(event && event.isSuccess) {
      this._snackBar.open('Copied', '', {
        duration: 2000,
      });
    }
  }

  ngOnInit(): void {
  }

}
