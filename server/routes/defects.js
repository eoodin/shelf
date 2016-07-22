module.exports = function(router) {
    var models = require('../../models');

    function getCurrentPlan(pid) {
        var now = new Date();
        models.plan.findOne({
            where: {
                start: {$lt: now},
                end: {$gt: now},
                projectId: pid,
                type: 'sprint'
            }
        }).then(function(plan) {

        })
    }

    router.route('/defects/:id/fix')
        .post(function(req, res) {
            models.workItem.findById(req.params.id)
                .then(function(defect) {
                    var now = new Date();
                    models.plan.findOne({
                        where: {
                            start: {$lt: now},
                            end: {$gt: now},
                            projectId: defect.projectId,
                            type: 'sprint'
                        }
                    }).then(function(currentPlan) {
                        if (!currentPlan) {
                            return res.status(501).json({error: 'Cannot locate current plan.'})
                        }
                        console.log('User:  ' + JSON.stringify(req.user));
                        models.workItem.create({
                            type:'Task',
                            catalog:  'Development',
                            status: 'InProgress',
                            title: 'Fix defect #' + defect.id + ': ' + defect.title,
                            description: 'Auto-generated task for fixing issue #' + defect.id,
                            estimation: 8,
                            originalEstimation: 8,
                            projectId: defect.projectId,
                            owner_userId: req.user.userId,
                            parent_id: defect.id,
                            planId: currentPlan.id
                        }).then(function(task){
                            defect.update({status: 'InProgress', state: 'Fixing'}).then(function() {
                                console.log('defect marked as fixing.');
                            });
                            res.json(task)
                        });
                    });
                    
                }).catch(function(errors) {
                    console.log('Error: ' + JSON.stringify(errors));
                    res.sendStatus(500);
                });
        });

    router.route('/defects/:id/test')
        .post(function(req, res) {
            models.workItem.findById(req.params.id)
                .then(function(defect) {
                    var now = new Date();
                    models.plan.findOne({
                        where: {
                            start: {$lt: now},
                            end: {$gt: now},
                            projectId: defect.projectId,
                            type: 'sprint'
                        }
                    }).then(function(currentPlan) {
                        if (!currentPlan) {
                            return res.status(501).json({error: 'Cannot locate current plan.'})
                        }
                        models.workItem.create({
                            type:'Task',
                            catalog:  'Testing',
                            status: 'InProgress',
                            title: 'Test fix for defect #' + defect.id + ': ' + defect.title,
                            description: 'Auto-generated task for testing fixed issue #' + defect.id,
                            estimation: 8,
                            originalEstimation: 8,
                            projectId: defect.projectId,
                            owner_userId: req.user.userId,
                            parent_id: defect.id,
                            planId: currentPlan.id
                        }).then(function(task){
                            defect.update({status: 'InProgress', state: 'Testing'}).then(function() {
                                console.log('defect marked as testing.');
                            });
                            res.json(task)
                        });
                    });
                    
                }).catch(function(errors) {
                    console.log('Error: ' + JSON.stringify(errors));
                    res.sendStatus(500);
                });
        });
}