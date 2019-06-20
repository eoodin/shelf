'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('passwords', {
          userId: {
              primaryKey: true,
              type: Sequelize.STRING
          },
          password: {
              allowNull: false,
              type: Sequelize.STRING
          },
          createdAt: {
              allowNull: false,
              type: Sequelize.DATE
          },
          updatedAt: {
              allowNull: false,
              type: Sequelize.DATE
          }
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('passwords');
  }
};
