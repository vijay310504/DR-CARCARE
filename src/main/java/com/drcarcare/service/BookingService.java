package com.drcarcare.service;

import com.drcarcare.dto.BookingRequest;
import com.drcarcare.dto.BookingResponse;
import com.drcarcare.entity.Booking;
import com.drcarcare.entity.Customer;
import com.drcarcare.entity.Vehicle;
import com.drcarcare.repository.BookingRepository;
import com.drcarcare.repository.CustomerRepository;
import com.drcarcare.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE BOOKING
    // =========================================================

    @Transactional
    public BookingResponse createBooking(
            BookingRequest request
    ) {

        Customer customer = customerRepository
                .findById(request.getCustomerId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: "
                                        + request.getCustomerId()
                        )
                );

        Vehicle vehicle = vehicleRepository
                .findById(request.getVehicleId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vehicle not found with id: "
                                        + request.getVehicleId()
                        )
                );

        // Make sure the selected vehicle belongs to
        // the selected customer.
        if (!vehicle.getCustomer()
                .getId()
                .equals(customer.getId())) {

            throw new RuntimeException(
                    "Vehicle does not belong to the selected customer"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        Booking booking = Booking.builder()
                .bookingCode(generateBookingCode())
                .customer(customer)
                .vehicle(vehicle)
                .bookingDate(request.getBookingDate())
                .expectedArrivalTime(
                        request.getExpectedArrivalTime()
                )
                .serviceType(request.getServiceType())
                .customerComplaint(
                        request.getCustomerComplaint()
                )
                .status("BOOKED")
                .notes(request.getNotes())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Booking savedBooking =
                bookingRepository.save(booking);

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "BOOKING_CREATED",
                "BOOKING",
                savedBooking.getId(),
                "Booking created: "
                        + savedBooking.getBookingCode(),
                null,
                "Booking ID: " + savedBooking.getId()
                        + ", Code: "
                        + savedBooking.getBookingCode()
                        + ", Customer ID: "
                        + customer.getId()
                        + ", Vehicle ID: "
                        + vehicle.getId()
        );

        return mapToResponse(savedBooking);
    }


    // =========================================================
    // GET ALL BOOKINGS
    // =========================================================

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {

        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BOOKING BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {

        Booking booking = bookingRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + id
                        )
                );

        return mapToResponse(booking);
    }


    // =========================================================
    // UPDATE BOOKING
    // =========================================================

    @Transactional
    public BookingResponse updateBooking(
            Long id,
            BookingRequest request
    ) {

        Booking booking = bookingRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + id
                        )
                );

        // Capture old values
        String oldValues =
                "customerId="
                        + booking.getCustomer().getId()
                        + ", vehicleId="
                        + booking.getVehicle().getId()
                        + ", bookingDate="
                        + booking.getBookingDate()
                        + ", expectedArrivalTime="
                        + booking.getExpectedArrivalTime()
                        + ", serviceType="
                        + booking.getServiceType()
                        + ", customerComplaint="
                        + booking.getCustomerComplaint()
                        + ", status="
                        + booking.getStatus()
                        + ", notes="
                        + booking.getNotes();

        Customer customer = customerRepository
                .findById(request.getCustomerId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: "
                                        + request.getCustomerId()
                        )
                );

        Vehicle vehicle = vehicleRepository
                .findById(request.getVehicleId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vehicle not found with id: "
                                        + request.getVehicleId()
                        )
                );

        if (!vehicle.getCustomer()
                .getId()
                .equals(customer.getId())) {

            throw new RuntimeException(
                    "Vehicle does not belong to the selected customer"
            );
        }

        booking.setCustomer(customer);
        booking.setVehicle(vehicle);

        booking.setBookingDate(
                request.getBookingDate()
        );

        booking.setExpectedArrivalTime(
                request.getExpectedArrivalTime()
        );

        booking.setServiceType(
                request.getServiceType()
        );

        booking.setCustomerComplaint(
                request.getCustomerComplaint()
        );

        booking.setNotes(
                request.getNotes()
        );

        booking.setUpdatedAt(
                LocalDateTime.now()
        );

        Booking updatedBooking =
                bookingRepository.save(booking);

        // Capture new values
        String newValues =
                "customerId="
                        + updatedBooking.getCustomer().getId()
                        + ", vehicleId="
                        + updatedBooking.getVehicle().getId()
                        + ", bookingDate="
                        + updatedBooking.getBookingDate()
                        + ", expectedArrivalTime="
                        + updatedBooking.getExpectedArrivalTime()
                        + ", serviceType="
                        + updatedBooking.getServiceType()
                        + ", customerComplaint="
                        + updatedBooking.getCustomerComplaint()
                        + ", status="
                        + updatedBooking.getStatus()
                        + ", notes="
                        + updatedBooking.getNotes();

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "BOOKING_UPDATED",
                "BOOKING",
                updatedBooking.getId(),
                "Booking updated: "
                        + updatedBooking.getBookingCode(),
                oldValues,
                newValues
        );

        return mapToResponse(updatedBooking);
    }


    // =========================================================
    // UPDATE BOOKING STATUS
    // =========================================================

    @Transactional
    public BookingResponse updateBookingStatus(
            Long id,
            String status
    ) {

        Booking booking = bookingRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + id
                        )
                );

        validateStatus(status);

        String oldStatus = booking.getStatus();
        String newStatus = status.toUpperCase();

        booking.setStatus(newStatus);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking =
                bookingRepository.save(booking);

        // Booking status changes are recorded as BOOKING_UPDATED
        // because the current action list does not contain
        // BOOKING_STATUS_CHANGED.

        auditLogService.log(
                "BOOKING_UPDATED",
                "BOOKING",
                updatedBooking.getId(),
                "Booking status updated: "
                        + updatedBooking.getBookingCode(),
                "status=" + oldStatus,
                "status=" + newStatus
        );

        return mapToResponse(updatedBooking);
    }


    // =========================================================
    // CANCEL BOOKING
    // =========================================================

    @Transactional
    public void cancelBooking(Long id) {

        Booking booking = bookingRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: "
                                        + id
                        )
                );

        String oldStatus = booking.getStatus();

        booking.setStatus("CANCELLED");
        booking.setUpdatedAt(LocalDateTime.now());

        bookingRepository.save(booking);

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "BOOKING_CANCELLED",
                "BOOKING",
                booking.getId(),
                "Booking cancelled: "
                        + booking.getBookingCode(),
                "status=" + oldStatus,
                "status=CANCELLED"
        );
    }


    // =========================================================
    // GET BOOKINGS BY CUSTOMER
    // =========================================================

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCustomer(
            Long customerId
    ) {

        if (!customerRepository.existsById(customerId)) {

            throw new RuntimeException(
                    "Customer not found with id: "
                            + customerId
            );
        }

        return bookingRepository
                .findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BOOKINGS BY VEHICLE
    // =========================================================

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByVehicle(
            Long vehicleId
    ) {

        if (!vehicleRepository.existsById(vehicleId)) {

            throw new RuntimeException(
                    "Vehicle not found with id: "
                            + vehicleId
            );
        }

        return bookingRepository
                .findByVehicleId(vehicleId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BOOKINGS BY DATE
    // =========================================================

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByDate(
            java.time.LocalDate date
    ) {

        return bookingRepository
                .findByBookingDate(date)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BOOKINGS BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByStatus(
            String status
    ) {

        validateStatus(status);

        return bookingRepository
                .findByStatus(status.toUpperCase())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GENERATE BOOKING CODE
    // =========================================================

    private String generateBookingCode() {

        long nextNumber =
                bookingRepository.count() + 1;

        String bookingCode =
                "BKG-" + String.format(
                        "%06d",
                        nextNumber
                );

        while (bookingRepository
                .existsByBookingCode(bookingCode)) {

            nextNumber++;

            bookingCode =
                    "BKG-" + String.format(
                            "%06d",
                            nextNumber
                    );
        }

        return bookingCode;
    }


    // =========================================================
    // VALIDATE STATUS
    // =========================================================

    private void validateStatus(String status) {

        if (status == null) {
            throw new RuntimeException(
                    "Booking status is required"
            );
        }

        String normalizedStatus =
                status.toUpperCase();

        if (!normalizedStatus.equals("BOOKED")
                && !normalizedStatus.equals("CONFIRMED")
                && !normalizedStatus.equals("ARRIVED")
                && !normalizedStatus.equals("CANCELLED")) {

            throw new RuntimeException(
                    "Invalid booking status: "
                            + status
            );
        }
    }


    // =========================================================
    // ENTITY → RESPONSE DTO
    // =========================================================

    private BookingResponse mapToResponse(
            Booking booking
    ) {

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(
                        booking.getBookingCode()
                )
                .customerId(
                        booking.getCustomer().getId()
                )
                .customerName(
                        booking.getCustomer().getName()
                )
                .vehicleId(
                        booking.getVehicle().getId()
                )
                .vehicleNumber(
                        booking.getVehicle()
                                .getVehicleNumber()
                )
                .vehicleMake(
                        booking.getVehicle()
                                .getMake()
                )
                .vehicleModel(
                        booking.getVehicle()
                                .getModel()
                )
                .bookingDate(
                        booking.getBookingDate()
                )
                .expectedArrivalTime(
                        booking.getExpectedArrivalTime()
                )
                .serviceType(
                        booking.getServiceType()
                )
                .customerComplaint(
                        booking.getCustomerComplaint()
                )
                .status(
                        booking.getStatus()
                )
                .notes(
                        booking.getNotes()
                )
                .createdAt(
                        booking.getCreatedAt()
                )
                .updatedAt(
                        booking.getUpdatedAt()
                )
                .build();
    }
}