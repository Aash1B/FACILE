package com.facile.productinventoryservice.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ProductImageUpdateRequest {
    private String primaryImage;
    private List<String> images = new ArrayList<>();
}
