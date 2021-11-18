import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { InstallSiteService } from '../services/install-site.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss']
})
export class InstallComponent implements OnInit {

  mainForm: FormGroup;
  submitted = false;

  constructor(
    private _fb: FormBuilder, 
    private _installService: InstallSiteService,
    private _snackBar: MatSnackBar,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.mainForm = this._fb.group({
      title: ['', [Validators.required]],
      domain: ['', Validators.required],
      email: ['', Validators.required, Validators.email],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]] 
    });
  }

  get f() { return this.mainForm.controls; }

  onSubmit() {

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      this._installService.install(
        this.mainForm.value.title,
        this.mainForm.value.domain,
        this.mainForm.value.email,
        this.mainForm.value.firstName,
        this.mainForm.value.lastName,
        this.mainForm.value.password
      ).subscribe((result: any) => {  

        if(result.success) {

          this._snackBar.open('Your site was added successfully', '', {
            duration: 2000,
          });

          this._router.navigate(['login']);
        }

      }, err => {

        if(err.status != 200) {
          this._snackBar.open('Please enter all values', '', {
            duration: 2000,
          });
        }

      });

    }

  }

}
