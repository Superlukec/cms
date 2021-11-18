import { Component, OnInit, Inject, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isPlatformBrowser } from '@angular/common';

import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-large-code-dialog',
  templateUrl: './large-code-dialog.component.html',
  styleUrls: ['./large-code-dialog.component.scss']
})
export class LargeCodeDialogComponent implements OnInit {

  newCode: any;

  codeMirror: any;
  codeEditor: any;
  @ViewChild('code') code: ElementRef;  

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<LargeCodeDialogComponent>,
    private _layoutSizeService: LayoutService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      this.newCode = this.data.code;

      var _self = this;
            
      this._layoutSizeService.loadScripts('codemirror', [
        '/assets/codemirror/lib/codemirror.js',
        '/assets/codemirror/mode/xml/xml.js',
        '/assets/codemirror/mode/javascript/javascript.js',
        '/assets/codemirror/mode/css/css.js'
      ], true, true).then(() => {

        // console.log(this.newCode)

        this.codeMirror = (window as any).CodeMirror;

        this.codeEditor = this.codeMirror.fromTextArea(this.code.nativeElement, {
          lineNumbers: true,
          mode: 'xml',          
        });

        this.codeEditor.setSize(null, 700);
        this.codeEditor.getDoc().setValue(this.newCode);

        this.codeEditor.on("change", function (cm, change) {
          _self.newCode = cm.getValue();
        });

      });

    }

  }

  close() {
    this._dialogRef.close(this.newCode);
  }

}
