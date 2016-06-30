package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.model.Allocation;
import com.nokia.oss.mencius.shelf.model.Plan;
import com.nokia.oss.mencius.shelf.model.Project;
import com.nokia.oss.mencius.shelf.model.WorkItem;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Controller("planController")
@RequestMapping("/plans")
public class PlanController {

    @PersistenceContext
    private EntityManager em;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    @Transactional
    public List<Plan> getPlans(@RequestParam("project") Long projectId) {
        List<Plan> plans = new ArrayList<>();
        Project project = em.find(Project.class, projectId);
        List list = em.createQuery("SELECT p FROM Plan p WHERE p.type = 'sprint' AND p.project=:projectId")
                .setParameter("projectId", project).getResultList();
        plans.addAll(list);

        return plans;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, headers = {"Content-type=application/json"})
    @ResponseBody
    @Transactional
    public Plan createPlan(@RequestBody PlanSpec spec) {
        Project project = em.find(Project.class, spec.projectId);
        if (project == null)
            return null;

        Plan plan = new Plan();
        plan.setName(spec.name);
        plan.setType("sprint");
        plan.setStart(spec.start);
        plan.setEnd(spec.end);
        plan.setProject(project);
        em.persist(plan);

        Allocation allocation = new Allocation();
        allocation.setTeam(project.getTeam());
        allocation.setDeveloperHours(spec.devHours);
        allocation.setTesterHours(spec.tstHours);
        allocation.setSprint(plan);

        em.persist(allocation);
        return plan;
    }

    @RequestMapping(value = "/{planId}/move-in", method = RequestMethod.POST, consumes = "application/json")
    @ResponseBody
    @Transactional
    public String moveIn(@PathVariable Long planId, @RequestBody String[] ids) {
        Plan plan = em.find(Plan.class, planId);
        if (plan == null)
            return "plan not exist";

        List<Long> wiIds = new ArrayList<>(ids.length);
        for (String id : ids) {
            wiIds.add(Long.valueOf(id));
        }

        Query query = em.createQuery("SELECT wi FROM WorkItem wi WHERE wi.id IN :ids", WorkItem.class);
        query.setParameter("ids", wiIds);
        List result = query.getResultList();
        for (Object wi : result) {
            ((WorkItem) wi).setPlan(plan);
            em.merge(wi);
        }

        return "OK";
    }

    public Plan getCurrentSprint(Project project) {
        Date now = new Date();

        List plans =
                em.createQuery("SELECT p FROM Plan p WHERE p.project = :project AND :time BETWEEN p.start AND p.end")
                .setParameter("project", project)
                .setParameter("time", now)
                .getResultList();

        if (plans.size() > 1)
            throw new IllegalStateException("Multiple sprints for same period, project id=" + project.getId());

        return plans.isEmpty() ? null : (Plan) plans.get(0);
    }

    public static class PlanSpec {
        public Long projectId;
        public String name;
        public Date start;
        public Date end;
        public Long devHours;
        public Long tstHours;
    }
}
