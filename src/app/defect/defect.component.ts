import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-defect',
  template: `
    <p>
      defect Works!
    </p>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DefectComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
