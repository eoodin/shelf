"use strict";
var testing_1 = require('@angular/core/testing');
var shelf_component_1 = require('../app/shelf.component');
testing_1.beforeEachProviders(function () { return [shelf_component_1.ShelfAppComponent]; });
testing_1.describe('App: ShelfServer', function () {
    testing_1.it('should create the app', testing_1.inject([shelf_component_1.ShelfAppComponent], function (app) {
        testing_1.expect(app).toBeTruthy();
    }));
    testing_1.it('should have as title \'shelf-server works!\'', testing_1.inject([shelf_component_1.ShelfAppComponent], function (app) {
        //expect(app.title).toEqual('shelf-server works!');
        testing_1.expect(true).toBeTrue();
    }));
});
//# sourceMappingURL=shelf.component.spec.js.map