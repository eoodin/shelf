module.exports = function(route) {
    var models = require('../../models');
    route.get('/', function(req, res){
        //TODO: Load preferences
        res.send([]);
    });
    
    route.put('/:name', function(req, res) {
        // TODO: save preference
        res.send({status: 'OK'});
    });
}