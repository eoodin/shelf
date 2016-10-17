2016-10-17
==========

Schema change:
--------------
Simplify allocation record of effort estimation:
 update allocations set developerHours=developerHours+testerHours;
 alter table allocations change column developerHours effort bigint(20); 
 alter table allocations drop column testerHours;


