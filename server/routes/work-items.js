module.exports = function(router) {
    var models = require('../../models');
    router.route('/work-items')
        .get(function(req, res) {
            var ob = req.query.sortBy ? req.query.sortBy : 'id';
            // TODO: rename this field to eleminate the code.
            if (ob == 'owner') ob = 'owner_userId';
            
            if (req.query.desc) {
                ob = [[ob, 'desc']]
            }

            models.workItem.findAll({
                where: {planId: req.query.planId},
                // TODO: keep only id of owner and creator to reduce data size
                include: [
                    {model: models.user, as: 'owner'},
                    {model: models.user, as: 'createdBy'}],
                order: ob
            }).then(function(items) {
                res.json(items);
            })
        })
        .post(function(req, res) {
            if (!req.body.planId && !req.body.projectId) {
                return res.sendStatus(500);
            }
            
            if (!req.user || !req.user.userId) {
                return res.sendStatus(403);
            }
            
            models.workItem.create({
                type: req.body.type,
                status: 'New',
                estimation: req.body.estimation,
                originEstimation: req.body.estimation,
                title: req.body.title,
                description: req.body.description,
                owner: req.user,
                createdBy: req.user,
                planId: req.body.planId,
                project_id: req.body.projectId,
                points: req.body.points,
                severity: req.body.severity
            }).then(function (item) {
                res.json(item.id);
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        });

    router.route('/work-items/:id')
        .put(function(req, res) {
            models.workItem.findById(req.params.id).then(function(item) {
                // TODO: change this.
                if (req.body.ownerId) {
                    req.body.owner_userId = req.body.ownerId;
                }
                
                item.update(req.body).then(function(item) {
                    res.json(item);
                });
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        })
        .delete(function(req, res){
            models.workItem.findById(req.params.id).then(function(item) {
                console.log('deleting workitem id=' + req.params.id);
                item.destroy().then(function(item) {
                    res.json(req.params.id);
                })
                .catch(function(errors){
                     console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
                });
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        });

    router.route('/work-item/bunch')
        .patch(function(req, res){
            let ids = req.body.ids;
            if (!ids || !ids.length) {
                // TODO: Check and correct.
                return res.sendStatus(404);
            }

            let changes = req.body.changes;
            models.workItem.update(changes, {
                where: {
                    id: { $in: ids }
                }
            }).then(function (affected) {
                res.json(affected);
            })
        });
}