package com.drcarcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobCardReportResponse {

    private String fromDate;
    private String toDate;

    private Summary summary;

    private List<StatusSummary> statuses;

    private List<DailyJobCard> dailyJobCards;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {

        private Long totalOpened;

        private Long active;

        private Long delivered;

        private Long cancelled;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusSummary {

        private String status;

        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyJobCard {

        private String date;

        private Long opened;

        private Long delivered;
    }
}