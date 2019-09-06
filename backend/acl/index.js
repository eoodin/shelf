module.exports = function(app) {

    class Resource {
        constructor(type, id, parent = null){
        }
    }

    class Permission {

    }

    function protecting(resource) {
        return false;
    }

    function resource(req) {
        return undefined;
    }

    function permissions(req) {
        return [];
    }

    function authorized(resource) {
        return false;
    }

    app.use((req, res, next) => {
        const resource = resource(req);
        if (protecting(resource)) {
            const permissions = permissions(req);
            if (!authorized(resource)) {
                throw new Error('Unauthorized access');
            }
        }

        next();
    });
};
