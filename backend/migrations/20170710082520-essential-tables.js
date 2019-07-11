'use strict';


module.exports = {
  up: (queryInterface, Sequelize) => {
      return Promise.all([queryInterface.createTable('changes', {
          historyId: {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.BIGINT
          },
          field: {
              type: Sequelize.STRING,
              primaryKey: true,
          },
          value: {
              type: Sequelize.BLOB//TODO
          }
      }),
          queryInterface.createTable('allocations', {
              id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: Sequelize.BIGINT
              },
              effort: {
                  type: Sequelize.BIGINT
              },
              planId: {
                  type: Sequelize.BIGINT, //TODO
                  // references: {
                  //     model: 'plans',
                  //     key: 'id'
                  // },
              },
              teamId: {
                  type: Sequelize.BIGINT, //TODO
                  // references: {
                  //     model: 'teams',
                  //     key: 'id'
                  // },
              },
              createdAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              },
              updatedAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              }
          }),
          queryInterface.createTable('defects', {
              id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: Sequelize.BIGINT
              },
              title: {
                  type: Sequelize.STRING
              },
              description: { type: Sequelize.TEXT, length: 'long' /*524288*/ }, //TODO
              severity: {
                  type: Sequelize.ENUM,
                  values: ['Blocker', 'Critical', 'Major', 'Minor']
              },
              status: {
                  type: Sequelize.ENUM,
                  values: ['Open', 'Analyzing', 'Declined', 'Fixing', 'Fixed', 'Testing', 'Failed', 'Closed']
              },
              createdAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              },
              updatedAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              }
          }),
          queryInterface.createTable('files', {
              id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: Sequelize.BIGINT
              },
              name: {
                  type: Sequelize.STRING
              },
              size: {
                  type: Sequelize.BIGINT,
              },
              mime: {
                  type: Sequelize.STRING
              },
              data: {
                  type: Sequelize.BLOB //TODO data: DataTypes.BLOB*/
              }
          }),
          queryInterface.createTable('plans', {
              id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: Sequelize.BIGINT
              },
              name: {
                  type: Sequelize.STRING
              },
              type: {
                  type: Sequelize.STRING
              },
              teamId: {
                  type: Sequelize.BIGINT, //TODO
              },
              start: {
                  allowNull: false,
                  type: Sequelize.DATE
              },
              end: {
                  allowNull: false,
                  type: Sequelize.DATE
              }
          }),
          queryInterface.createTable('preferences', {
              id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: Sequelize.BIGINT
              },
              name: {
                  type: Sequelize.STRING
              },
              value: {
                  type: Sequelize.STRING
              },
              userId: {
                  type: Sequelize.BIGINT, //TODO
              },
              createdAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              },
              updatedAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              }
          }),
          queryInterface.createTable('projects', {
              id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: Sequelize.BIGINT
              },
              name: {
                  type: Sequelize.STRING
              },
              backlogId: {
                  type: Sequelize.BIGINT, //TODO
              },
              teamId: {
                  type: Sequelize.BIGINT, //TODO
              }
          }),
          queryInterface.createTable('roles', {
              id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: Sequelize.BIGINT
              },
              description: {
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
          }),
          queryInterface.createTable('stories', {
              id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: Sequelize.BIGINT
              },
              title: {
                  type: Sequelize.STRING
              },
              points: {
                  type: Sequelize.INTEGER,
                  defaultValue: 0,
              },
              description: { type: Sequelize.TEXT, length: 'long' /*524288*/ }, //TODO
              status: {
                  type: Sequelize.ENUM,
                  values: ['New', 'Working', 'Done', 'Dropped']
              },
              createdAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              },
              updatedAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              },
              projectId: {
                  type: Sequelize.BIGINT, //TODO
              },
              parentId: {
                  type: Sequelize.BIGINT, //TODO
              },
              creatorId: {
                  type: Sequelize.BIGINT, //TODO
              },
              priority: {
                  type: Sequelize.INTEGER,
                  defaultValue: 1
              },
          }),
          queryInterface.createTable('tasks', {
              id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: Sequelize.BIGINT
              },
              title: {
                  type: Sequelize.STRING
              },
              priority: {
                  type: Sequelize.INTEGER,
                  defaultValue: 1
              },
              originalEstimation: {
                  type: Sequelize.INTEGER,
                  defaultValue: 0
              },
              estimation: {
                  type: Sequelize.INTEGER,
                  defaultValue: 0
              },
              description: { type: Sequelize.TEXT, length: 'long' /*524288*/ }, //TODO
              status: {
                  type: Sequelize.ENUM,
                  values: ['New', 'InProgress', 'Finished', 'Pending', 'Dropped', 'Removed']
              },
              createdAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              },
              updatedAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              },
              planId: {
                  type: Sequelize.BIGINT, //TODO
              },
              creatorId: {
                  type: Sequelize.BIGINT, //TODO
              },
              ownerId: {
                  type: Sequelize.BIGINT, //TODO
              },
          }),
          queryInterface.createTable('team_members', {
              teamId: {
                  type: Sequelize.BIGINT, //TODO
              },
              userId: {
                  type: Sequelize.BIGINT, //TODO
              },
              createdAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              },
              updatedAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              }
          }),
          queryInterface.createTable('teams', {
              id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: Sequelize.BIGINT
              },
              name: {
                  type: Sequelize.STRING
              },
              createdBy: {
                  type: Sequelize.BIGINT, //TODO
              },
              scrumMaster: {
                  type: Sequelize.BIGINT, //TODO
              },
              updatedAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              }
          }),
          queryInterface.createTable('user_roles', {
              userId: {
                  type: Sequelize.BIGINT, //TODO
              },
              roleId: {
                  type: Sequelize.BIGINT, //TODO
              },
              createdAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              },
              updatedAt: {
                  allowNull: false,
                  type: Sequelize.DATE
              }
          }),
          queryInterface.createTable('users', {
              id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: Sequelize.BIGINT
              },
              email: {
                  type: Sequelize.STRING
              },
              name: {
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
          }),
      ]);
  },

  down: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.dropTable('users'),
          queryInterface.dropTable('user_roles'),
          queryInterface.dropTable('teams'),
          queryInterface.dropTable('team_members'),
          queryInterface.dropTable('tasks'),
          queryInterface.dropTable('stories'),
          queryInterface.dropTable('roles'),
          queryInterface.dropTable('projects'),
          queryInterface.dropTable('preferences'),
          queryInterface.dropTable('plans'),
          queryInterface.dropTable('files'),
          queryInterface.dropTable('defects'),
          queryInterface.dropTable('allocations'),
          queryInterface.dropTable('changes')
      ]);
  }
};
