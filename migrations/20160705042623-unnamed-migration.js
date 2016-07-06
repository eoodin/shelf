'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn('User_Role', 'createdAt', {type: Sequelize.DATETIME});
    queryInterface.addColumn('User_Role', 'updatedAt', {type: Sequelize.DATETIME});

    queryInterface.addColumn('Team', 'updatedAt', {type: Sequelize.DATETIME});
    queryInterface.renameColumn('Team', 'createdBy_userId', 'createdBy');
    queryInterface.renameColumn('Team', 'scrumMaster_userId', 'scrumMaster');

    queryInterface.renameColumn('Project', 'team_id', 'teamId');

    queryInterface.addColumn('Team_User', 'createdAt', {type: Sequelize.DATETIME});
    queryInterface.addColumn('Team_User', 'updatedAt', {type: Sequelize.DATETIME});

    queryInterface.addColumn('WorkItem', 'updatedAt', {type: Sequelize.DATETIME});
    queryInterface.renameColumn('WorkItem', 'plan_id', 'planId');
    queryInterface.renameColumn('WorkItem', 'DTYPE', 'type');
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET type = 'UserStory' WHERE type LIKE 'US'");
      queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET type = 'Defect' WHERE type LIKE 'DE'");
      queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET type = 'Task' WHERE type LIKE 'TA'");

    queryInterface.changeColumn('WorkItem', 'status', {
        type: Sequelize.ENUM,
        allowNull: false,
        defaultValue: 'New'
      }
    );

    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET status = 'New' WHERE status LIKE '0'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET status = 'InProgress' WHERE status LIKE '1'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET status = 'Finished' WHERE status LIKE '2'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET status = 'Pending' WHERE status LIKE '3'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET status = 'Dropped' WHERE status LIKE '4'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET status = 'Removed' WHERE status LIKE '5'");

    queryInterface.renameColumn('Plan', 'project_id', 'projectId');
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
