module.exports = function(router) {
    var models = require('../models');
    router.route('/teams').get(function(req, res){
        // TODO: check permission?
        models.team.findAll().then(function(teams){
            res.json(teams);
        });
    });

    router.route('/team/:tid').get(function(req, res){
        if (!req.params.tid) {
            res.sendStatus(500);
            return;
        }
        let incs = [];
        if (req.query.members) {
            incs.push({model: models.user, as: 'members'});
        }

        models.team.findOne({
            where: {id: req.params.tid},
            include: incs
        }).then(function(team) {
            res.json(team);
        });
    });
};
