import {
  Component,
  OnInit, OnDestroy, Input, Output,
  ElementRef, ViewContainerRef, ViewChild, EventEmitter
} from 'angular2/core';
import { NgIf, NgClass } from 'angular2/common';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'modal-dialog',
  directives: [NgIf, NgClass],
  template: `
  <div class="modal fade in awd" [style.display]="_show ? 'block' : 'none'"
     role="dialog">
    <div class="modal-dialog" [style.width]="'720px'">
        <div class="modal-content">
            <div class="modal-header">
                <button #closeBtn type="button" class="close" (click)="_close($event)">&times;</button>
                <h4 class="modal-title">{{title}}</h4>
            </div>
            <div class="modal-body">
                <ng-content select="[dialog-body]"></ng-content>
            </div>
            <div class="modal-footer">
                <ng-content select="[dialog-footer]"></ng-content>
            </div>
        </div>
    </div>
  </div>`,
  styles: ['']
})
export class ModalDialog implements OnInit, OnDestroy {
  private _show: boolean = false;

  @Output()
  public showChange: EventEmitter<boolean> = new EventEmitter();

  @Input()
  public title: string;

  @ViewChild("closeBtn") closeBtn;

  constructor(private el:ElementRef) {

  }

  @Input()
  public set show(isShow: boolean) {
    this._show = isShow;
    if (isShow) {
      // TODO: remove ungly focus?
      setTimeout(() => this.closeBtn.nativeElement.focus(), 0);
    }
  }

  ngOnInit() {
    this.keySubscription = Observable.fromEvent(this.el.nativeElement, 'keyup')
        .filter(k => k.keyCode == 27)
        .subscribe(esc => this._close(esc));

  }

  ngOnDestroy() {
    this.keySubscription.unsbscribe();
  }

  _close(event) {
    this._show  = false;
    this.showChange.next(this._show);
  }
}
