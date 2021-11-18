import { Directive, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { SiteService } from '../services/site.service';
declare var $;

@Directive({
  selector: '[generateHTML]'
})
export class GenerateHTMLDirective {

  html: any;

  @Input() set generateHTML(html: string) {
    this.html = html;
    this.htmlGenerator();
  }

  @Output() onFinish = new EventEmitter<any>();

  constructor(
    private _element: ElementRef,    
    private _siteService: SiteService
  ) {     
  }

  /**
   * Function for generating 
   */
  htmlGenerator() {
    let d = new Date();
    console.log('Start ' + d.getMilliseconds());
    //this._element.nativeElement.innerHTML = (this.html);
    $(this._element.nativeElement).html(this.html);
  }
  
  ngAfterViewInit() { 
    console.log('Finished')
    let d = new Date();
    console.log('End ' + d.getMilliseconds());   
    if(this.onFinish) {
      setTimeout(() => {
        this.onFinish.emit(true);
      }, 100)
    }
  }

}
