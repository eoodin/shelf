package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.model.Project;
import com.nokia.oss.mencius.shelf.model.Team;
import com.nokia.oss.mencius.shelf.model.WorkItem;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.util.List;
import java.util.logging.Logger;

import static java.util.logging.Logger.getLogger;

@Controller
@RequestMapping("/projects")
public class ProjectController {
    private static final Logger LOG = getLogger(ProjectController.class.getName());

    @PersistenceContext
    private EntityManager em;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public List<Project> listProjects() {
        return em.createQuery("select p from Project p").getResultList();
    }

    @RequestMapping(value = "/{projectId}", method = RequestMethod.DELETE)
    @ResponseBody
    public String deleteProject(@PathVariable String projectId) {
        Long id = Long.valueOf(projectId);
        Project project = em.find(Project.class, id);
        em.remove(project);
        return "deleted";
    }

    @RequestMapping(value = "/{projectId}/backlog", method = RequestMethod.GET)
    @ResponseBody
    public List<WorkItem> getBacklogItems(@PathVariable Long projectId) {
        Query query = em.createQuery("SELECT w FROM WorkItem w WHERE w.project=:proj");
        query.setParameter("proj", em.find(Project.class, projectId));
        return query.getResultList();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @ResponseBody
    @Transactional
    public String createProject(@RequestBody ProjectSpec spec) {
        Project project = new Project();
        project.setName(spec.projectName);

        Team team = em.find(Team.class, spec.teamId);
        project.setTeam(team);
        em.persist(project);

        return "created";
    }

    public static class ProjectSpec {
        public String projectName;
        public Long teamId;
    }
}
