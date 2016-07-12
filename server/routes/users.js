module.exports = function(route) {
    var models = require('../../models');
    route.get('/me', function(req, res) {
        models.user.find({
                include: [models.role],
                where: {userId: 'jefliu'}}).then(function(user) {               
            res.send(user);
        });
    });
    
    route.get('/:uid/preferences', function(req, res){
        let uid = req.params.uid;
        if (!uid) {
            res.sendStatus(404);
            return;
        }
        
        //TODO: Load preferences
        res.send([]);
    });
    
    route.put('/:uid/preferences', function(req, res) {
        if (!req.query.name || !req.params.uiduid) {
            res.sendStatus(500);
            return;
        }
        
        // TODO: save preference
        res.send({status: 'OK'});
    });
    
}