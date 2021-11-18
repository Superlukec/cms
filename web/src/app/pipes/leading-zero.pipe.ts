import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'leadingZero'
})
export class LeadingZeroPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    let number = parseInt(value);    
    return (number < 10) ? ('0' + value) : value;
  }

}
