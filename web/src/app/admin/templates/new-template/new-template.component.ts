import { Component, OnInit, ElementRef, ViewChild, Inject, PLATFORM_ID, Input } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LayoutService } from '../../../services/layout.service';
import { FormCheckerService } from '../../../services/form-checker.service';
import { TemplateService } from '../../../services/template.service';
import { HostnameService } from '../../../services/hostname.service';

import { Field } from './field';

@Component({
  selector: 'app-new-template',
  templateUrl: './new-template.component.html',
  styleUrls: ['./new-template.component.scss']
})
export class NewTemplateComponent implements OnInit {

  loading: Boolean = true;

  mainForm: FormGroup;
  submitted = false;

  fieldForm: FormGroup;
  submittedField = false;
  fields: Field[] = [];

  @Input() id: string;

  codeMirror: any;
  templateHtml: any;

  @ViewChild('templatehtml') templatehtml: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _fb: FormBuilder, 
    private _snackBar: MatSnackBar,
    private _formCheckerService: FormCheckerService,
    private _layoutSizeService: LayoutService,
    private _hostService: HostnameService,
    private _templateService: TemplateService,
    private _router: Router
  ) {     
  }

  ngOnInit(): void {

    this.createForm();
    this.createFormFields();

    if(!this.id) {      
      this.loading = false;
    }
    else {

      this._templateService.getTemplate(
        this._hostService.getSiteId(), 
        this.id
      ).subscribe((result: any) => {

        this.loading = false;

        if (result.success) {  
          this.createForm(result.data);
                   
        }
        else {
          this.id = null;       

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

  }

  ngAfterViewInit() {

    if (isPlatformBrowser(this.platformId)) {

      var _self = this;
      
      this._layoutSizeService.loadScripts('codemirror', [
        '/assets/codemirror/lib/codemirror.js',
        '/assets/codemirror/mode/xml/xml.js',
        '/assets/codemirror/mode/javascript/javascript.js',
        '/assets/codemirror/mode/css/css.js'
      ], true, true).then(() => {

        
        this.codeMirror = (window as any).CodeMirror;

        this.templateHtml = this.codeMirror.fromTextArea(this.templatehtml.nativeElement, {
          lineNumbers: true,
          mode: 'xml'
        });

        this.templateHtml.on("change", function (cm, change) {
          _self.mainForm.patchValue({
            html: cm.getValue()
          });
        });

      });

    }

  }

  createForm(data?) {

    if(!data) {
      this.mainForm = this._fb.group({
        name: ['', [Validators.required]],
        description: ['', [Validators.required]],
        html: ['', [Validators.required]]
      });       
    }
    else {
      this.mainForm.patchValue({
        name: data.name,
        description: data.description,
        html: data.html
      })

      if(data.fields) {
        for(let field of data.fields) {
          this.fields.push(field);
        }
      }
    }


    
  }

  createFormFields(data?) {
    this.fieldForm = this._fb.group({
      label: [(data && data.label) ? data.label : '', [Validators.required]],
      name: [(data && data.name) ? data.name : '', [Validators.required]]
    });   
  }

  onCkEditorValue(value) {

    this._formCheckerService.formChanged(true);
    
    this.mainForm.patchValue({
      description: value
    });
    
  }

  get f() { return this.mainForm.controls; }

  onSubmit() {

    this.submitted = true;

    console.log('saving / updating template')

    if (this.mainForm.status != "INVALID") {


      let saveService = (!this.id) ? 
      this._templateService.addTemplate(
        this._hostService.getSiteId(),
        this.mainForm.value.name,
        this.mainForm.value.description,
        this.mainForm.value.html,
        this.fields
      ) :
      this._templateService.updateTemplate(
        this._hostService.getSiteId(),
        this.id,
        this.mainForm.value.name,
        this.mainForm.value.description,
        this.mainForm.value.html,
        this.fields
      );


      saveService.subscribe((result: any) => {

        if(result.success) {

          this._formCheckerService.formChanged(false);

          this._router.navigate(['admin/templates']);

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
    else {
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
      });
    }

  }


  get f2() { return this.fieldForm.controls; }

  addField() {

    this.submittedField = true;

    if (this.fieldForm.status != "INVALID") {

      this._formCheckerService.formChanged(true);

      let field = new Field();
      field.name = this.fieldForm.value.name;
      field.label = this.fieldForm.value.label;

      this.fields.push(field);

      this.fieldForm.patchValue({
        name: '',
        label: ''
      });

      this.submittedField = false;

    }

  }

  removeField(index: number) {

    this.fields.splice(index, 1);

  }

}
