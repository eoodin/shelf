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
import java.util.ArrayList;
import java.util.Collection;
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
    @Transactional
    public String deleteProject(@PathVariable String projectId) {
        Long id = Long.valueOf(projectId);
        Project project = em.find(Project.class, id);
        em.remove(project);
        return "deleted";
    }

    class ItemList extends ArrayList<WorkItem> { public ItemList(Collection<? extends WorkItem> c) {super(c);}}
    @RequestMapping(value = "/{projectId}/backlog", method = RequestMethod.GET)
    @ResponseBody
    public ItemList getBacklogItems(@PathVariable Long projectId) {
        Query query = em.createQuery("SELECT w FROM WorkItem w " +
                "WHERE w.project=:proj AND (TYPE(w) = UserStory OR TYPE(w) = Defect) AND w.status <> :status");
        query.setParameter("proj", em.find(Project.class, projectId))
                .setParameter("status", WorkItem.Status.Removed);

        return new ItemList(query.getResultList());
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
