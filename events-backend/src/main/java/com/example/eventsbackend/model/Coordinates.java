package com.example.eventsbackend.model;

import lombok.Getter;

@Getter
public class Coordinates {
    private final double latitude;
    private final double longitude;

    public Coordinates(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

}
