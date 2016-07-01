"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var WorkItems = (function () {
    function WorkItems(jsonp, prjs) {
        this.jsonp = jsonp;
        this.prjs = prjs;
    }
    WorkItems = __decorate([
        core_1.Component({
            selector: 'work-items',
            //directives: [WorkItemDetail, ModalDialog, DROPDOWN_DIRECTIVES],
            template: "\n    <h2> Under development... </h2>\n    ",
            styles: [""]
        })
    ], WorkItems);
    return WorkItems;
}());
exports.WorkItems = WorkItems;
//# sourceMappingURL=workitems.js.map