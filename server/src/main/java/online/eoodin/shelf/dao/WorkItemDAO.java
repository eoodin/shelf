package online.eoodin.shelf.dao;

import online.eoodin.shelf.entity.Item;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Service;

@Service
public interface WorkItemDAO extends PagingAndSortingRepository<Item, Long> {
}
