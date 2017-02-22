module.exports = function(router) {
    var models = require('../models');
    var csv = require('../modules/csv');
    router.route('/tasks')
        .get(function(req, res) {
            var ob = req.query.sortBy ? req.query.sortBy : 'id';
            // TODO: rename this field to eleminate the code.
            if (ob == 'owner') ob = 'ownerId';

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
            
            if (req.query.parent) {
                where['parentId'] = req.query.parent == 'null' ? null : req.query.parent;
            }

            if (req.query.types) {
                let types = req.query.types.split(',');
                where['type'] = {$in : types}
            }

            if (req.query.status) {
                let status = req.query.status.split(',');
                where['status'] = {$in : status};
            }

            models.task.findAll({
                where: where,
                // TODO: keep only id of owner and creator to reduce data size
                include: [
                    {model: models.user, as: 'owner'},
                    {model: models.user, as: 'creator'}
                ],
                order: ob
            }).then(function(tasks) {   
                if ('csv' == req.query.format) {
                    res.set('Content-disposition', 'attachment; filename=plan' + (req.query.planId ? req.query.planId : '') + '.csv');
                    res.set('Content-Type', 'text/csv');
                    return csv(res, tasks, [
                        'id',
                        'status',
                        'type',
                        'title',
                        { field: 'creator', title: 'Creator', map: function(f) { return f == null ? 'Unknonwn' : f.name; } },
                        { field: 'owner', title: 'Owner', map: function(f) { return f == null ? 'Unassigned' : f.name; } },
                        { field: 'originalEstimation', title: 'Original estimation'},
                        { field: 'estimation', title: 'Remaining'}]);
                }

                res.json(tasks);
            })
        })
        .post(function(req, res) {
            if (!req.body.planId && !req.body.projectId) {
                return res.sendStatus(500);
            }

            if (!req.user || !req.user.id) {
                return res.sendStatus(403);
            }

            models.user.findById(req.user.id).then(function(u) {
                let def = {
                    type: req.body.type,
                    parentId: req.body.parentId,
                    status: 'New',
                    state: 'Created',
                    estimation: (req.body.estimation || 0),
                    originalEstimation: (req.body.estimation || 0),
                    title: req.body.title,
                    description: req.body.description,
                    ownerId: u.id,
                    creatorId: u.id,
                    planId: (req.body.planId || null),
                    projectId: (req.body.projectId || null),
                    points: req.body.points,
                    severity: req.body.severity
                };
                var task = models.task.build(def);
                task.save().then(function (task) {
                    res.json(task.id);
                })
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        })
        .patch(function(req, res){
            let ids = req.body.ids;
            if (!ids || !ids.length) {
                return res.sendStatus(404);
            }

            let changes = req.body.changes;
            console.log(JSON.stringify(changes));
            models.task.update(changes, {
                where: {
                    id: { $in: ids }
                }
            }).then(function (affected) {
                res.json(affected);
            })
        });

    router.route('/task/:id')
        .get(function(req, res) {
            models.task.findById(req.params.id).then(function(task) {
                res.json(task);
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        })
        .patch(function(req, res) {
            models.task.findById(req.params.id).then(function(task) {
                var origin = {};
                var changes = {};
                for(let f in req.body) {
                    if (f == 'updatedAt' || f == 'createdAt') {
                        continue;
                    }

                    if (task[f] != req.body[f]) {
                        origin[f] = task[f];
                        changes[f] = req.body[f];
                    }

                    let toFinish = false;
                    if (f == 'estimation' && req.body[f] == 0) {
                        origin.status = task.status;
                        changes.status = 'Finished';
                        toFinish = true;
                    }
                    else if (f == 'status' && req.body.status == 'Finished') {
                        origin.estimation = task.estimation;
                        changes.estimation = 0;
                        toFinish = true;
                    }
                    // TODO: auto change status of defect?
                }

                task.update(changes).then(function(task) {
                    models.change.create({
                        originalData: JSON.stringify(origin),
                        changedData: JSON.stringify(changes),
                        userId: req.user.id,
                        taskId: task.id
                    }).then(function() {
                        res.json(task);
                    });
                });
            }).catch(function(errors){
                console.log("Error: " + JSON.stringify(errors));
                res.sendStatus(500);
            });
        })
        .delete(function(req, res){
            models.task.findById(req.params.id).then(function(task) {
                task.destroy().then(function(task) {
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
};
