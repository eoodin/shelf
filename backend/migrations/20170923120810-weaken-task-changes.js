'use strict';
const models = require('../models');

module.exports = {
  up: (queryInterface, Sequelize) => {
    const changeTablDef = {
      historyId: { primaryKey: true, type: Sequelize.BIGINT },
      field: { primaryKey: true, type: Sequelize.STRING },
      value: { type: Sequelize.TEXT, length: 'long' }
    };
    const sequelize = queryInterface.sequelize;
    return queryInterface.createTable('tmp_changes', changeTablDef).then(() => {
      return sequelize.query('SELECT * FROM changes',  { type: Sequelize.QueryTypes.SELECT }).then(changes => {
        console.log('old changes has ' + changes.length + " entries");
        let count = 10;
        let inserts = [];
        for (let ch of changes) {
          if (!ch.id) continue;
          if (ch.originalData == ch.changedData) continue;
          if (!ch.taskId) {
            continue;
          }
          
          var nd = JSON.parse(ch.changedData);
          
          for(let field in nd) {
            let value = nd[field];
            if (field == 'changes' || field == 'children') 
              delete nd[field];
            else if (field == 'creator' || field == 'createdBy')  {
              nd.creatorId = value ? value.id : nd.creatorId;
              delete nd[field];
            } else if (field == 'owner') {
              nd.ownerId = value ? value.id : nd.ownerId;
              delete nd[field];
            } else if (value && typeof(value) === 'object') {
              delete nd[field];
            }
          }
          
          let fieldChanges = [];
          for (let f in nd) fieldChanges.push({field: f, value: nd[f] });

          if (fieldChanges.length) {
            let ins = models.history.create({
              userId: ch.userId,
              createdAt: ch.createdAt
            }).then(his => {
              for(let c of fieldChanges)
                c.historyId = his.id;
              return queryInterface.bulkInsert('tmp_changes', fieldChanges).catch(reason => {
                console.log('error happened', reason);
              }).then( () => {
                return models.taskHistory.create({
                  historyId: his.id,
                  taskId: ch.taskId
                });
              });
            });

            inserts.push(ins);
          }
        }

        return Sequelize.Promise.all(inserts);
      });
    }).then(() => {
      return queryInterface.dropTable('changes');
    }).then(() => {
      return sequelize.query('CREATE TABLE changes AS SELECT * FROM tmp_changes');
    }).then(() => {
      return queryInterface.dropTable('tmp_changes');
    })
  },
  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;
    return sequelize.query('SELECT * FROM task_histories').then(results => {
      console.log('To be downgraded items: ' + results.length);
    });
  }
};