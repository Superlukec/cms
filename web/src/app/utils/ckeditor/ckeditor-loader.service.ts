import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CkeditorLoaderService {

  editor: any;
  isLoaded: boolean = false;
  inProgress: boolean = false;
  //ckeditorSourceCDN = 'https://cdn.ckeditor.com/ckeditor5/15.0.0/inline/ckeditor.js';
  ckeditorSourceCDN = '/assets/ckeditor5-inline/build/ckeditor.js?v=' + Date.now();

  constructor() { }

  setProgress(progress: boolean) {
    this.inProgress = progress;
  }

  isProgress() {
    return this.inProgress;
  }

  setLoaded(loaded: boolean) {
    this.isLoaded = loaded;
  }

  isReady() {
    return this.isLoaded;
  }

  setEditorObject(editor: Object) {
    this.editor = editor;
  }

  getEditorObject() {
    return this.editor;
  }

  getCKEditorCDN() {
    return this.ckeditorSourceCDN;
  }
  
  /**
   * Loading CKEditor
   */
  setUpCkEditor() {

    return new Promise(resolve => {

      const jsElmCK = document.createElement('script');
      jsElmCK.type = 'application/javascript';
      jsElmCK.src = this.getCKEditorCDN();  
      document.body.appendChild(jsElmCK);
      jsElmCK.onload = () => {

        if(!this.editor) { 
          this.editor = (window as any).InlineEditor;

          this.isLoaded = true;
        }

        resolve(this.editor);

      };

    });

  }
  
}
