/*jshint node:true*/

module.exports = function(res, data, defs) {

    function escape(field) {
        return '"' + String(field).replace(/\"/g, '""') + '"';
    }


  var body = '';

  res.charset = res.charset || 'utf-8';

    var fields = [];
    var titles = [];
    var fieldMaps = {};
    var unifiedDefs = {};
    for (let def of defs) {
        if (typeof def === 'object') {
            fields.push(def.field);
            if (def.title) {titles.push(def.title)}
            else {titles.push(def.field)}

            if (def.map) {fieldMaps[def.field] = def.map}
        }
        else {
            fields.push(def);
            titles.push(def);
        }
    }

    body += titles.join(',') + '\r\n';
    
  data.forEach(function(item) {
        logger.info('converting Item: ' + JSON.stringify(item));
          var arr = [];
          for (let f of fields) {
                let prop = item[f];
                let mapper = fieldMaps[f];
              if (mapper) {  
                  arr.push(mapper(prop))
              }
              else {
                  arr.push(prop);
              }
          }
          body += arr.map(escape).join(',') + '\r\n';
      })

  return res.send(body);
};