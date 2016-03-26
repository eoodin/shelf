package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.Team;
import com.nokia.oss.mencius.shelf.model.User;
import com.nokia.oss.mencius.shelf.utils.UserUtils;
import com.nokia.oss.mencius.shelf.web.security.ShelfException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/teams")
public class TeamController {

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public List<Team> getTeams() {
        EntityManager em = HibernateHelper.createEntityManager();
        List<Team> teams = new ArrayList<>();
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Team> cq = cb.createQuery(Team.class);
        Root<Team> team = cq.from(Team.class);
        cq.select(team);
        List<Team> list = em.createQuery(cq).getResultList();
        for (Team t : list) {
            t.getScrumMaster();
            t.getMembers().size();
            t.getCreatedBy();
        }

        teams.addAll(list);

        em.close();
        return teams;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, headers = {"Content-type=application/json"})
    @ResponseBody
    public Team createPlan(@RequestBody TeamSpec spec, HttpServletRequest request) throws ShelfException {
        Collection<User> users = UserUtils.findOrCreateUsers(spec.getUsers());
        User scrumMaster = UserUtils.findOrCreateUser(spec.getScrumMaster());
        User currentUser = UserUtils.findOrCreateUser(request.getRemoteUser());

        EntityManager em = HibernateHelper.createEntityManager();
        em.getTransaction().begin();
        try {
            Team team = new Team();
            team.setName(spec.getName());
            team.setCreatedAt(new Date());
            team.setMembers(users);
            team.setScrumMaster(scrumMaster);
            team.setCreatedBy(currentUser);
            em.persist(team);

            em.getTransaction().commit();
            return team;
        }
        catch (Exception ex) {
            em.getTransaction().rollback();
        }
        finally {
            em.close();
        }

        throw new ShelfException("Unable to create team.");
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    @ResponseBody
    public String deletePlan(@PathVariable("id") Long teamId) {
        EntityManager em = HibernateHelper.createEntityManager();

        em.getTransaction().begin();
        try {
            Team team = em.find(Team.class, teamId);
            em.remove(team);
            em.getTransaction().commit();
            return "deleted";
        }
        catch (Exception ex) {
            em.getTransaction().rollback();
        }
        finally {
            em.close();
        }

        return "failed";
    }


    public static class TeamSpec {
        private String name;
        private String[] users;
        private String scrumMaster;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String[] getUsers() {
            return users;
        }

        public void setUsers(String[] users) {
            this.users = users;
        }

        public String getScrumMaster() {
            return scrumMaster;
        }

        public void setScrumMaster(String scrumMaster) {
            this.scrumMaster = scrumMaster;
        }
    }
}
