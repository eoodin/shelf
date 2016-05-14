package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.ShelfException;
import com.nokia.oss.mencius.shelf.model.GenericFile;
import com.nokia.oss.mencius.shelf.model.Team;
import com.nokia.oss.mencius.shelf.model.User;
import com.nokia.oss.mencius.shelf.utils.UserUtils;
import com.oracle.tools.packager.IOUtils;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.activation.FileTypeMap;
import javax.activation.MimetypesFileTypeMap;
import javax.annotation.Resource;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@Controller
public class FileController {
    @PersistenceContext
    private EntityManager em;

    private FileTypeMap fileTypeMap = new MimetypesFileTypeMap();

    @RequestMapping(value = "/file/{id}", method = RequestMethod.GET)
    @ResponseBody
    public void getFile(
            @PathVariable("id") Long id,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        GenericFile file = em.find(GenericFile.class, id);
        response.setHeader("Content-Type", file.getMime());
        response.setDateHeader("Last-Modified", file.getModifiedAt().getTime());
        // TODO: support ranges.
        response.setHeader("Content-Length", String.valueOf(file.getSize()));
        response.setHeader("Accept-Ranges", "bytes");
        response.getOutputStream().write(file.getData());
    }

    @RequestMapping(value = "/file/", method = RequestMethod.POST)
    @ResponseBody
    @Transactional
    public Long postFile(
            @RequestParam("file") MultipartFile file) throws ShelfException, IOException {
        if (file.isEmpty())
            throw new ShelfException("Empty file cannot be saved.");

        if (file.getSize() > 10485760L)
            throw new ShelfException("Unable to handle file larger than 10485760.");

        int fileSize = (int)file.getSize();
        byte[] buffer = new byte[fileSize];
        int readSize = file.getInputStream().read(buffer);
        if (fileSize != readSize)
            throw new ShelfException("Failed to read file.");

        String fileName = file.getOriginalFilename();
        GenericFile genericFile = new GenericFile();
        genericFile.setName(fileName);
        genericFile.setCreatedAt(new Date());
        genericFile.setModifiedAt(new Date());
        genericFile.setMime(fileTypeMap.getContentType(fileName));
        genericFile.setSize(file.getSize());
        genericFile.setData(buffer);

        em.persist(genericFile);
        return genericFile.getId();
    }

    @RequestMapping(value = "/file/{id}", method = RequestMethod.DELETE)
    @ResponseBody
    @Transactional
    public Long deleteFile(@PathVariable("id") Long id) {
        return 0L;
    }
}
