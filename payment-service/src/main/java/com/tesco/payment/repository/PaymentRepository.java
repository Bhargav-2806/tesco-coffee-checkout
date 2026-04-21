// Spring Data repository — Spring auto-generates the implementation at startup
package com.tesco.payment.repository;

import com.tesco.payment.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

// Extending JpaRepository gives us save(), findById(), findAll(), delete(), count() for free
public interface PaymentRepository extends JpaRepository<PaymentRecord, UUID> {
}
