// 3) src/main/java/com/example/eventsbackend/dto/RsvpDto.java
package com.example.eventsbackend.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RsvpDto {
    private long count;
    private boolean going;
    private Double averageRating;
    Integer userRating;
}
