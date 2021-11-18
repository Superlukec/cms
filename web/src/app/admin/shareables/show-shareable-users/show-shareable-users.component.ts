import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';
import { AddUserDialogComponent } from '../../../utils/add-user-dialog/add-user-dialog.component';

@Component({
  selector: 'app-show-shareable-users',
  templateUrl: './show-shareable-users.component.html',
  styleUrls: ['./show-shareable-users.component.scss']
})
export class ShowShareableUsersComponent implements OnInit {


  loading: boolean = true;
  displayedColumns: string[] = ['email', 'full_name', 'activated', 'role', 'action'];
  pagesData: MatTableDataSource<any>;
  resultsLength = 0;
  filter: string;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;
  addUserDialogRef: MatDialogRef<AddUserDialogComponent>;


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
    this._siteService.getShareableUsers(this._hostService.getSiteId()).subscribe((result: any) => {

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

  
  editUser(userid: string) {

      this.addUserDialogRef = this._dialog.open(
        AddUserDialogComponent,
        {
          width: '750px',
          data: {
            id: userid
          }
        }
      );
  
      this.addUserDialogRef.afterClosed().subscribe(result => {
  
        if (result) {
  
        }
  
      });
      
  }

  addUser() {
    this.addUserDialogRef = this._dialog.open(
      AddUserDialogComponent,
      {
        width: '750px'        
      }
    );

    this.addUserDialogRef.afterClosed().subscribe(result => {

      if (result) {

      }

    });
  }

}
