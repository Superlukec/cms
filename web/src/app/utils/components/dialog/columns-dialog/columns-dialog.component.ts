import { Component, OnInit, Inject } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-columns-dialog',
  templateUrl: './columns-dialog.component.html',
  styleUrls: ['./columns-dialog.component.scss']
})
export class ColumnsDialogComponent implements OnInit {

  numberOfColumns: Number = 3;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }

}
