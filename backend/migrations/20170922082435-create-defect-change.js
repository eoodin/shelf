'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('defect_changes', {
      historyId: {
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
      console.log('hello');
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('defect_changes');
  }
};