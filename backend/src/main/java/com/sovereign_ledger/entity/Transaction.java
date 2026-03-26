package com.sovereign_ledger.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="transaction")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Integer transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "transaction_type")
    private String transactionType;

    @Column(name = "transaction_amount")
    private BigDecimal transactionAmount;

    @Column(name = "account_id_destination")
    private Integer accountIdDestination;

    @Column(name = "logs")
    private String logs;

    @Column(name = "transaction_time")
    private LocalDateTime transactionTime;

    @Column(name = "transaction_description")
    private String transactionDescription;

    @Column(name = "transaction_status")
    private String transactionStatus;
}
