declare var $:any;    // ? todo - je potrebno?
import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[lsResizable]'
})
export class ResizableDirective {

  constructor(
    private _el: ElementRef
  ) { }

  ngAfterViewInit() {
    $(this._el.nativeElement).resizable();
  }

}
