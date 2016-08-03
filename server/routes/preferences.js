module.exports = function(router) {
    var models = require('../../models');

    router.route('/preferences').get(function(req, res){
        models.preference.findAll({
            where: {
                userId: req.user.userId
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
                    userId: req.user.userId 
                }
            }).then(function(exist) {
                if (!exist) {
                    console.log('Saving ' + req.params.name +' ' + req.body.value);
                    return models.preference.create({
                        name: req.params.name,
                        value: req.body.value,
                        userId: req.user.userId
                    }).then(function(item) {
                        res.json({status: 'OK'});
                    });
                }
                else if (exist.value != req.body.value) {
                    console.log('Updating ' + req.params.name +' from ' + exist.value + ' to ' + req.body.value);
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
}