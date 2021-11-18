import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-page-menu',
  templateUrl: './add-page-menu.component.html',
  styleUrls: ['./add-page-menu.component.scss']
})
export class AddPageMenuComponent implements OnInit {

  loading: boolean = true;
  pages: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<AddPageMenuComponent>
  ) { }

  ngOnInit() {

    if(this.data.pagesList && this.data.pagesList.length > 0) {      
      this.pages = JSON.parse(JSON.stringify(this.data.pagesList));

      for(let page of this.pages) {
        page.selected = false;
      }

    }
    this.loading = false;

  }

  addToMenu() {
    
    this._dialogRef.close(this.pages);
    
  }

}
