import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';

import { SendInquiryDialogComponent } from '../../public/send-inquiry-dialog/send-inquiry-dialog.component';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'my-button',
  templateUrl: './my-button.component.html',
  styleUrls: ['./my-button.component.scss']
})
export class MyButtonComponent implements OnInit {

  options: any;

  @Input() postId: string;
  @Input() blockId: string;
  @Input() childId: string;

  sendInquiryDialogRef: MatDialogRef<SendInquiryDialogComponent>;  

  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {

    this._siteService.getBlockInfo(
      this._hostService.getSiteId(),
      this.postId,
      this.blockId,
      this.childId
    ).subscribe((result: any) => {

      if (result.success) {

        if(result.data.options) {
          this.options = result.data.options;          
        }

      }

    });
  }

  action(): void {
    if(this.options) {

      switch(this.options.button_action) {

        case 'form': {

          if(this.options.button_actionvalue) {

            let formId = this.options.button_actionvalue;
            let checkID = new RegExp("^[0-9a-fA-F]{24}$");

            if (formId && checkID.test(formId)) {

              this.sendInquiryDialogRef = this._dialog.open(
                SendInquiryDialogComponent,
                {
                  width: '350px',
                  data: {
                    formId: formId
                  }
                }
              );
            }
              
          }

          break;
        }
        default: {

          if(this.options.button_link) {
            this.document.location.href = this.options.button_link;
          }                   

          break;
        }

      }

    }
  }

}
