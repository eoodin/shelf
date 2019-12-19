package online.eoodin.shelf.dao;

import online.eoodin.shelf.entity.Item;
import org.springframework.data.jpa.repository.support.JpaRepositoryImplementation;
import org.springframework.stereotype.Service;

public interface WorkItemDAO extends JpaRepositoryImplementation<Item, Long> {
}
