package com.drcarcare.controller;

import com.drcarcare.dto.BookingRequest;
import com.drcarcare.dto.BookingResponse;
import com.drcarcare.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request
    ) {

        BookingResponse response =
                bookingService.createBooking(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>>
    getAllBookings() {

        return ResponseEntity.ok(
                bookingService.getAllBookings()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                bookingService.getBookingById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequest request
    ) {

        return ResponseEntity.ok(
                bookingService.updateBooking(
                        id,
                        request
                )
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse>
    updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                bookingService.updateBookingStatus(
                        id,
                        status
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long id
    ) {

        bookingService.cancelBooking(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BookingResponse>>
    getBookingsByCustomer(
            @PathVariable Long customerId
    ) {

        return ResponseEntity.ok(
                bookingService.getBookingsByCustomer(
                        customerId
                )
        );
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<BookingResponse>>
    getBookingsByVehicle(
            @PathVariable Long vehicleId
    ) {

        return ResponseEntity.ok(
                bookingService.getBookingsByVehicle(
                        vehicleId
                )
        );
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<BookingResponse>>
    getBookingsByDate(
            @PathVariable
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date
    ) {

        return ResponseEntity.ok(
                bookingService.getBookingsByDate(date)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<BookingResponse>>
    getBookingsByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                bookingService.getBookingsByStatus(status)
        );
    }
}