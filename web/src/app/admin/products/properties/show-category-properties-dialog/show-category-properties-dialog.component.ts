import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-show-category-properties-dialog',
  templateUrl: './show-category-properties-dialog.component.html',
  styleUrls: ['./show-category-properties-dialog.component.scss']
})
export class ShowCategoryPropertiesDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

}
