module.exports = function(router) {
    var models = require('../models');
    var multer  = require('multer');

    router.route('/file').post(function(req, res, next) {
        var storage = multer.memoryStorage()
        var upload = multer({ storage: storage })
        var field = 'file';
        if (req.query.api && req.query.api.indexOf('ckeditor') == 0) {
            field = 'upload';
        }

        let uploader = upload.single(field);
        req.storage = storage;
        uploader(req, res, next);
    }, function(req, res) {
        models.file.create({
            name: req.file.originalname,
            size: req.file.size,
            mime: req.file.mime,
            data: req.file.buffer
        }).then(function(file) {
            if (req.query.api == 'ckeditor-uploadimage') {
                return res.json({uploaded: 1,fileName: file.id, url: '/api/file/' + file.id});
            }
            if (req.query.api == 'tinymce') {
                return res.json({ location : '/uploaded/image/path/image.png' + file.id});
            }

            res.json(file.id);
        }).catch(function(errors){
            console.log('Unable to save file: ' + JSON.stringify(errors));
            res.sendStatus(500);
        });
    });

    router.route('/file/:id').get(function(req, res) {
        models.file.findById(req.params.id).then(function(file) {
            res.set({
                'Content-Type': file.mimetype,
                'Last-Modified': file.createdAt,
                'Accept-Ranges': 'none', // set to 'bytes' to support ranges
                'Content-Length': file.size
            });
            res.end(file.data, 'binary');
        }).catch(function(errors){
            res.sendStatus(500);
        });
    });
};
