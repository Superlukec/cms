import { Directive, ElementRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Directive({
  selector: '[routeDirective]'
})
export class RouteDirective {

  currentUrl: string;

  constructor(
    private _el: ElementRef,
    private _router: Router,
    private _route: ActivatedRoute,
    private el: ElementRef
  ) {

    /**
     * Look for route change
     */

    this.currentUrl = this._router.url;
    
    
    this._router.events.subscribe((val) => {

      if(val instanceof NavigationEnd) {
        this.currentUrl = val.url;
        
        this.addLinkClass(this._el.nativeElement.querySelectorAll('a'));
      }

    });


  }

  ngAfterViewInit() {
    this.addLinkClass(this._el.nativeElement.querySelectorAll('a'));
  }

  /**
   * Add active class to the element
   */
  addLinkClass(elements: [any]) {

    
    if(elements && elements.length > 0) {

      //or(let elem of elements) {
      for(let i = 0; i < elements.length; i++) {

        if(elements[i] instanceof Element) {
          let link = elements[i].getAttribute('href');

          if(this.currentUrl.indexOf(link) > 0) {
            
            elements[i].parentElement.classList.add('active');

          }
          else {
            if (elements[i].parentElement.classList.contains('active')) {
              elements[i].parentElement.classList.remove('active');
            }
          }

        }

      }

    }

  }

  /**
   * Look for href attribute and stop them from working in default behaviour
   * @param $event 
   */
  @HostListener('click', ['$event']) onClick($event){

    /**
     * We prevent default behaviour
     */
    $event.preventDefault();

    

    if($event.target.getAttribute('href')) {      
      this._router.navigate([$event.target.getAttribute('href')]);      
    }
    else {
      if($event.target.parentElement.getAttribute('href')) {   
        this._router.navigate([$event.target.parentElement.getAttribute('href')]);      
      }
    }

  }
  

}
