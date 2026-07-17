package com.facile.productinventoryservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductReviewRequest {
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @Size(max = 120)
    private String title;

    @NotBlank
    @Size(max = 2000)
    private String comment;
}
