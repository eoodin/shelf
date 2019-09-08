module.exports = function(router) {
    const models = require('../models');
    router.route('/users/me').get(function(req, res) {
        models.user.findOne({
                include: [models.role, {model: models.team, as: 'teams'}],
                where: {id: req.user.id}}).then(function(user) {
            res.json(user);
        });
    });

    router.route('/users').get(function(req, res) {
        models.user.findAll().then(function(users) { res.json(users); });
    });
};
