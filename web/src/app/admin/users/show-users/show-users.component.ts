import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';




@Component({
  selector: 'app-show-users',
  templateUrl: './show-users.component.html',
  styleUrls: ['./show-users.component.scss']
})
export class ShowUsersComponent implements OnInit {


  loading: boolean = true;
  displayedColumns: string[] = ['full_name', 'email', 'activated', 'role', 'action'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;
  filter: string;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;


  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this._siteService.getUsers(this._hostService.getSiteId()).subscribe((result: any) => {

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

  deleteUser(userid: string) {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'You will delete this user',
          text: 'Are you sure that you want to delete this user?',
          leftButton: 'Cancel',
          rightButton: 'Delete'
        }
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {

      if (result) {

        this._siteService.deleteUser(this._hostService.getSiteId(), userid).subscribe((result: any) => {


          if (result.success) {
            this.getUsers();

            this._snackBar.open('User deleted successfully', '', {
              duration: 2000,
            });
          }
          else {
            this._snackBar.open(result.message, '', {
              duration: 2000,
            });
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

    });


  }

}
