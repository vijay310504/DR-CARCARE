package com.drcarcare.service;

import com.drcarcare.dto.JobCardRequest;
import com.drcarcare.dto.JobCardResponse;
import com.drcarcare.entity.Booking;
import com.drcarcare.entity.JobCard;
import com.drcarcare.repository.BookingRepository;
import com.drcarcare.repository.JobCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobCardService {

    private final JobCardRepository jobCardRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public JobCardResponse createJobCard(
            JobCardRequest request
    ) {

        if (jobCardRepository.existsByBookingId(
                request.getBookingId()
        )) {

            throw new RuntimeException(
                    "Job card already exists for booking id: "
                            + request.getBookingId()
            );
        }

        Booking booking = bookingRepository
                .findById(request.getBookingId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + request.getBookingId()
                        )
                );

        if ("CANCELLED".equalsIgnoreCase(
                booking.getStatus()
        )) {

            throw new RuntimeException(
                    "Cannot create job card for a cancelled booking"
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        JobCard jobCard = JobCard.builder()
                .jobCardNumber(
                        generateJobCardNumber()
                )
                .booking(booking)
                .customer(booking.getCustomer())
                .vehicle(booking.getVehicle())
                .openingMileage(
                        request.getOpeningMileage()
                )
                .fuelLevel(
                        request.getFuelLevel()
                )
                .customerComplaint(
                        request.getCustomerComplaint() != null
                                ? request.getCustomerComplaint()
                                : booking.getCustomerComplaint()
                )
                .advisorNotes(
                        request.getAdvisorNotes()
                )
                .status("RECEIVED")
                .openedAt(now)
                .updatedAt(now)
                .build();

        JobCard savedJobCard =
                jobCardRepository.save(jobCard);

        // Booking has now arrived at the workshop.
        booking.setStatus("ARRIVED");
        booking.setUpdatedAt(now);
        bookingRepository.save(booking);

        return mapToResponse(savedJobCard);
    }

    @Transactional(readOnly = true)
    public List<JobCardResponse> getAllJobCards() {

        return jobCardRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobCardResponse getJobCardById(
            Long id
    ) {

        JobCard jobCard =
                jobCardRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card not found with id: "
                                                + id
                                )
                        );

        return mapToResponse(jobCard);
    }

    @Transactional
    public JobCardResponse updateJobCard(
            Long id,
            JobCardRequest request
    ) {

        JobCard jobCard =
                jobCardRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card not found with id: "
                                                + id
                                )
                        );

        if (!jobCard.getBooking()
                .getId()
                .equals(request.getBookingId())) {

            throw new RuntimeException(
                    "Booking cannot be changed for an existing job card"
            );
        }

        jobCard.setOpeningMileage(
                request.getOpeningMileage()
        );

        jobCard.setFuelLevel(
                request.getFuelLevel()
        );

        jobCard.setCustomerComplaint(
                request.getCustomerComplaint()
        );

        jobCard.setAdvisorNotes(
                request.getAdvisorNotes()
        );

        jobCard.setUpdatedAt(
                LocalDateTime.now()
        );

        JobCard updatedJobCard =
                jobCardRepository.save(jobCard);

        return mapToResponse(updatedJobCard);
    }

    @Transactional
    public JobCardResponse updateJobCardStatus(
            Long id,
            String status
    ) {

        JobCard jobCard =
                jobCardRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card not found with id: "
                                                + id
                                )
                        );

        validateStatus(status);

        String normalizedStatus =
                status.toUpperCase();

        jobCard.setStatus(normalizedStatus);

        LocalDateTime now =
                LocalDateTime.now();

        jobCard.setUpdatedAt(now);

        if ("DELIVERED".equals(normalizedStatus)) {
            jobCard.setClosedAt(now);
        }

        JobCard updatedJobCard =
                jobCardRepository.save(jobCard);

        return mapToResponse(updatedJobCard);
    }

    @Transactional(readOnly = true)
    public JobCardResponse getJobCardByBooking(
            Long bookingId
    ) {

        JobCard jobCard =
                jobCardRepository
                        .findByBookingId(bookingId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card not found for booking id: "
                                                + bookingId
                                )
                        );

        return mapToResponse(jobCard);
    }

    @Transactional(readOnly = true)
    public List<JobCardResponse> getJobCardsByCustomer(
            Long customerId
    ) {

        return jobCardRepository
                .findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<JobCardResponse> getJobCardsByVehicle(
            Long vehicleId
    ) {

        return jobCardRepository
                .findByVehicleId(vehicleId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<JobCardResponse> getJobCardsByStatus(
            String status
    ) {

        validateStatus(status);

        return jobCardRepository
                .findByStatus(status.toUpperCase())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private String generateJobCardNumber() {

        long nextNumber =
                jobCardRepository.count() + 1;

        String jobCardNumber =
                "JC-" + String.format(
                        "%06d",
                        nextNumber
                );

        while (jobCardRepository
                .existsByJobCardNumber(jobCardNumber)) {

            nextNumber++;

            jobCardNumber =
                    "JC-" + String.format(
                            "%06d",
                            nextNumber
                    );
        }

        return jobCardNumber;
    }

    private void validateStatus(
            String status
    ) {

        if (status == null) {
            throw new RuntimeException(
                    "Job card status is required"
            );
        }

        String normalizedStatus =
                status.toUpperCase();

        if (!normalizedStatus.equals("RECEIVED")
                && !normalizedStatus.equals("INSPECTION")
                && !normalizedStatus.equals("ESTIMATE")
                && !normalizedStatus.equals("WAITING_APPROVAL")
                && !normalizedStatus.equals("APPROVED")
                && !normalizedStatus.equals("UNDER_SERVICE")
                && !normalizedStatus.equals("QUALITY_CHECK")
                && !normalizedStatus.equals("READY")
                && !normalizedStatus.equals("DELIVERED")) {

            throw new RuntimeException(
                    "Invalid job card status: "
                            + status
            );
        }
    }

    private JobCardResponse mapToResponse(
            JobCard jobCard
    ) {

        return JobCardResponse.builder()
                .id(jobCard.getId())
                .jobCardNumber(
                        jobCard.getJobCardNumber()
                )
                .bookingId(
                        jobCard.getBooking().getId()
                )
                .bookingCode(
                        jobCard.getBooking().getBookingCode()
                )
                .customerId(
                        jobCard.getCustomer().getId()
                )
                .customerName(
                        jobCard.getCustomer().getName()
                )
                .vehicleId(
                        jobCard.getVehicle().getId()
                )
                .vehicleNumber(
                        jobCard.getVehicle()
                                .getVehicleNumber()
                )
                .vehicleMake(
                        jobCard.getVehicle()
                                .getMake()
                )
                .vehicleModel(
                        jobCard.getVehicle()
                                .getModel()
                )
                .openingMileage(
                        jobCard.getOpeningMileage()
                )
                .fuelLevel(
                        jobCard.getFuelLevel()
                )
                .customerComplaint(
                        jobCard.getCustomerComplaint()
                )
                .advisorNotes(
                        jobCard.getAdvisorNotes()
                )
                .status(
                        jobCard.getStatus()
                )
                .openedAt(
                        jobCard.getOpenedAt()
                )
                .updatedAt(
                        jobCard.getUpdatedAt()
                )
                .closedAt(
                        jobCard.getClosedAt()
                )
                .build();
    }
}