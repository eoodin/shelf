module.exports = function(route) {
    var models = require('../../models');
    route.get('/me', function(req, res) {
        models.user.find({
                include: [models.role],
                where: {userId: 'jefliu'}}).then(function(user) {               
            res.send(user);
        });
    });
}