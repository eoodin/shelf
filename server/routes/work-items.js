module.exports = function(route) {
    var models = require('../../models');
    route.get('/', function(req, res) {
        if (!req.query.planId) {
            //TODO: change planId as required param, and send 404 if not specified.
            res.send([]);
        }
        
        models.workItem.findAll({
            where: {planId: req.query.planId},
            include: [
                {model: models.user, as: 'owner'},
                {model: models.user, as: 'createdBy'}]
        }).then(function(items) {
            res.send(items);
        })
    });

    route.post('/', function(req, res) {
        console.log('request', req.rawBody);
        res.send('hello');
    });
}