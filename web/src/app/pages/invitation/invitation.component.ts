import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { PageInfoService } from '../../services/page-info.service';
import { InvitationService } from '../../services/invitation.service';
import { HostnameService } from '../../services/hostname.service';





@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss']
})
export class InvitationComponent implements OnInit {

  loading: Boolean = true;
  invitationId: string;
  invitationFound: Boolean;

  step: Number = 1;
  email: string;
  userInfo: any = {};

  mainForm: FormGroup;
  submitted = false;

  constructor(
    private _titleService: Title,
    private _pageInfoService: PageInfoService,    
    private _hostService: HostnameService,
    private _invitationService: InvitationService,
    private _route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _fb: FormBuilder
  ) { 
  }

  ngOnInit() {
    //this._pageInfoService.hideHeader();
    this._titleService.setTitle('Invitation');

    this.invitationId = this._route.snapshot.paramMap.get('id');

    this._invitationService.getInvitation(this._hostService.getSiteId(), this.invitationId).subscribe((result: any) => {

      this.loading = false;

      if(result.success) {
        this.invitationFound = true;
        this.userInfo = result.data;
      }
      else {
        this.invitationFound = false;
      }

    }, err => {
      if (err.status != 200) {
        this.loading = false;
        this.invitationFound = false;

        this._snackBar.open('Error on the server', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  get f() { return this.mainForm.controls; }

  createForm(data?) {

    this.email = (data && data.email) ? data.email : '';

    this.mainForm = this._fb.group({
      first_name: [(data && data.first_name) ? data.first_name : '', Validators.required],
      last_name: [(data && data.last_name) ? data.last_name : '', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  continue() {
    this.step = 2;
    this.createForm(this.userInfo);
  }

  onPasswordChange(data) {
    if(!(data instanceof Event)) {
      this.mainForm.patchValue({
        password: data
      });
    }
  }

  onSubmit() {

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      this._invitationService.approveInvitation(
        this._hostService.getSiteId(), 
        this.invitationId,
        this.mainForm.value.first_name,
        this.mainForm.value.last_name,
        this.mainForm.value.password
      ).subscribe((result: any) => {
        
        if(result.success) {
          this.step = 3;
        }
        else {
          this._snackBar.open(result.message, '', {
            duration: 2000,
          });
        }
        

      }, err => {
        if (err.status != 200) {
          this.loading = false;
          this.invitationFound = false;
  
          this._snackBar.open('Error on the server', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });

    }
   
  }

}
