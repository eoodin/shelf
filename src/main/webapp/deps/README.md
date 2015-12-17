About dependency
================
It seems that javascript world nowadays chooses node.js as their primary platform, this should not be a problem if
they provide 'compiled' javascript for other backend technologies. However, at the very beginning of framework like
ng2-bootstrap, they has not provided any compiled javascript, therefore, for keeping update of the latest version,
their should be some steps to 'convert' node.js oriented into static files oriented.


This file is created for record how those dependencies is 'compiled', manually, or automatically.


ng2-bootstrap
-------------

ng2-bootstrap is in /deps/ng2-bs, the steps for getting it ready to use for Shelf are:
# Update repository of ng2-bootstrap: https://github.com/valor-software/ng2-bootstrap
# Copy all content to this folder.
# To avoid change anything in the folder, loading mechanism need to be changed.
    var systemNormalize = System.normalize;
    System.normalize = function (dep, parent) {
       var System = this;
       return systemNormalize.call(this, dep, parent)
           .then(function (normalized) {
               if ((parent && (parent.slice(-3) == '.ts')) && (dep[0] == ".")) {
                   var depname = dep.slice(dep.lastIndexOf("/"));
                   if (depname.indexOf('.') < 0)
                       normalized = normalized + '.ts';
               }

               if ((normalized.slice(-6) == '.ts.js') || (normalized.slice(-6) == '.js.ts'))
                   normalized = normalized.slice(0, normalized.length - 6) + ".ts";

               return normalized;
           });
    }

This is a workaround for systemjs issue: https://github.com/systemjs/systemjs/issues/489

# Because we include dependency source directly, so magnification needed. For ng2-bootstrap which under MIT license,
  we could remove any files exclude the license. Following files/folders are removed:

* demo/**
* gulp-tasks/**
* typings/**
* gulpfile.js
* tsconfig.json
* tslint.json
* webpack.config.js
* components/*.md
* README.md
