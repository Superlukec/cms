import { Component, OnInit, Inject, PLATFORM_ID, ElementRef, Input, Output,EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { CkeditorLoaderService } from '../../ckeditor/ckeditor-loader.service';
import { CkeditorCustomLinkDialogComponent } from '../ckeditor-custom-link-dialog/ckeditor-custom-link-dialog.component';

@Component({
  selector: 'app-ckeditor',
  templateUrl: './ckeditor.component.html',
  styleUrls: ['./ckeditor.component.scss']
})
export class CkeditorComponent implements OnInit {

  //editorText: string;

  editor: any;
  el: any;
  editorRef: any;

  @Input() data: string;  
  /*
  @Input() set data(data: string) {
    this.editorText = data;

    if(this.editorRef) {
      this.editorRef.setData((this.editorText) ? this.editorText : '');
    }

  } */
  @Input()  config: any;  
  @Output() output = new EventEmitter<any>();

  linkDialogRef: MatDialogRef<CkeditorCustomLinkDialogComponent>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ckLoaderService: CkeditorLoaderService,
    private _dialog: MatDialog,
    el: ElementRef
  ) {
    this.el = el;

    if (isPlatformBrowser(this.platformId)) {


      var self = this;

      this.loadCkEditor().then(() => {

        if(!this.config) {
          this.config = {};
        }

        // default fonts from theme -- fontFamily
        this.config['fontFamily'] = {
          options: [
              'default'
          ]
        }    
        
        this.config['heading'] = {
            options: [              
              { 
                model: 'display1', 
                view: {
                  name: 'div',
                  classes: 'display-1'
                },
                title: 'Display 1',
                class: 'ck-heading_display1'
              },
              { 
                model: 'display2', 
                view: {
                  name: 'div',
                  classes: 'display-2'
                },
                title: 'Display 2',
                class: 'ck-heading_display2'
              },
              { 
                model: 'display3', 
                view: {
                  name: 'div',
                  classes: 'display-3'
                },
                title: 'Display 3',
                class: 'ck-heading_display3'
              },
              { 
                model: 'display4', 
                view: {
                  name: 'div',
                  classes: 'display-4'
                },
                title: 'Display 4',
                class: 'ck-heading_display4'
              },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { 
                model: 'lead', 
                view: {
                  name: 'div',
                  classes: 'lead'
                },
                title: 'Lead',
                class: 'ck-heading_lead'
              }

            ]
        }


        
        this.config['simpleButton'] = 
          [
            {
                name: "myLink",
                label: "Link",
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M11.077 15l.991-1.416a.75.75 0 1 1 1.229.86l-1.148 1.64a.748.748 0 0 1-.217.206 5.251 5.251 0 0 1-8.503-5.955.741.741 0 0 1 .12-.274l1.147-1.639a.75.75 0 1 1 1.228.86L4.933 10.7l.006.003a3.75 3.75 0 0 0 6.132 4.294l.006.004zm5.494-5.335a.748.748 0 0 1-.12.274l-1.147 1.639a.75.75 0 1 1-1.228-.86l.86-1.23a3.75 3.75 0 0 0-6.144-4.301l-.86 1.229a.75.75 0 0 1-1.229-.86l1.148-1.64a.748.748 0 0 1 .217-.206 5.251 5.251 0 0 1 8.503 5.955zm-4.563-2.532a.75.75 0 0 1 .184 1.045l-3.155 4.505a.75.75 0 1 1-1.229-.86l3.155-4.506a.75.75 0 0 1 1.045-.184z" /></svg>',
                syncDisabledState: false,
                onClick: (buttonView) => { 
                  console.log('lasten button mamojebači')  
                  
                  this.linkDialogRef = this._dialog.open(
                    CkeditorCustomLinkDialogComponent,
                    {
                      width: '550px',                      
                    }
                  );

                  this.linkDialogRef.afterClosed().subscribe(result => {

                    if (result) {
                      this.editorRef.execute( 'link', result );
                    }

                  });                                

                }
            },
          ]
        
        if(this.config['toolbar'] && this.config['toolbar'].length > 0) {

          for(let i = 0; i < this.config['toolbar'].length; i++) {

            if(this.config['toolbar'][i] == 'link') {
              this.config['toolbar'][i] = 'myLink';
            }
          }

        }

        
        this.editor
          .create(this.el.nativeElement.children[0], this.config) //(this.config) ? this.config : {})
          .then(editor => {

            this.editorRef = editor;  

            /**
             * Setting the data
             */          
            this.editorRef.setData((this.data) ? this.data : '');
            /**
             * Getting the data from CKEditor
             */
            this.editorRef.model.document.on( 'change:data', () => {
              
              this.output.emit(this.editorRef.getData());//JSON.stringify(editor.getData()));

            });

            
            
            const command = editor.commands.get( 'link' );

            command.on( 'isEnabled', ( evt, name, isEnabled ) => {
                if ( isEnabled ) {
                    console.log( 'Whoa, you can undo some stuff now.' );
                } else {
                    console.log( 'There is nothing to undo in the editor.' );
                }
            } )

          })
          .catch(error => {
  
            console.error(error);
            this.editorRef = null;
  
          });
  
      });
  
    }

  }

  ngOnInit() { }
  
  loadCkEditor() {

    return new Promise(resolve => {

      if (!this.ckLoaderService.isReady()) {

        this.ckLoaderService.setUpCkEditor().then((editor) => {
          this.editor = editor;
          resolve(editor);
        });        

      }
      else {

        this.editor = this.ckLoaderService.getEditorObject();
        resolve(this.editor);

      }

    });

  }

}
