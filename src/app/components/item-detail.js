"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var rich_editor_ts_1 = require('./rich-editor.ts');
var modal_dialog_ts_1 = require('./modal-dialog.ts');
var ItemDetail = (function () {
    function ItemDetail(jsonp, ele) {
        this.jsonp = jsonp;
        this.ele = ele;
        this._show = false;
        this._item = {};
        this._type = 'Task';
        this.closed = new core_1.EventEmitter();
        this.saved = new core_1.EventEmitter();
    }
    Object.defineProperty(ItemDetail.prototype, "show", {
        set: function (p) {
            this._show = p;
            !p && this.closed.emit(null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ItemDetail.prototype, "item", {
        set: function (i) {
            this._item = i;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ItemDetail.prototype, "type", {
        set: function (t) {
            this._type = t;
        },
        enumerable: true,
        configurable: true
    });
    ItemDetail.prototype.saveWorkItem = function () {
        var _this = this;
        var data = JSON.parse(JSON.stringify(this._item));
        if (!data['id']) {
            this.jsonp.post('/api/work-items/', JSON.stringify(data))
                .subscribe(function (resp) { return _this.saved.emit(resp); });
        }
        else {
            this.jsonp.put('/api/work-items/' + data['id'], JSON.stringify(data))
                .subscribe(function (resp) { return _this.saved.emit(resp); });
        }
        this.show = false;
    };
    __decorate([
        core_1.Output()
    ], ItemDetail.prototype, "closed");
    __decorate([
        core_1.Output()
    ], ItemDetail.prototype, "saved");
    __decorate([
        core_1.Input()
    ], ItemDetail.prototype, "show");
    __decorate([
        core_1.Input()
    ], ItemDetail.prototype, "item");
    __decorate([
        core_1.Input()
    ], ItemDetail.prototype, "type");
    ItemDetail = __decorate([
        core_1.Component({
            selector: 'item-detail',
            template: "\n    <modal-dialog [(show)]=\"show\" [title]=\"(_item.id ? 'Item Details' : 'Add Item')\">\n        <div dialog-body class=\"item-details\">\n            <form (ngSubmit)=\"saveWorkItem()\">\n                <div class=\"row\" >\n                    <div class=\"col-sm-12\">\n                        Type:\n                        <select *ngIf=\"!_item.id\" [(ngModel)]=\"_item.type\" [disabled]=\"_type\">\n                            <option value=\"UserStory\" selected=\"selected\">User Story</option>\n                            <option value=\"Task\">Task</option>\n                            <option value=\"Defect\">Defect</option>\n                        </select>\n                        <span *ngIf=\"_item.id\">{{_item.type}}</span>\n                    </div>\n                </div>\n                <div *ngIf=\"_item.type == 'Defect'\" class=\"row\">\n                    <div class=\"col-sm-12\">Severity:\n                        <label><input #s1 type=\"radio\" [checked]=\"_item.severity==s1.value\" (click)=\"_item.severity=s1.value\" value=\"Blocker\">Blocker</label>\n                        <label><input #s2 type=\"radio\" [checked]=\"_item.severity==s2.value\" (click)=\"_item.severity=s2.value\" value=\"Critical\">Critical</label>\n                        <label><input #s3 type=\"radio\" [checked]=\"_item.severity==s3.value\" (click)=\"_item.severity=s3.value\" value=\"Major\">Major</label>\n                        <label><input #s4 type=\"radio\" [checked]=\"_item.severity==s4.value\" (click)=\"_item.severity=s4.value\" value=\"Minor\">Minor</label>\n                    </div>\n                </div>\n                <div *ngIf=\"_item.type == 'Defect'\" class=\"row\">\n                    <div class=\"col-sm-12\">Found in:\n                        <input [(ngModel)]=\"_item.version\">\n                    </div>\n                </div>\n                <div class=\"row\">\n                    <div class=\"col-sm-12\">\n                        Title: <input type=\"text\" class=\"work-item-title\" [(ngModel)]=\"_item.title\">\n                    </div>\n                </div>\n                <div class=\"row\">\n                    <div class=\"col-sm-12\">Description:</div>\n                </div>\n                <div class=\"row\">\n                    <div class=\"col-sm-12\">\n                        <rich-editor [content]=\"_item.description\" (update)=\"_item.description = $event\"></rich-editor>\n                    </div>\n                </div>\n                <div *ngIf=\"_item.type == 'Task'\" class=\"row\">\n                    <div class=\"col-sm-12\">Effort Estimation: <input type=\"text\" [(ngModel)]=\"_item.estimation\"></div>\n                </div>\n                <div class=\"row\" *ngIf=\"_item.type == 'UserStory'\">\n                    <div class=\"col-sm-12\">Story Points: <input type=\"text\" [(ngModel)]=\"_item.points\" value=\"0\"></div>\n                </div>\n            </form>\n        </div>\n        <div dialog-footer>\n            <button (click)=\"saveWorkItem()\" class=\"btn btn-default\">{{(_item.id ? 'Save' : 'Add')}}</button>\n        </div>\n    </modal-dialog>\n    ",
            directives: [rich_editor_ts_1.RichEditor, modal_dialog_ts_1.ModalDialog],
            styles: ["\n    .item-details { padding-left: 0;}\n    .item-details li { list-style:none; margin-bottom: 10px;}\n    .item-details li:last-child { margin-bottom: 0;}\n    .item-details li .title { font-weight: 700; }\n    .item-details li .big-section { display: block;}\n    .item-details .row {margin: 8px 0;}\n     "]
        })
    ], ItemDetail);
    return ItemDetail;
}());
exports.ItemDetail = ItemDetail;
//# sourceMappingURL=item-detail.js.map