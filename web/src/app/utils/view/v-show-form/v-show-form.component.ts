import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';

declare var $: any;

@Component({
  selector: 'app-v-show-form',
  templateUrl: './v-show-form.component.html',
  styleUrls: ['./v-show-form.component.scss']
})
export class VShowFormComponent implements OnInit {

  mainForm: FormGroup;
  submitted = false;
    
  loading: boolean = true;
  customHTML: boolean = false;
  html: string = '';
  form: any;

  @Input() id: any;
  @Output() completed = new EventEmitter<any>();

  constructor(
    private _fb: FormBuilder,
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _router: Router
  ) { }

  ngOnInit(): void {

    this._siteService.getFormPublic(this._hostService.getSiteId(), this.id).subscribe((result: any) => {

      if(result.success) {
        
        this.form = result.data;

        // custom HTML
        if(result.data.html && result.data.html != '') {
          this.customHTML = true;
          this.html = result.data.html;
          this.loading = false;
        }
        else {
          this.mainForm = this._fb.group({});          
          this.createForm(this.form.elements);
        }

      }
      else {
        this.loading = false;
      }


    }, err => {
        this.loading = false;
    });

  }

  createForm(elements) {
    for(let el of elements) {
      if(el.required) { 
        this.mainForm.addControl(el.name, new FormControl('', [Validators.required]));
      }
      else {
        this.mainForm.addControl(el.name, new FormControl(''));
      }
      
    }

    this.loading = false;
  }

  get f() { return this.mainForm.controls; }

  getFormValue(name: string) {    
    return (this.mainForm.controls[name].status != "INVALID") ? true : false;
  }

  onSubmit() {
    this.submitted = true;


    if (this.mainForm.status != "INVALID") {

      this._siteService.postFormPublic(
        this._hostService.getSiteId(), 
        this.id, 
        this.mainForm.value,
        this._router.url
      ).subscribe((result: any) => {

        if(result.success) {

          if(this.completed) {
            this.completed.emit(true);
          }

          this.submitted = false;

          this.mainForm.reset();

          this._snackBar.open('Poslano', '', {
            duration: 2000,
          });
        }
        else {
          this._snackBar.open('Error', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
  
  
      }, err => {
        this._snackBar.open('Error', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      });
      
    }
    
  }

  @HostListener('click', ['$event', '$event.target']) 
  onClick($event: MouseEvent, targetElement: HTMLElement){

    if(this.customHTML) {

      if($(targetElement).attr('type') == 'submit') {

        let formCorrect = true;
        let formValue = {};

        $('#' + this.id + ' input').each(
          function(index){  

            if($(this).attr('type') != 'submit') {

              if($(this).attr('required')) {

                if(!$(this).val()) {
                  $(this).addClass('is-invalid');

                  formCorrect = false;
                }
                else {
                  formValue[$(this).attr('name')] = $(this).val();
                }

              }             

            }

            
          }
        );


        if(formCorrect) {

          this._siteService.postFormPublic(
            this._hostService.getSiteId(), 
            this.id, 
            formValue,
            this._router.url
          ).subscribe((result: any) => {
    
            if(result.success) {
    
              if(this.completed) {
                this.completed.emit(true);
              }

              $('#' + this.id + ' input').each(
                function(index){

                  if($(this).attr('type') != 'submit') {
                    $(this).val('');
                    $(this).removeClass('is-invalid');
                  }

                }
              );              
    
              this._snackBar.open('Poslano', '', {
                duration: 2000,
              });
            }
            else {
              this._snackBar.open('Error', '', {
                duration: 2000,
                panelClass: ['error-snackbar']
              });
            }
      
      
          }, err => {
            this._snackBar.open('Error', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          });
          
        }

      }
      /*      
      console.log($event)
      console.log(targetElement)
      console.log(this.id)*/

    }

  }

}
