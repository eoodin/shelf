'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    // alter table User_Role add column createdAt datetime;
    // alter table User_Role add column updatedAt datetime;
    queryInterface.addColumn('User_Role', 'createdAt', {type: Sequelize.DATETIME});
    queryInterface.addColumn('User_Role', 'updatedAt', {type: Sequelize.DATETIME});

    // alter table Team add column updatedAt datetime; 
    queryInterface.addColumn('Team', 'updatedAt', {type: Sequelize.DATETIME});
    // alter table Team change column createdBy_userId createdBy varchar(255);
    queryInterface.renameColumn('Team', 'createdBy_userId', 'createdBy');
    // alter table Team change column scrumMaster_userId scrumMaster varchar(255);
    queryInterface.renameColumn('Team', 'scrumMaster_userId', 'scrumMaster');

    // alter table Project change column team_id teamId bigint(21);
    queryInterface.renameColumn('Project', 'team_id', 'teamId');
    // alter table Project change column backlog_id backlogId bigint(21);
    queryInterface.renameColumn('Project', 'backlog_id', 'backlogId');

    // alter table Team_User add column createdAt datetime;
    // alter table Team_User add column updatedAt datetime;
    queryInterface.addColumn('Team_User', 'createdAt', {type: Sequelize.DATETIME});
    queryInterface.addColumn('Team_User', 'updatedAt', {type: Sequelize.DATETIME});

    // alter table WorkItem add column updatedAt datetime;
    queryInterface.addColumn('WorkItem', 'updatedAt', {type: Sequelize.DATETIME});
    // alter table WorkItem change column plan_id planId bigint(21);
    queryInterface.renameColumn('WorkItem', 'plan_id', 'planId');
    // alter table WorkItem change column DTYPE type varchar(31);
    queryInterface.renameColumn('WorkItem', 'DTYPE', 'type');
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET type = 'UserStory' WHERE type LIKE 'US'");
      queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET type = 'Defect' WHERE type LIKE 'DE'");
      queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET type = 'Task' WHERE type LIKE 'TA'");
    
    // alter table WorkItem change column status status varchar(31);
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
    // alter table WorkItem change column project_id projectId bigint(20);
    queryInterface.renameColumn('WorkItem', 'project_id', 'projectId');


    // alter table Plan change column project_id projectId bigint(20);
    queryInterface.renameColumn('Plan', 'project_id', 'projectId');

    // alter table Allocation change column sprint_id sprintId bigint(20);
    queryInterface.renameColumn('Allocation', 'sprint_id', 'planId');
    // alter table Allocation change column team_id teamId bigint(20);
    queryInterface.renameColumn('Allocation', 'team_id', 'teamId');

    // alter table ChangeLog change column changeTime createdAt datetime;
    queryInterface.renameColumn('ChangeLog', 'changeTime', 'createdAt');
    // alter table ChangeLog add column updatedAt datetime;
    queryInterface.addColumn('ChangeLog', 'updatedAt', {type: Sequelize.DATETIME});

    // alter table GenericFile change column modifiedAt updatedAt datetime;
    queryInterface.renameColumn('GenericFile', 'modifiedAt', 'updatedAt');
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
