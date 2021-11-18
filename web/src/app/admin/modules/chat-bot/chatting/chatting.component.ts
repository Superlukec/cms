import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';

import { SocketService } from '../../../../services/socket.service';
import { SiteService } from '../../../../services/site.service';
import { HostnameService } from '../../../../services/hostname.service';
import { ConfirmDialogComponent } from '../../../../utils/confirm-dialog/confirm-dialog.component';



@Component({
  selector: 'app-chatting',
  templateUrl: './chatting.component.html',
  styleUrls: ['./chatting.component.scss']
})
export class ChattingComponent implements OnInit {

  socket: any;

  loading: boolean = true;
  displayedColumns: string[] = ['opened', 'closed', 'chat_id', 'user_info', 'messages', 'date_created', 'action'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;
  filter: string;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  @ViewChild(MatPaginator) paginator: MatPaginator;


  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _socketService: SocketService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.socket = this._socketService.getSocket();

    this.socket.on('new message', (data: any) => {
      this.getChats();
    });

    this.getChats();
  }

  getChats(): void {
    this._siteService.getChats(this._hostService.getSiteId()).subscribe((result: any) => {

      this.loading = false;

      if (result.success) {
        this.pagesData = new MatTableDataSource(result.data);

        this.pagesData.paginator = this.paginator;

        this.resultsLength = result.count;
      }

    }, err => {
      if (err.status != 200) {
        this._snackBar.open('Error on the server', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteChat(chat_id) :void {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'You will delete this chat',
          text: 'Are you sure that you want to delete this chat?',
          leftButton: 'Cancel',
          rightButton: 'Delete'
        }
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        this._siteService.deleteChat(
          this._hostService.getSiteId(),
          chat_id
        ).subscribe((result: any) => {

          if (result.success) {

            this.getChats();

          }
          else {
            this._snackBar.open('Error. Please try again.', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }


        }, err => {

          if (err.status != 200) {
            // snackbar
            this._snackBar.open('Error', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }
        });

      }

    });

  }

}
