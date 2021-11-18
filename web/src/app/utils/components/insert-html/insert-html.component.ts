import { Component, OnInit, Input, ElementRef, ViewChild, Output, EventEmitter, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-insert-html',
  templateUrl: './insert-html.component.html',
  styleUrls: ['./insert-html.component.scss']
})
export class InsertHtmlComponent implements OnInit {

  @Input() data: string;
  @Output() output = new EventEmitter<any>();

  codeMirror: any;
  htmlEditor: any;
  htmldata: String;
  @ViewChild('html') html: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _layoutSizeService: LayoutService
  ) { }

  ngOnInit() {
    this.htmldata = this.data;
  }

  ngAfterViewInit() {

    if (isPlatformBrowser(this.platformId)) {

      var _self = this;

      //import('CodeMirror').then(codeMirror => {
      this._layoutSizeService.loadScripts('codemirror', [
        '/assets/codemirror/lib/codemirror.js',
        '/assets/codemirror/mode/xml/xml.js',
        '/assets/codemirror/mode/javascript/javascript.js',
        '/assets/codemirror/mode/css/css.js'
      ], true, true).then(() => {

        this.codeMirror = (window as any).CodeMirror;;

        this.htmlEditor = this.codeMirror.fromTextArea(this.html.nativeElement, {
          lineNumbers: true,
          mode: 'xml'
        });

        this.htmlEditor.on("change", function (cm, change) {
          _self.htmldata = cm.getValue();      

          _self.output.emit(cm.getValue());           

        });

      });

    }

  }

}
