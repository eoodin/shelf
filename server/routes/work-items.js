module.exports = function(router) {
    var models = require('../../models');
    var csv = require('../modules/csv');
    router.route('/work-items')
        .get(function(req, res) {
            var ob = req.query.sortBy ? req.query.sortBy : 'id';
            // TODO: rename this field to eleminate the code.
            if (ob == 'owner') ob = 'owner_userId';
            
            if (req.query.desc) {
                ob = [[ob, 'desc']]
            }
            let where = {};
            if (req.query.projectId) {
                where = {projectId: req.query.projectId};
            }
            else if (req.query.planId) {
                where = {planId: req.query.planId}; 
            }

            if (req.query.types) {
                let types = req.query.types.split(',');
                where['type'] = {$in : types}
            }

            if (req.query.status) {
                let status = req.query.status.split(',');
                where['status'] = {$in : status};
            }

            models.workItem.findAll({
                where: where,
                // TODO: keep only id of owner and creator to reduce data size
                include: [
                    {model: models.user, as: 'owner'},
                    {model: models.user, as: 'createdBy'}],
                order: ob
            }).then(function(items) {
                if ('csv' == req.query.format) {
                    res.set('Content-disposition', 'attachment; filename=plan' + (req.query.planId ? req.query.planId : '') + '.csv');
                    res.set('Content-Type', 'text/csv');
                    return csv(res, items, [
                        'id',
                        'status',
                        'type',
                        'title', 
                        { field: 'createdBy', title: 'Creator', map: function(f) { return f == null ? 'Unknonwn' : f.name; } },
                        { field: 'owner', title: 'Owner', map: function(f) { return f == null ? 'Unassigned' : f.name; } }, 
                        { field: 'originalEstimation', title: 'Original estimation'}, 
                        { field: 'estimation', title: 'Remaining'}]);
                }

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
            
            models.user.findById(req.user.userId).then(function(u) {
                let def = {
                    type: req.body.type,
                    status: 'New',
                    state: 'Created',
                    estimation: (req.body.estimation || 0),
                    originalEstimation: (req.body.estimation || 0),
                    title: req.body.title,
                    description: req.body.description,
                    owner: u, // TODO:  check why not working
                    createdBy: u,
                    planId: (req.body.planId || null),
                    projectId: (req.body.projectId || null),
                    points: req.body.points,
                    severity: req.body.severity
                };
                console.log('Definition composed', def);
                var item = models.workItem.build(def);
                item.save().then(function (item) {
                    res.json(item.id);
                })
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

                var origin = {};
                var changes = {};
                for(let f in req.body) {
                    // TODO: optimistic lock?
                    if (f == 'updatedAt' || f == 'createdAt') {
                        continue;
                    }
                    
                    if (item[f] != req.body[f]) {
                        origin[f] = item[f];
                        changes[f] = req.body[f];
                    }
                    
                    if (item.type == 'Task') {
                        let toFinish = false;
                        if (f == 'estimation' && req.body[f] == 0) {
                            origin.status = item.status;
                            changes.status = 'Finished';
                            toFinish = true;
                        }
                        else if (f == 'status' && req.body.status == 'Finished') {
                            origin.estimation = item.estimation;
                            changes.estimation = 0;
                            toFinish = true;
                        }

                        if (toFinish && item.parent_id) {
                            console.log('Finding defect for task ' + item.parent_id);
                            models.workItem.findOne({
                                where: {
                                    type: 'Defect',
                                    id : item.parent_id
                                }
                            }).then(function(defect) {
                                if (!defect) { return; }

                                console.log('automatically change relevant defect status.');
                                if (defect.state == 'Fixing') {
                                    defect.update({
                                        state: 'Fixed'
                                    }).then(function() {});
                                }
                                else if (defect.state = 'Testing') {
                                    defect.update({
                                        state: 'Tested'
                                    }).then(function() {});
                                }
                            });
                        }
                    }
                    
                }

                item.update(changes).then(function(item) {
                    models.changeLog.create({
                        originalData: JSON.stringify(origin),
                        changedData: JSON.stringify(changes),
                        actor_userId: req.user.userId,
                        item_id: item.id
                    }).then(function() {
                        res.json(item);
                    });
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