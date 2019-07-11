'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
        queryInterface.createTable('defect_histories', {
            historyId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            defectId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }),
        queryInterface.createTable('task_histories', {
            taskId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            historyId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }),
        queryInterface.createTable('story_histories', {
            storyId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            historyId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }),
    ]);
  },
  down: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.dropTable('defect_histories'),
          queryInterface.dropTable('task_histories'),
          queryInterface.dropTable('story_histories')
      ]);
  }
};
