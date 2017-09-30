'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('defectComments', {
      defectId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      commentId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('defectComments');
  }
};