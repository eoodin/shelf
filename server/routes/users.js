module.exports = function(router) {
    var models = require('../models');
    router.route('/users/me').get(function(req, res) {
        models.user.find({
                include: [models.role],
                include: [models.team],
                where: {id: req.user.id}}).then(function(user) {
            res.json(user);
        });
    });

    router.route('/users').get(function(req, res) {
        models.user.all().then(users => res.json(users));
    });
};
