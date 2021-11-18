import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-add-menu-category',
  templateUrl: './add-menu-category.component.html',
  styleUrls: ['./add-menu-category.component.scss']
})
export class AddMenuCategoryComponent implements OnInit {

  mainForm: FormGroup;
  submitted = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<AddMenuCategoryComponent>,
    private _snackBar: MatSnackBar,
    private _fb: FormBuilder,
    private _siteService: SiteService
  ) { }

  ngOnInit(): void {
    this.createForm(this.data);    
  }

  createForm(data?) {
    this.mainForm = this._fb.group({
      name: [(data && data.category) ? data.category : '', Validators.required],      
    });

  }

  onSubmit() {

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      this._dialogRef.close(this.mainForm.value.name);

    }
    else {
      this._snackBar.open('Please enter category name', '', {
        duration: 2000,
      });
    }

  }

}
