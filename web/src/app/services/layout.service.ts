import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private currentSize: number;
  currentSize$ = new BehaviorSubject<number>(0);

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }

  setSize(size: number) {
    this.currentSize = size;
    this.currentSize$.next(size);
  }

  getSize() {
    return this.currentSize;
  }

  loadStyle(elementName: string, styleName: string) {

    return new Promise((resolve, reject) => {

      const head = this.document.getElementsByTagName('head')[0];

      let themeLink = this.document.getElementById(
        elementName
      ) as HTMLLinkElement;
      if (themeLink) {
        themeLink.href = styleName;
      } else {
        const style = this.document.createElement('link');
        style.id = elementName;
        style.rel = 'stylesheet';
        style.href = `${styleName}` + '?v=' + Date.now();
        style.onload = () => { 
          console.log('style has loaded'); 
          resolve();
        };
        head.appendChild(style);
      }

    });
  }

  /**
   * Load one script at the time
   * @param elementName 
   * @param javascriptName 
   * @param async 
   * @param catching 
   */
  loadScript(elementName: string, javascriptName: string, async?: boolean, catching?: boolean) {    

    return new Promise((resolve, reject) => {

      var _async = (async) ? async : false
      var isFound = false;
     
      if(document.getElementById(elementName)) {
        isFound = true;
      }

      if (!isFound) {
        var dynamicScripts = [javascriptName];

        for (var i = 0; i < dynamicScripts.length; i++) {
            let node = document.createElement('script');
            node.src = dynamicScripts[i] + ((catching) ? ('?v=' + Date.now()) : '');
            node.id = elementName;
            node.type = 'text/javascript';
            node.onload = () => { 
              //console.log('script has loaded'); 
              resolve();
            };
            node.async = _async;
            node.charset = 'utf-8';
            document.getElementsByTagName('head')[0].appendChild(node);
        }

      }
      else {
        resolve();
      }

    });
  }

  /**
   * Load multiple scripts at the time
   * @param elementName 
   * @param javascript 
   * @param async 
   * @param catching 
   */
  loadScripts(elementName: string, javascript: string[], async?: boolean, catching?: boolean) {    

    return new Promise((resolve, reject) => {

      var _async = (async) ? async : false
      var isFound = false;
     
      if(document.getElementById(elementName + '-0')) {
        
        for (var i = 0; i < javascript.length; i++) {
          if(document.getElementById(elementName + '-' + i)) {
            document.getElementById(elementName + '-' + i).remove();
          }          
        }
        
        //isFound = true;
      }

      if (!isFound) {
        var dynamicScripts = javascript;

        async function iterateAndLoadScripts() {
          for (var i = 0; i < dynamicScripts.length; i++) {
            await new Promise((res, rej) => {

              let node = document.createElement('script');
              node.src = dynamicScripts[i] + ((catching) ? ('?v=' + Date.now()) : '');
              node.id = elementName + '-' + i;
              node.type = 'text/javascript';
              node.onload = () => { 
                //console.log('script has loaded'); 
                res();
              };
              node.async = _async;
              node.charset = 'utf-8';
              document.getElementsByTagName('head')[0].appendChild(node);

            });            
          }
        }

        iterateAndLoadScripts().then(function (result) {
          resolve();
        });

        
      }
      else {
        resolve();
      }

    });


  }

  removeElementsById(id: any []) {
    if(id && id.length > 0) {
      for(let i = 0; i < id.length; i++) {
        if(document.getElementById(id[i])) {
          document.getElementById(id[i]).remove();
        }
      }
    }
  }
}
