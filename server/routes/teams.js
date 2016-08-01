module.exports = function(router) {
    var models = require('../../models');
    router.route('/teams').get(function(req, res){
        // TODO: check permission?
        models.team.findAll().then(function(teams){
            res.json(teams);
        });
    });


    router.route('/teams/:tid/members').get(function(req, res){
        if (!req.params.tid) {
            res.sendStatus(404)
            return;
        }
        
        models.team.findOne({
            where: {id: req.params.tid},
            include: [models.user]
        }).then(function(team) {
            // TODO: rename team.users => team.members ?
            res.json(team.users);
        });
    });
}