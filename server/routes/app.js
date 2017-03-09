module.exports = function(router) {
    router.route('/app/info').get(function(req, res){
        var childProcess = require('child_process');
        let commitMsg = childProcess.execSync('git log -1').toString();
        let branch = childProcess.execSync('git branch').toString();
        branch = branch.substr(2);
        res.send({"commit": commitMsg, "branch": branch});
    });
};
