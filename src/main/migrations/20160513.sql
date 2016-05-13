update WorkItem,Plan set WorkItem.project_id=Plan.project_id where WorkItem.plan_id=Plan.id;
