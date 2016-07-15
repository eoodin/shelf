module.exports = function(router) {
    var models = require('../../models');

    router.route('/preferences').get(function(req, res){
        //TODO: Load preferences
        res.json([]);
    });
    
    router.route('/preferences/:name').put(function(req, res) {
        // TODO: save preference
        res.json({status: 'OK'});
    });
}