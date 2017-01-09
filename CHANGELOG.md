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
