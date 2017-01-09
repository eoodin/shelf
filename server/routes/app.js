module.exports = function(router) {
    router.route('/app/info').get(function(req, res){
        //TODO: re-implement this.
        res.send({"commit":"10c93e4","version":"1.0-SNAPSHOT","update":"31.05.2016 @ 22:25:09 CST"});
    });
};
