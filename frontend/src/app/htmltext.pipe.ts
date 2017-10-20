import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'htmltext'
})
export class HtmltextPipe implements PipeTransform {
  private domPaser;

  transform(value: any, args?: any): any {
    if (value == null) { return ''; }
    if (typeof value !== 'string') {
      throw new Error('html text pipe cannot handle type ' + (typeof value));
    }

    if (!this.domPaser) {
      this.domPaser = new DOMParser();
    }

    return  this.domPaser.parseFromString(value, 'text/html').documentElement.textContent;
  }
}
