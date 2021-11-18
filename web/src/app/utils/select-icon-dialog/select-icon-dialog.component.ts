import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-select-icon-dialog',
  templateUrl: './select-icon-dialog.component.html',
  styleUrls: ['./select-icon-dialog.component.scss']
})
export class SelectIconDialogComponent implements OnInit {

  icon: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<SelectIconDialogComponent>
  ) { }

  ngOnInit(): void {

    if(this.data && this.data.icon) {
      this.icon = this.data.icon;
    }

  }

  selectedIcon(icon: string) {
    this.icon = icon;
  }

  submit() {
    this._dialogRef.close(this.icon);
  }

}
