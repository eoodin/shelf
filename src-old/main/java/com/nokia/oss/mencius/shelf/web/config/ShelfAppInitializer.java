package com.nokia.oss.mencius.shelf.web.config;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.servlet.DispatcherServlet;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;
import java.io.File;
import java.util.EnumSet;

public class ShelfAppInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext container) {
        DispatcherServlet dispatcher = new DispatcherServlet();
        dispatcher.setContextConfigLocation("/WEB-INF/api-servlet.xml");
        ServletRegistration.Dynamic registration = container.addServlet("dispatcher", dispatcher);
        registration.setLoadOnStartup(1);
        registration.addMapping("/api/*");
        String configuration = "/WEB-INF/security.xml";
        if (!new File(container.getRealPath(configuration)).exists())
            configuration = "/WEB-INF/security-sample.xml";

        container.setInitParameter("contextConfigLocation", configuration);
        container.addListener(new ContextLoaderListener());
        FilterRegistration.Dynamic filter = container.addFilter("springSecurityFilterChain", new DelegatingFilterProxy());
        filter.addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");
    }
}
