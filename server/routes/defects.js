module.exports = function(router) {
    var models = require('../../models');

    function currentPlan(pid) {
        // TODO: the timezone difference between db and node could cause query failure.
        var now = new Date();
        return models.plan.findOne({
            where: {
                start: {$lt: now},
                end: {$gt: now},
                projectId: pid,
                type: 'sprint'
            }
        });
    }

    router.route('/defects/:id/fix')
        .post(function(req, res) {
            models.sequelize.transaction(function(t) {
                return models.item.findById(req.params.id)
                    .then(function(defect) {
                        return currentPlan(defect.projectId).then(function(plan) {
                            if (!plan) {
                                throw new Error('Cannot locate current plan.');
                            }

                            return models.item.create({
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
                                planId: plan.id
                            }).then(function(task) {
                                // change log writing is missing, aspect programming?
                                return defect.update({status: 'InProgress', state: 'Fixing'});
                                res.json(task)
                            });
                        }); 
                    });
            }).then(function() {
                res.end();
            }).catch(function(errors) {
                console.log('Error caught: ', errors);
                res.sendStatus(500);
            });  
        });

    router.route('/defects/:id/test')
        .post(function(req, res) {
            models.sequelize.transaction(function(t) {
                return models.item.findById(req.params.id).then(function(defect) {
                    return currentPlan(defect.projectId).then(function(plan) {
                        if (!plan) {
                            return res.status(501).json({error: 'Cannot locate current plan.'})
                        }
                        
                        return models.item.create({
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
                            planId: plan.id
                        }).then(function(task){
                            return defect.update({status: 'InProgress', state: 'Testing'}).then(function() {
                                res.json({});
                            });
                        });
                    });
                });
            }).then(function(){
                res.end();
            }).catch(function(errors) {
                console.log('Error caught: ', errors);
                res.sendStatus(500);
            });
        });
}