package com.nokia.oss.mencius.shelf.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.logging.Logger;

import static java.util.logging.Logger.getLogger;

@Controller
@RequestMapping("/app")
public class AppInfoController {

    private static final Logger LOG = getLogger(AppInfoController.class.getName());

    @PersistenceContext
    private EntityManager em;
    private Properties gitProperties;

    @RequestMapping(value = "/info", method = RequestMethod.GET)
    @ResponseBody
    public AppInfo getInfo() {
        AppInfo info = new AppInfo();
        info.version = getGitProperties().getProperty("git.build.version");
        info.commit = getGitProperties().getProperty("git.commit.id.abbrev");
        info.update = getGitProperties().getProperty("git.commit.time");
        return info;

    }

    private Properties getGitProperties() {
        if (gitProperties == null) {
            InputStream stream = getClass().getResourceAsStream("/git.properties");
            gitProperties = new Properties();
            try {
                gitProperties.load(stream);
            } catch (IOException e) {
                LOG.warning("No git.properties in current application, not build by maven?");
            } finally {
                try {
                    stream.close();
                } catch (IOException ignored) {
                }
            }
        }

        return gitProperties;
    }

    class AppInfo {
        public String commit;
        public String version;
        public String update;
    }
}
