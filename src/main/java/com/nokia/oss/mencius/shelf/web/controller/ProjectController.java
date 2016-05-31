package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.ShelfException;
import com.nokia.oss.mencius.shelf.model.*;
import com.nokia.oss.mencius.shelf.utils.UserUtils;
import com.nokia.oss.mencius.shelf.web.security.UnAuthorizedException;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.servlet.http.HttpServletRequest;
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
    public String deleteProject(@PathVariable String projectId, HttpServletRequest request)
            throws UnAuthorizedException {
        ensureAdminRole(request);

        Long id = Long.valueOf(projectId);
        Project project = em.find(Project.class, id);
        em.remove(project);
        LOG.info("project id=" + id + " is removed, its plans and items are also removed");
        return "deleted";
    }

    class ItemList extends ArrayList<WorkItem> { ItemList(Collection<? extends WorkItem> c) {super(c);}}
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
    public String createProject(@RequestBody ProjectSpec spec, HttpServletRequest request)
            throws UnAuthorizedException {
        ensureAdminRole(request);

        Project project = new Project();
        project.setName(spec.projectName);

        Team team = em.find(Team.class, spec.teamId);
        project.setTeam(team);
        em.persist(project);

        return "created";
    }

    private void ensureAdminRole(HttpServletRequest request) throws UnAuthorizedException {
        User u = em.find(User.class, request.getRemoteUser());
        Role adminRole = em.find(Role.class, 1L);
        if (u == null || !u.getRoles().contains(adminRole))
            throw new UnAuthorizedException();
    }

    public static class ProjectSpec {
        public String projectName;
        public Long teamId;
    }
}
