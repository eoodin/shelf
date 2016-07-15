module.exports = function(router) {
    var models = require('../../models');
    router.route('/users/me').get(function(req, res) {
        models.user.find({
                include: [models.role],
                where: {userId: 'jefliu'}}).then(function(user) {               
            res.json(user);
        });
    });
}