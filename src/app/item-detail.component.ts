import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-item-detail',
  template: `
    <p>
      item-detail Works!
    </p>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ItemDetailComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
