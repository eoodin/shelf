"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var common_1 = require('@angular/common');
var Rx_1 = require('rxjs/Rx');
var ModalDialog = (function () {
    function ModalDialog(el) {
        this.el = el;
        this._show = false;
        this.showChange = new core_1.EventEmitter();
    }
    Object.defineProperty(ModalDialog.prototype, "show", {
        set: function (isShow) {
            var _this = this;
            this._show = isShow;
            if (isShow) {
                // TODO: remove ungly focus?
                setTimeout(function () { return _this.closeBtn.nativeElement.focus(); }, 0);
            }
        },
        enumerable: true,
        configurable: true
    });
    ModalDialog.prototype.ngOnInit = function () {
        var _this = this;
        this.keySubscription = Rx_1.Observable.fromEvent(this.el.nativeElement, 'keyup')
            .filter(function (k) { return k['keyCode'] == 27; })
            .subscribe(function (esc) { return _this._close(esc); });
    };
    ModalDialog.prototype.ngOnDestroy = function () {
        this.keySubscription && this.keySubscription.unsubscribe();
    };
    ModalDialog.prototype._close = function (event) {
        this._show = false;
        this.showChange.next(this._show);
    };
    __decorate([
        core_1.Output()
    ], ModalDialog.prototype, "showChange");
    __decorate([
        core_1.Input()
    ], ModalDialog.prototype, "title");
    __decorate([
        core_1.ViewChild("closeBtn")
    ], ModalDialog.prototype, "closeBtn");
    __decorate([
        core_1.Input()
    ], ModalDialog.prototype, "show");
    ModalDialog = __decorate([
        core_1.Component({
            selector: 'modal-dialog',
            directives: [common_1.NgIf, common_1.NgClass],
            template: "\n  <div class=\"modal fade in awd\" [style.display]=\"_show ? 'block' : 'none'\"\n     role=\"dialog\">\n    <div class=\"modal-dialog\" [style.width]=\"'720px'\">\n        <div class=\"modal-content\">\n            <div class=\"modal-header\">\n                <button #closeBtn type=\"button\" class=\"close\" (click)=\"_close($event)\">&times;</button>\n                <h4 class=\"modal-title\">{{title}}</h4>\n            </div>\n            <div class=\"modal-body\">\n                <ng-content select=\"[dialog-body]\"></ng-content>\n            </div>\n            <div class=\"modal-footer\">\n                <ng-content select=\"[dialog-footer]\"></ng-content>\n            </div>\n        </div>\n    </div>\n  </div>",
            styles: ['']
        })
    ], ModalDialog);
    return ModalDialog;
}());
exports.ModalDialog = ModalDialog;
//# sourceMappingURL=modal-dialog.js.map