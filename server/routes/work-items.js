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

            models.workItem.findAll({
                where: where,
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

    router.route('/defect/:id/fix')
        .post(function(req, res) {
            /*
            public void startFix(@PathVariable("id") Long id, HttpServletRequest request) throws ShelfException {
        Defect defect = em.find(Defect.class, id);
        if (defect == null)
            throw new NotFoundException("Defect not exist ID=" + id);

        Plan currentSprint = planController.getCurrentSprint(defect.getProject());
        if (currentSprint == null)
            throw new ShelfException("No sprint info found");

        User user = em.find(User.class, request.getRemoteUser());
        defect.setStatus(WorkItem.Status.InProgress);
        defect.setState(Defect.State.Fixing); // to simplify.
        Task fixingTask = new Task();
        fixingTask.setCatalog(Task.Catalog.Development);
        fixingTask.setStatus(WorkItem.Status.InProgress);
        fixingTask.setTitle("Fix #" + defect.getId() + ": "  + defect.getTitle());
        fixingTask.setEstimation(8);
        fixingTask.setProject(defect.getProject());
        fixingTask.setCreatedAt(new Date());
        fixingTask.setDescription("Auto generated task for fixing issue #" + id);
        fixingTask.setOriginalEstimation(8);
        fixingTask.setOwner(user);
        fixingTask.setParent(defect);
        defect.setPlan(currentSprint);
        fixingTask.setPlan(currentSprint);
        em.merge(defect);
        em.persist(fixingTask);
    }


            */
        });

    router.route('/defect/:id/test')
        .post(function(req, res) {
            /*
                @RequestMapping(value="/{id}/test", method = RequestMethod.POST)
    @ResponseBody
    @Transactional
    public void startTest(@PathVariable("id") Long id, HttpServletRequest request) throws ShelfException {
        Defect defect = em.find(Defect.class, id);
        if (defect == null)
            throw new NotFoundException("Defect not exist ID=" + id);

        Plan currentSprint = planController.getCurrentSprint(defect.getProject());
        if (currentSprint == null)
            throw new ShelfException("No sprint info found");

        User user = em.find(User.class, request.getRemoteUser());
        defect.setState(Defect.State.Testing); // to simplify.
        Task testingTask = new Task();
        testingTask.setStatus(WorkItem.Status.InProgress);
        testingTask.setCatalog(Task.Catalog.Testing);
        testingTask.setTitle("Test #" + defect.getId() + ": " + defect.getTitle());
        testingTask.setEstimation(8);
        testingTask.setProject(defect.getProject());
        testingTask.setCreatedAt(new Date());
        testingTask.setDescription("Auto generated task for testing issue #" + id);
        testingTask.setOriginalEstimation(8);
        testingTask.setOwner(user);
        testingTask.setParent(defect);
        defect.setPlan(currentSprint);
        testingTask.setPlan(currentSprint);
        em.merge(defect);
        em.persist(testingTask);
    }
            */
        });

}