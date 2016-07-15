module.exports = function(router) {
    var models = require('../../models');
    var route = router.route('/plans');
    route.get(function(req, res){
        let id = req.query.project;
        if (!id) {
            res.sendStatus(404);
            return;
        }
        
        models.plan.findAll({where: {projectId: id}}).then(function(plans) {
            res.json(plans);
        });
    });

    route.post(function(req, res){
        //  Project project = em.find(Project.class, spec.projectId);
        // if (project == null)
        //     return null;

        // Plan plan = new Plan();
        // plan.setName(spec.name);
        // plan.setType("sprint");
        // plan.setStart(spec.start);
        // plan.setEnd(spec.end);
        // plan.setProject(project);
        // em.persist(plan);

        // Allocation allocation = new Allocation();
        // allocation.setTeam(project.getTeam());
        // allocation.setDeveloperHours(spec.devHours);
        // allocation.setTesterHours(spec.tstHours);
        // allocation.setSprint(plan);

        // em.persist(allocation);
        // return plan; 
        console.log('data', req.rawBody);

        let id = req.rawBody.projectId;
        if (!id) {
            res.sendStatus(500);
            return;
        }
        
        models.project.find(id).then(function(project) {
            console.log('project', project);
            res.json(project);
        });
    });
}