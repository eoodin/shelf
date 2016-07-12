module.exports = function(route) {
    var models = require('../../models');
    route.get('/:tid/members', function(req, res){
        if (!req.params.tid) {
            res.status(404).send({error: 'Team ID not specified.'});
            return;
        }
        
        models.team.findOne({
            where: {id: req.params.tid},
            include: [models.user]
        }).then(function(team) {
            // TODO: rename team.users => team.members ?
            res.send(team.users);
        });
    });
}