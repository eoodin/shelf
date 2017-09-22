'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    var oldChanges;
    return queryInterface.createTable('task_changes', {
      taskId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      defectId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function() {
      // transaction?
      return Sequelize.query('SELECT * FROM changes',  { type: sequelize.QueryTypes.SELECT }).then(results => {
        queryInterface
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('task_changes');
  }
};