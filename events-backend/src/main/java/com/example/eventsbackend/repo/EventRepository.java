package com.example.eventsbackend.repo;

import com.example.eventsbackend.model.Event;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOwnerUsername(String username);
    List<Event> findAll(Specification<Event> spec);
    @Query(value = """
        SELECT e.*,
               ts_rank(
                 to_tsvector('simple',
                   coalesce(e.title, '') || ' ' ||
                   coalesce(e.description, '')
                 ),
                 plainto_tsquery('simple', :q)
               ) AS search_rank,
               sub.avg_rating,
               sub.popularity
          FROM event e
          LEFT JOIN (
            SELECT r.event_id,
                   AVG(r.rating) AS avg_rating,
                   COUNT(*)      AS popularity
              FROM rsvp r
             GROUP BY r.event_id
          ) sub ON sub.event_id = e.id
         WHERE (:q        IS NULL
                OR to_tsvector('simple',
                     coalesce(e.title, '') || ' ' ||
                     coalesce(e.description, '')
                   ) @@ plainto_tsquery('simple', :q))
           AND (:category IS NULL OR e.category = :category)
           AND (:format   IS NULL OR e.format   = :format)
           AND (:city     IS NULL OR e.city     = :city)
           AND (:level    IS NULL OR e.level    = :level)
      ORDER BY
           CASE WHEN :sort = 'relevance'
                THEN ts_rank(
                       to_tsvector('simple',
                         coalesce(e.title, '') || ' ' ||
                         coalesce(e.description, '')
                       ),
                       plainto_tsquery('simple', :q)
                     )
           END ASC,
           CASE WHEN :sort = 'date'      THEN e.date         END ASC,
           CASE WHEN :sort = 'rating'    THEN sub.avg_rating END DESC,
           CASE WHEN :sort = 'popularity' THEN sub.popularity END DESC
        """,
            nativeQuery = true
    )
    List<Event> searchWithFilters(
            @Param("q")        String q,
            @Param("category") String category,
            @Param("format")   String format,
            @Param("city")     String city,
            @Param("level")    String level,
            @Param("sort")     String sort
    );
}