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
  
    //['Created','Analyzing','Analyzed','Fixing','Fixed','Testing','Tested','Failed']
    // alter table WorkItem change column state state varchar(31);
    queryInterface.changeColumn('WorkItem', 'state', {
        type: Sequelize.ENUM,
        allowNull: false,
        defaultValue: 'Created'
      }
    );

    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET state = 'Created' WHERE state LIKE '0'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET state = 'Analyzing' WHERE state LIKE '1'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET state = 'Analyzed' WHERE state LIKE '2'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET state = 'Fixing' WHERE state LIKE '3'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET state = 'Fixed' WHERE state LIKE '4'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET state = 'Testing' WHERE state LIKE '5'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET state = 'Tested' WHERE state LIKE '6'");
    queryInterface.migrator.sequelize.query(
      "UPDATE WorkItem SET state = 'Failed' WHERE state LIKE '7'");

    // alter table WorkItem change column project_id projectId bigint(20);
    queryInterface.renameColumn('WorkItem', 'project_id', 'projectId');


    // alter table Plan change column project_id projectId bigint(20);
    queryInterface.renameColumn('Plan', 'project_id', 'projectId');

    // alter table Allocation change column sprint_id planId bigint(20);
    queryInterface.renameColumn('Allocation', 'sprint_id', 'planId');
    // alter table Allocation change column team_id teamId bigint(20);
    queryInterface.renameColumn('Allocation', 'team_id', 'teamId');

    // alter table ChangeLog change column changeTime createdAt datetime;
    queryInterface.renameColumn('ChangeLog', 'changeTime', 'createdAt');
    // alter table ChangeLog add column updatedAt datetime;
    queryInterface.addColumn('ChangeLog', 'updatedAt', {type: Sequelize.DATETIME});

    // alter table GenericFile change column modifiedAt updatedAt datetime;
    queryInterface.renameColumn('GenericFile', 'modifiedAt', 'updatedAt');

   // alter table UserPreference change column changedAt updatedAt datetime;
    queryInterface.renameColumn('UserPreference', 'changedAt', 'updatedAt');
    /** corresponding SQL: */
    /*
    alter table User_Role add column createdAt datetime;
    alter table User_Role add column updatedAt datetime;
    alter table Team add column updatedAt datetime; 
    alter table Team change column createdBy_userId createdBy varchar(255);
    alter table Team change column scrumMaster_userId scrumMaster varchar(255);
    alter table Project change column team_id teamId bigint(21);
    alter table Project change column backlog_id backlogId bigint(21);
    alter table Team_User add column createdAt datetime;
    alter table Team_User add column updatedAt datetime;
    alter table WorkItem add column updatedAt datetime;
    alter table WorkItem change column plan_id planId bigint(21);
    alter table WorkItem change column DTYPE type varchar(31);
    UPDATE WorkItem SET type = 'UserStory' WHERE type LIKE 'US';
    UPDATE WorkItem SET type = 'Defect' WHERE type LIKE 'DE';
    UPDATE WorkItem SET type = 'Task' WHERE type LIKE 'TA';
    alter table WorkItem change column status status varchar(31);
    UPDATE WorkItem SET status = 'New' WHERE status LIKE '0';
    UPDATE WorkItem SET status = 'InProgress' WHERE status LIKE '1';
    UPDATE WorkItem SET status = 'Finished' WHERE status LIKE '2';
    UPDATE WorkItem SET status = 'Pending' WHERE status LIKE '3';
    UPDATE WorkItem SET status = 'Dropped' WHERE status LIKE '4';
    UPDATE WorkItem SET status = 'Removed' WHERE status LIKE '5';
    alter table WorkItem change column state state varchar(31);
    UPDATE WorkItem SET state = 'Created' WHERE state LIKE '0';
    UPDATE WorkItem SET state = 'Analyzing' WHERE state LIKE '1';
    UPDATE WorkItem SET state = 'Analyzed' WHERE state LIKE '2';
    UPDATE WorkItem SET state = 'Fixing' WHERE state LIKE '3';
    UPDATE WorkItem SET state = 'Fixed' WHERE state LIKE '4';
    UPDATE WorkItem SET state = 'Testing' WHERE state LIKE '5';
    UPDATE WorkItem SET state = 'Tested' WHERE state LIKE '6';
    UPDATE WorkItem SET state = 'Failed' WHERE state LIKE '7';
    alter table WorkItem change column project_id projectId bigint(20);
    alter table Plan change column project_id projectId bigint(20);
    alter table Allocation change column sprint_id planId bigint(20);
    alter table Allocation change column team_id teamId bigint(20);
    alter table ChangeLog change column changeTime createdAt datetime;
    alter table ChangeLog add column updatedAt datetime;
    alter table GenericFile change column modifiedAt updatedAt datetime;
    alter table UserPreference change column changedAt updatedAt datetime;

    // Added 2016-08-01
    alter table WorkItem change column severity severity varchar(31);
    UPDATE WorkItem SET severity = 'Blocker' WHERE severity LIKE '0';
    UPDATE WorkItem SET severity = 'Critical' WHERE severity LIKE '1';
    UPDATE WorkItem SET severity = 'Major' WHERE severity LIKE '2';
    UPDATE WorkItem SET severity = 'Minor' WHERE severity LIKE '3';
    */

    // Added 2016-08-03
    /*
    rename table Allocation to allocations;
    alter table allocations add column createdAt datetime;
    alter table allocations add column updatedAt datetime;

    rename table ChangeLog to changes;
    alter table changes change column item_id itemId bigint(20);

    rename table WorkItem to items;
     alter table changes change actor_userId userId varchar(255);

     rename table UserPreference to preferences;
     alter table preferences change user_userId userId varchar(255);

     rename table User to users;
     rename table Role to roles;
      alter table roles add column createdAt datetime;
    alter table roles add column updatedAt datetime;
     rename table User_Role to user_roles;

     alter table user_roles change User_userId userId varchar(255) not null;
     alter table user_roles change roles_id roleId bigint(20) not null;

  rename table Team to teams;
rename table Team_User to team_members;
alter table team_members change Team_id teamId bigint(20);

// team_members -> users
SELECT constraint_name INTO @cn FROM  information_schema.KEY_COLUMN_USAGE WHERE table_name = 'team_members' AND column_name = 'members_userId';

select CONCAT('alter table team_members drop foreign key ', @cn) into @sql;
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

alter table team_members change members_userId userId varchar(255);

SELECT constraint_name INTO @cn FROM  information_schema.KEY_COLUMN_USAGE WHERE table_name = 'changes' AND column_name = 'userId';
select CONCAT('alter table changes drop foreign key ', @cn) into @sql;
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;


SELECT constraint_name INTO @cn FROM  information_schema.KEY_COLUMN_USAGE WHERE table_name = 'preferences' AND column_name = 'userId';
select CONCAT('alter table preferences drop foreign key ', @cn) into @sql;
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;


SELECT constraint_name INTO @cn FROM  information_schema.KEY_COLUMN_USAGE WHERE table_name = 'teams' AND column_name = 'scrumMaster';
select CONCAT('alter table teams drop foreign key ', @cn) into @sql;
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;
SELECT constraint_name INTO @cn FROM  information_schema.KEY_COLUMN_USAGE WHERE table_name = 'teams' AND column_name = 'createdBy';
select CONCAT('alter table teams drop foreign key ', @cn) into @sql;
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;


SELECT constraint_name INTO @cn FROM  information_schema.KEY_COLUMN_USAGE WHERE table_name = 'user_roles' AND column_name = 'userId';
select CONCAT('alter table user_roles drop foreign key ', @cn) into @sql;
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;


alter table users change userId id varchar(255);

alter table team_members add foreign key (userId) REFERENCES `users` (`id`);
alter table changes add foreign key (userId) REFERENCES `users` (`id`);
alter table preferences add foreign key (userId) REFERENCES `users` (`id`);
alter table teams add foreign key (scrumMaster) REFERENCES `users` (`id`);
alter table teams add foreign key (createdBy) REFERENCES `users` (`id`);
alter table user_roles add foreign key (userId) REFERENCES `users` (`id`);

    */

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
