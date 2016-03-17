import {
  Component,
  OnInit, Input, Output,
  ElementRef, ViewContainerRef, EventEmitter
} from 'angular2/core';
import { NgIf, NgClass } from 'angular2/common';

@Component({
  selector: 'modal-dialog',
  directives: [NgIf, NgClass],
  template: `
  <div class="modal fade in awd" *ngIf="!closed" [style.display]="closed ? 'block' : 'block'"
     role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" (click)="onClose($event)"
                        data-dismiss="modal">&times;</button>
                <h4 class="modal-title">{{title}}</h4>
            </div>
            <div class="modal-body">
                <ng-content></ng-content>
            </div>
            <div class="modal-footer">
                <button (click)="onClose($event)" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
  </div>`
})
export class ModalDialog implements OnInit {
  @Output() public close:EventEmitter<ModalDialog> = new EventEmitter();
  @Input public closed:boolean;
  private title:string;

  constructor(public el:ElementRef) {
  }

  ngOnInit() {
  }

  onClose() {
    this.close.next(this);
    this.closed = true;
  }
}
