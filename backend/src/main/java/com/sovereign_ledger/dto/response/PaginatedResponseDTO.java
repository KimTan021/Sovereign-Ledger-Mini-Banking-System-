package com.sovereign_ledger.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedResponseDTO<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int size;
    private int number;
}
