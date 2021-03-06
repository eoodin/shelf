2017-09-23
==========
Add defect history at defect details page, database migration needed, use `node_modules/.bin/sequelize db:migrate` to do so

The UI now is purely based on angular material, bootstrap is removed.

2016-10-17
==========

Schema change:
--------------
Simplify allocation record of effort estimation:
 update allocations set developerHours=developerHours+testerHours;
 alter table allocations change column developerHours effort bigint(20); 
 alter table allocations drop column testerHours;

Add priority
 alter table items add column priority int(11) default 1;

2017-01-10
Separate team backlog from projects.
Migration to database needed:
  alter table plans add column teamId bigint(20);
  update plans left join projects on projectId = projects.id set plans.teamId=projects.teamId;
  
  SELECT constraint_name INTO @cn FROM  information_schema.KEY_COLUMN_USAGE WHERE table_name = 'plans' AND column_name = 'projectId';
  select CONCAT('alter table plans drop foreign key ', @cn) into @sql;
  prepare stmt from @sql;
  execute stmt;
  deallocate prepare stmt;
  alter table plans drop column projectId;

2017-02-20
Separate user story from work-items
  insert into stories (title, description, status, points, projectId, creatorId, createdAt, updatedAt) 
    select title,description,status,points,projectId,creatorId, createdAt,updatedAt from items where type='UserStory';
  insert into defects (title, description, severity, status, projectId, creatorId, ownerId, createdAt, updatedAt) 
    select title, description, severity, status, projectId, creatorId, ownerId, createdAt, updatedAt from items where type='Defect';
  update defects set status='Created' where status is null;
  update defects set severity='Major' where severity is null;
  alter table defects modify column status enum('Open', 'Analyzing', 'Declined', 'Fixing', 'Fixed', 'Testing', 'Failed', 'Closed');
  update defects set status='Open' where status = '';
If tree info need to be preserved, additional data fix needed.
  delete from changes where itemId in (select id from items where type='UserStory');
  delete from items where type='UserStory' and parentId is not null;
  delete from items where type='UserStory';
  delete from changes where itemId in (select id from items where type='Defect');
  delete from items where type='Defect';
  insert into tasks (title, priority, originalEstimation, estimation, description, status, createdAt, updatedAt, planId, ownerId, creatorId) select title, priority, originalEstimation, estimation, description, status, createdAt, updatedAt, planId, ownerId, creatorId from items where type='Task';
  alter table changes add column taskId bigint(20);
  update changes left join items on changes.itemId=items.id left join tasks on tasks.title=items.title and tasks.createdAt=items.createdAt set taskId=tasks.id;
  SELECT constraint_name INTO @cn FROM  information_schema.KEY_COLUMN_USAGE WHERE table_name = 'changes' AND column_name = 'itemId';
  select CONCAT('alter table changes drop foreign key ', @cn) into @sql;
  prepare stmt from @sql;
  execute stmt;
  deallocate prepare stmt;
  alter table changes drop column itemId;

2017-03-02
  alter table tasks modify column description longtext;
  alter table defects modify column description longtext;
  
2017-03-03
  alter table stories add column priority int(11) default 1;
  
