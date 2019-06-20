module.exports = function(router) {
    var models = require('../models');
    var csv = require('../modules/csv');
    router.route('/stories')
        .get(function(req, res) {
            var orderField = req.query.sortBy ? req.query.sortBy : 'id';
            if (orderField == 'owner') orderField = 'ownerId';
            
            let where = {};
            if (req.query.projectId) {
                where = {projectId: req.query.projectId};
            }
            
            if (req.query.parent) {
                where['parentId'] = req.query.parent == 'null' ? null : req.query.parent;
            }

            if (req.query.status) {
                let status = req.query.status.split(',');
                where['status'] = {$in : status};
            }

            let ex = (req.query.exclude) ? req.query.exclude : [];    
            models.story.findAll({
                attributes: {exclude: ex},
                where: where,
                order: [[orderField, (req.query.desc ? 'desc' : 'asc')]],
                include: [
                    {model: models.story, as: 'children'}
                ],
            }).then(function(stories) {   
                res.json(stories);
            })
        })
        .post(function(req, res) {
            if (!req.body.projectId) {
                return res.sendStatus(500);
            }

            models.user.findByPk(req.user.id).then(function(u) {
                let def = {
                    parentId: req.body.parentId,
                    status: 'New',
                    title: req.body.title,
                    description: req.body.description,
                    creatorId: u.id,
                    projectId: req.body.projectId,
                    points: req.body.points
                };
                var story = models.story.build(def);
                story.save().then(function (story) {
                    res.json(story.id);
                })
            }).catch(function(errors){
                logger.error(errors);
                res.sendStatus(500);
            });
        });

    router.route('/stories/:id')
        .get(function(req, res) {
            models.story.findByPk(req.params.id).then(function(story) {
                res.json(story);
            }).catch(function(errors){
                logger.error(errors);
                res.sendStatus(500);
            });
        })
        .patch(function(req, res) {
            models.story.findByPk(req.params.id).then(function(story) {
                var origin = {};
                var changes = {};
                for(let f in req.body) {
                    if (f == 'updatedAt' || f == 'createdAt') {
                        continue;
                    }

                    if (story[f] != req.body[f]) {
                        origin[f] = story[f];
                        changes[f] = req.body[f];
                    }
                }

                story.update(changes).then(function(story) {
                    logger.info('Story changed');
                    res.json(story);
                });
            }).catch(function(errors){
                logger.error(errors);
                res.sendStatus(500);
            });
        })
        .delete(function(req, res){
            models.story.findByPk(req.params.id).then(function(story) {
                story.destroy().then(function(story) {
                    res.json(req.params.id);
                })
                .catch(function(errors){
                    logger.error(errors);
                    res.sendStatus(500);
                });
            }).catch(function(errors){
                logger.error(errors);
                res.sendStatus(500);
            });
        });
};
