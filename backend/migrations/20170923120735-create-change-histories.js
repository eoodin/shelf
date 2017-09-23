'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    console.log('creating defect_histories');
    return queryInterface.createTable('defect_histories', {
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
    }).then(function() {
      console.log('creating task_histories');
      return queryInterface.createTable('task_histories', {
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
      })
    }).then(() => {
      console.log('creating story_histories');
      return queryInterface.createTable('story_histories', {
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
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    console.log('dropping defect_histories');
    return queryInterface.dropTable('defect_histories').then(() => {
      console.log('dropping task_histories');
      return queryInterface.dropTable('task_histories');
    }).then(() => {
      console.log('dropping story_histories');
      return queryInterface.dropTable('story_histories');
    });
  }
};