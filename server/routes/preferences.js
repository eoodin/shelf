module.exports = function(router) {
    var models = require('../models');

    router.route('/preferences').get(function(req, res){
        models.preference.findAll({
            where: {
                userId: req.user.id
            },
            attributes: ['name', 'value']
        }).then(function(prefs) {
            var root = {};
            prefs.forEach(function(pref) {
                root[pref.name] = pref.value;
            });

            res.json(root);
        });
    });

    router.route('/preferences/:name').put(function(req, res) {
        models.sequelize.transaction(function(t) {
            return models.preference.findOne({
                where: {
                    name: req.params.name,
                    userId: req.user.id
                }
            }).then(function(exist) {
                if (!exist) {
                    return models.preference.create({
                        name: req.params.name,
                        value: req.body.value,
                        userId: req.user.id
                    }).then(function(item) {
                        res.json({status: 'OK'});
                    });
                }
                else if (exist.value != req.body.value) {
                    return exist.update({
                        value: req.body.value
                    }).then(function(i){
                        res.json({status: 'OK'});
                    });
                }
            });
        }).then(function() {
            console.log('Preference saved');
            res.end();
        }).catch(function(err){
            console.log('Error caught!', err);
            res.sendStatus(500);
        });
    });
};
