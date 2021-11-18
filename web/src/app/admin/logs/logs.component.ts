import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ServerLogsService } from '../../services/server-logs.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class LogsComponent implements OnInit {

  displayedColumns: string[] = ['timestamp', 'level', 'context', 'message'];
  loading: boolean;
  logs: MatTableDataSource<any>;
  resultsLength = 0; 

  mainForm: FormGroup;
  submitted = false;

  hours: any[] = []
  minutes: any[] = []

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _fb: FormBuilder, 
    private _logsService: ServerLogsService,
    private _snackBar: MatSnackBar
  ) { 
    this.createForm();
  }

  createForm(data?) {

    if(!data) {

      let start_date = new Date();
      start_date.setDate(start_date.getDate() - 1);

      data = {
        start_date: start_date,
        start_hours: start_date.getHours(),
        start_minutes: start_date.getMinutes(),
        end_date: new Date(),
        end_hours: start_date.getHours(),
        end_minutes: start_date.getMinutes()
      }
      
    }

    this.mainForm = this._fb.group({      
      start_date: [data.start_date, Validators.required],
      start_hours: [data.start_hours, Validators.required],
      start_minutes: [data.start_minutes, Validators.required],
      end_date: [data.end_date, Validators.required],
      end_hours: [data.end_hours, Validators.required],
      end_minutes: [data.end_minutes, Validators.required]
    });

  }

  reset() {
    this.createForm();
    this.onSearch();
  }

  // convenience getter for easy access to form fields
  get f() { return this.mainForm.controls; }

  onSearch() {

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      this.loading = true;

      
      let start_date = new Date(this.mainForm.value.start_date);
      let end_date = new Date(this.mainForm.value.end_date);
      
      start_date.setHours(this.mainForm.value.start_hours);
      start_date.setMinutes(this.mainForm.value.start_minutes);

      end_date.setMinutes(this.mainForm.value.end_hours);
      end_date.setMinutes(this.mainForm.value.end_minutes);
      
      let set_date = {
        start_date: start_date,
        end_date: end_date
      }
      
      this._logsService.getServerLogs(set_date).subscribe((data: any) => {

        this.loading = false;
    
        if(data.success) {

          this.logs = new MatTableDataSource(data.logs);
          //this.logs.paginator = this.paginator;
          setTimeout(() => this.logs.paginator = this.paginator); // quickfix

          this.resultsLength = data.logs.length;

        }
        else {
          this._snackBar.open(data.message, '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }

      }, err => {         
        if(err.status != 200) { 
          this.loading = false;

          this._snackBar.open('Error getting system status: ' + err.status, '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });

    }
    else {
      this._snackBar.open('Please fill the fields', '', {
        duration: 2000,
        panelClass: ['error-snackbar']
      });
    }

  }


  ngOnInit() {
    this.loading = true;

    for(let i = 0; i < 24; i++) {      
      this.hours.push( i );
    }

    for(let i = 0; i < 60; i++) {
      this.minutes.push( i );
    }

    this._logsService.getServerLogs().subscribe((data: any) => {

      this.loading = false;
    
      if(data.success) {

        this.logs = new MatTableDataSource(data.logs);
        //this.logs.paginator = this.paginator;
        setTimeout(() => this.logs.paginator = this.paginator); // quickfix

        this.resultsLength = data.logs.length;

      }
      else {
        this._snackBar.open(data.message, '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
      
    }, err => {         
      if(err.status != 200) { 
        this.loading = false;

        this._snackBar.open('Error getting system status: ' + err.status, '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });

    
  }


  /**
   * 
   * length: 24
     pageIndex: 0
     pageSize: 15
     previousPageIndex: 1
   */
  onPaginateChange(event) {
    console.log(event);    
  }

}
