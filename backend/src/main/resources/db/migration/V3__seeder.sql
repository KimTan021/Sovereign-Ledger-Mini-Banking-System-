-- =============================================================
-- Database Seeder
-- Schema: mydb
-- Covers: user, account, transaction
-- Date range: 2026-01-01 to 2026-03-26
-- =============================================================

USE `bankdb`;

-- =============================================================
-- USERS (10 users, plaintext passwords for testing)
-- =============================================================
INSERT INTO `user` (`first_name`, `middle_name`, `last_name`, `user_email`, `password`, `role`) VALUES
('Alice',   'Marie',     'Santos',     'alice.santos@email.com',     'password123', 'admin'),
('Bob',     'Cruz',      'Reyes',      'bob.reyes@email.com',        'password123', 'user'),
('Carol',   'Ann',       'Dela Cruz',  'carol.delacruz@email.com',   'password123', 'user'),
('David',   'Jose',      'Mendoza',    'david.mendoza@email.com',    'password123', 'user'),
('Eva',     'Grace',     'Villanueva', 'eva.villanueva@email.com',   'password123', 'user'),
('Frank',   'Luis',      'Garcia',     'frank.garcia@email.com',     'password123', 'user'),
('Grace',   'Hope',      'Torres',     'grace.torres@email.com',     'password123', 'user'),
('Henry',   'Ramon',     'Lim',        'henry.lim@email.com',        'password123', 'user'),
('Isabel',  'Faith',     'Navarro',    'isabel.navarro@email.com',   'password123', 'user'),
('James',   'Patrick',   'Aquino',     'james.aquino@email.com',     'password123', 'user');

-- =============================================================
-- ACCOUNTS
-- account_status: 'VERIFIED' | 'FLAGGED' | 'UNDER REVIEW' | 'FROZEN'
-- user_id 1  = Alice    → ACC-0001 (savings),  ACC-0002 (checking)
-- user_id 2  = Bob      → ACC-0003 (savings),  ACC-0004 (checking), ACC-0005 (savings)
-- user_id 3  = Carol    → ACC-0006 (savings)
-- user_id 4  = David    → ACC-0007 (checking), ACC-0008 (savings)
-- user_id 5  = Eva      → ACC-0009 (savings),  ACC-0010 (checking)
-- user_id 6  = Frank    → ACC-0011 (savings),  ACC-0012 (checking)
-- user_id 7  = Grace    → ACC-0013 (savings)
-- user_id 8  = Henry    → ACC-0014 (checking), ACC-0015 (savings)
-- user_id 9  = Isabel   → ACC-0016 (savings),  ACC-0017 (checking), ACC-0018 (savings)
-- user_id 10 = James    → ACC-0019 (checking)
-- =============================================================
INSERT INTO `account` (`user_id`, `account_number`, `account_type`, `account_balance`, `account_status`) VALUES
-- Alice (user_id = 1)
(1,  'ACC-0001', 'savings',  28400.00, 'VERIFIED'),
(1,  'ACC-0002', 'checking',  4100.25, 'VERIFIED'),
-- Bob (user_id = 2)
(2,  'ACC-0003', 'savings',  61500.00, 'VERIFIED'),
(2,  'ACC-0004', 'checking',  7350.75, 'VERIFIED'),
(2,  'ACC-0005', 'savings',  14200.00, 'FLAGGED'),
-- Carol (user_id = 3)
(3,  'ACC-0006', 'savings',  33100.00, 'VERIFIED'),
-- David (user_id = 4)
(4,  'ACC-0007', 'checking',  9500.00, 'VERIFIED'),
(4,  'ACC-0008', 'savings',  47000.00, 'VERIFIED'),
-- Eva (user_id = 5)
(5,  'ACC-0009', 'savings',  21800.00, 'VERIFIED'),
(5,  'ACC-0010', 'checking',  6250.50, 'VERIFIED'),
-- Frank (user_id = 6)
(6,  'ACC-0011', 'savings',  18500.00, 'VERIFIED'),
(6,  'ACC-0012', 'checking',  3900.00, 'VERIFIED'),
-- Grace (user_id = 7)
(7,  'ACC-0013', 'savings',  25600.00, 'VERIFIED'),
-- Henry (user_id = 8)
(8,  'ACC-0014', 'checking',  5100.00, 'VERIFIED'),
(8,  'ACC-0015', 'savings',  39200.00, 'VERIFIED'),
-- Isabel (user_id = 9)
(9,  'ACC-0016', 'savings',  52000.00, 'VERIFIED'),
(9,  'ACC-0017', 'checking',  8750.00, 'VERIFIED'),
(9,  'ACC-0018', 'savings',  11300.00, 'VERIFIED'),
-- James (user_id = 10)
(10, 'ACC-0019', 'checking',  6800.00, 'VERIFIED');

-- =============================================================
-- TRANSACTIONS
-- transaction_status: 'completed' | 'failed' | 'pending'
-- Transfer pairs share the same timestamp to indicate they are
-- part of the same operation.
-- =============================================================
INSERT INTO `transaction`
    (`account_id`, `transaction_type`, `transaction_amount`, `account_id_destination`,
     `logs`, `transaction_time`, `transaction_description`, `transaction_status`)
VALUES

-- =============================================================
-- JANUARY 2026
-- =============================================================

-- Alice (ACC-0001 savings, ACC-0002 checking)
(1,  'credit', 6000.00, NULL, 'Salary deposit to savings ACC-0001',                         '2026-01-05 09:00:00.0', 'Monthly salary',                    'completed'),
(2,  'debit',   350.00, NULL, 'Online bill payment from checking ACC-0002',                 '2026-01-08 11:00:00.0', 'Electricity bill',                  'completed'),
(1,  'debit',  1000.00,    2, 'Transfer from savings ACC-0001 to checking ACC-0002',        '2026-01-12 10:00:00.0', 'Self-transfer for expenses',        'completed'),
(2,  'credit', 1000.00,    1, 'Transfer received from savings ACC-0001',                    '2026-01-12 10:00:00.0', 'Self-transfer from savings',        'completed'),
(2,  'debit',   200.00, NULL, 'ATM withdrawal from checking ACC-0002',                      '2026-01-20 14:30:00.0', 'Cash withdrawal',                   'completed'),

-- Bob (ACC-0003 savings, ACC-0004 checking, ACC-0005 savings)
(3,  'credit', 8000.00, NULL, 'Salary deposit to savings ACC-0003',                         '2026-01-05 09:15:00.0', 'Monthly salary',                    'completed'),
(4,  'debit',   500.00, NULL, 'POS purchase from checking ACC-0004',                        '2026-01-09 13:00:00.0', 'Grocery shopping',                  'completed'),
(3,  'debit',  2000.00,    4, 'Transfer from savings ACC-0003 to checking ACC-0004',        '2026-01-14 10:00:00.0', 'Self-transfer for monthly budget',  'completed'),
(4,  'credit', 2000.00,    3, 'Transfer received from savings ACC-0003',                    '2026-01-14 10:00:00.0', 'Self-transfer from savings',        'completed'),
(5,  'credit', 1500.00, NULL, 'Deposit to savings ACC-0005',                                '2026-01-25 09:00:00.0', 'Personal savings deposit',          'completed'),

-- Carol (ACC-0006 savings)
(6,  'credit', 5000.00, NULL, 'Salary deposit to savings ACC-0006',                         '2026-01-05 09:30:00.0', 'Monthly salary',                    'completed'),
(6,  'debit',   500.00, NULL, 'ATM withdrawal from savings ACC-0006',                       '2026-01-10 15:00:00.0', 'Cash withdrawal',                   'completed'),
(6,  'debit',   300.00, NULL, 'Online payment from savings ACC-0006',                       '2026-01-18 10:00:00.0', 'Internet subscription',             'completed'),
(6,  'credit', 1000.00,   15, 'Transfer received from ACC-0015 (Henry Lim)',                '2026-01-22 11:30:00.0', 'Payment from Henry',                'completed'),

-- David (ACC-0007 checking, ACC-0008 savings)
(7,  'credit', 4000.00, NULL, 'Salary deposit to checking ACC-0007',                        '2026-01-05 09:45:00.0', 'Monthly salary',                    'completed'),
(8,  'credit', 2000.00, NULL, 'Deposit to savings ACC-0008',                                '2026-01-06 10:00:00.0', 'Savings deposit',                   'completed'),
(7,  'debit',   600.00, NULL, 'Bill payment from checking ACC-0007',                        '2026-01-11 08:00:00.0', 'Water and utility bill',            'completed'),
(8,  'debit',  1500.00,    6, 'Transfer from savings ACC-0008 to ACC-0006 (Carol)',         '2026-01-16 10:00:00.0', 'Payment to Carol Dela Cruz',        'completed'),
(6,  'credit', 1500.00,    8, 'Transfer received from ACC-0008 (David Mendoza)',            '2026-01-16 10:00:00.0', 'Payment received from David',       'completed'),

-- Eva (ACC-0009 savings, ACC-0010 checking)
(9,  'credit', 5500.00, NULL, 'Salary deposit to savings ACC-0009',                         '2026-01-05 10:00:00.0', 'Monthly salary',                    'completed'),
(10, 'debit',   400.00, NULL, 'POS purchase from checking ACC-0010',                        '2026-01-09 16:00:00.0', 'Dining out',                        'completed'),
(9,  'debit',  1500.00,    1, 'Transfer from savings ACC-0009 to ACC-0001 (Alice)',         '2026-01-15 11:00:00.0', 'Payment to Alice Santos',           'completed'),
(1,  'credit', 1500.00,    9, 'Transfer received from ACC-0009 (Eva Villanueva)',           '2026-01-15 11:00:00.0', 'Payment received from Eva',         'completed'),
(10, 'debit',   250.00, NULL, 'ATM withdrawal from checking ACC-0010',                      '2026-01-28 13:00:00.0', 'Cash withdrawal',                   'completed'),

-- Frank (ACC-0011 savings, ACC-0012 checking)
(11, 'credit', 4500.00, NULL, 'Salary deposit to savings ACC-0011',                         '2026-01-05 10:15:00.0', 'Monthly salary',                    'completed'),
(12, 'debit',   300.00, NULL, 'Online payment from checking ACC-0012',                      '2026-01-07 09:00:00.0', 'Streaming subscription',            'completed'),
(11, 'debit',  1000.00,   12, 'Self-transfer from savings ACC-0011 to checking ACC-0012',  '2026-01-13 10:00:00.0', 'Self-transfer for monthly budget',  'completed'),
(12, 'credit', 1000.00,   11, 'Transfer received from savings ACC-0011',                   '2026-01-13 10:00:00.0', 'Self-transfer from savings',        'completed'),
(12, 'debit',   450.00, NULL, 'POS purchase from checking ACC-0012',                       '2026-01-21 14:00:00.0', 'Clothing purchase',                 'completed'),

-- Grace (ACC-0013 savings)
(13, 'credit', 5000.00, NULL, 'Salary deposit to savings ACC-0013',                         '2026-01-05 10:30:00.0', 'Monthly salary',                    'completed'),
(13, 'debit',   600.00, NULL, 'ATM withdrawal from savings ACC-0013',                       '2026-01-11 12:00:00.0', 'Cash withdrawal',                   'completed'),
(13, 'debit',   200.00, NULL, 'Online payment from savings ACC-0013',                       '2026-01-17 09:00:00.0', 'Phone bill',                        'completed'),
(13, 'credit',  800.00,   19, 'Transfer received from ACC-0019 (James Aquino)',             '2026-01-23 15:00:00.0', 'Payment received from James',       'completed'),

-- Henry (ACC-0014 checking, ACC-0015 savings)
(15, 'credit', 6000.00, NULL, 'Salary deposit to savings ACC-0015',                         '2026-01-05 10:45:00.0', 'Monthly salary',                    'completed'),
(14, 'debit',   500.00, NULL, 'Bill payment from checking ACC-0014',                        '2026-01-08 08:30:00.0', 'Electricity bill',                  'completed'),
(15, 'debit',  1000.00,    6, 'Transfer from savings ACC-0015 to ACC-0006 (Carol)',         '2026-01-22 11:30:00.0', 'Payment to Carol Dela Cruz',        'completed'),
(6,  'credit', 1000.00,   15, 'Transfer received from ACC-0015 (Henry Lim)',                '2026-01-22 11:30:00.0', 'Payment received from Henry',       'completed'),
(14, 'debit',   300.00, NULL, 'POS purchase from checking ACC-0014',                        '2026-01-27 16:00:00.0', 'Grocery shopping',                  'completed'),

-- Isabel (ACC-0016 savings, ACC-0017 checking, ACC-0018 savings)
(16, 'credit', 7000.00, NULL, 'Salary deposit to savings ACC-0016',                         '2026-01-05 11:00:00.0', 'Monthly salary',                    'completed'),
(17, 'debit',   450.00, NULL, 'Online payment from checking ACC-0017',                      '2026-01-09 09:00:00.0', 'Utility bill',                      'completed'),
(16, 'debit',  2000.00,   17, 'Self-transfer from savings ACC-0016 to checking ACC-0017',  '2026-01-14 10:00:00.0', 'Self-transfer for monthly budget',  'completed'),
(17, 'credit', 2000.00,   16, 'Transfer received from savings ACC-0016',                   '2026-01-14 10:00:00.0', 'Self-transfer from savings',        'completed'),
(18, 'credit', 1000.00, NULL, 'Deposit to savings ACC-0018',                               '2026-01-29 09:00:00.0', 'Emergency fund deposit',            'completed'),

-- James (ACC-0019 checking)
(19, 'credit', 4000.00, NULL, 'Salary deposit to checking ACC-0019',                        '2026-01-05 11:15:00.0', 'Monthly salary',                    'completed'),
(19, 'debit',   800.00,   13, 'Transfer from checking ACC-0019 to ACC-0013 (Grace)',        '2026-01-23 15:00:00.0', 'Payment to Grace Torres',           'completed'),
(13, 'credit',  800.00,   19, 'Transfer received from ACC-0019 (James Aquino)',             '2026-01-23 15:00:00.0', 'Payment received from James',       'completed'),
(19, 'debit',   350.00, NULL, 'POS purchase from checking ACC-0019',                        '2026-01-26 13:30:00.0', 'Electronics purchase',              'completed'),
(19, 'debit',   200.00, NULL, 'ATM withdrawal from checking ACC-0019',                      '2026-01-30 10:00:00.0', 'Cash withdrawal',                   'completed'),


-- =============================================================
-- FEBRUARY 2026
-- =============================================================

-- Alice (ACC-0001 savings, ACC-0002 checking)
(1,  'credit', 6000.00, NULL, 'Salary deposit to savings ACC-0001',                         '2026-02-05 09:00:00.0', 'Monthly salary',                    'completed'),
(2,  'debit',   350.00, NULL, 'Online bill payment from checking ACC-0002',                 '2026-02-07 11:00:00.0', 'Electricity bill',                  'completed'),
(1,  'debit',  2000.00,    7, 'Transfer from savings ACC-0001 to ACC-0007 (David)',         '2026-02-12 10:00:00.0', 'Payment to David Mendoza',          'completed'),
(7,  'credit', 2000.00,    1, 'Transfer received from ACC-0001 (Alice Santos)',             '2026-02-12 10:00:00.0', 'Payment received from Alice',       'completed'),
(2,  'debit',   150.00, NULL, 'POS purchase from checking ACC-0002',                        '2026-02-20 14:30:00.0', 'Grocery shopping',                  'completed'),

-- Bob (ACC-0003 savings, ACC-0004 checking, ACC-0005 savings)
(3,  'credit', 8000.00, NULL, 'Salary deposit to savings ACC-0003',                         '2026-02-05 09:15:00.0', 'Monthly salary',                    'completed'),
(4,  'debit',   600.00, NULL, 'Bill payment from checking ACC-0004',                        '2026-02-08 08:00:00.0', 'Internet and cable bill',           'completed'),
(5,  'credit', 2000.00, NULL, 'Deposit to savings ACC-0005',                                '2026-02-10 09:00:00.0', 'Additional savings deposit',        'completed'),
(4,  'debit',  1000.00,    9, 'Transfer from checking ACC-0004 to ACC-0009 (Eva)',          '2026-02-14 11:00:00.0', 'Payment to Eva Villanueva',         'completed'),
(9,  'credit', 1000.00,    4, 'Transfer received from ACC-0004 (Bob Reyes)',                '2026-02-14 11:00:00.0', 'Payment received from Bob',         'completed'),

-- Carol (ACC-0006 savings)
(6,  'credit', 5000.00, NULL, 'Salary deposit to savings ACC-0006',                         '2026-02-05 09:30:00.0', 'Monthly salary',                    'completed'),
(6,  'debit',   700.00, NULL, 'ATM withdrawal from savings ACC-0006',                       '2026-02-09 15:00:00.0', 'Cash withdrawal',                   'completed'),
(6,  'debit',   250.00, NULL, 'Online payment from savings ACC-0006',                       '2026-02-16 10:00:00.0', 'Streaming subscription',            'completed'),
(6,  'credit', 2500.00,    8, 'Transfer received from ACC-0008 (David Mendoza)',            '2026-02-20 10:00:00.0', 'Payment received from David',       'completed'),

-- David (ACC-0007 checking, ACC-0008 savings)
(7,  'credit', 4000.00, NULL, 'Salary deposit to checking ACC-0007',                        '2026-02-05 09:45:00.0', 'Monthly salary',                    'completed'),
(8,  'debit',  2500.00,    6, 'Transfer from savings ACC-0008 to ACC-0006 (Carol)',         '2026-02-20 10:00:00.0', 'Payment to Carol Dela Cruz',        'completed'),
(6,  'credit', 2500.00,    8, 'Transfer received from ACC-0008 (David Mendoza)',            '2026-02-20 10:00:00.0', 'Payment received from David',       'completed'),
(7,  'debit',   600.00, NULL, 'Bill payment from checking ACC-0007',                        '2026-02-18 08:00:00.0', 'Water and utility bill',            'completed'),
(8,  'credit', 3000.00, NULL, 'Deposit to savings ACC-0008',                               '2026-02-25 09:00:00.0', 'Savings deposit',                   'completed'),

-- Eva (ACC-0009 savings, ACC-0010 checking)
(9,  'credit', 5500.00, NULL, 'Salary deposit to savings ACC-0009',                         '2026-02-05 10:00:00.0', 'Monthly salary',                    'completed'),
(10, 'debit',   400.00, NULL, 'POS purchase from checking ACC-0010',                        '2026-02-10 15:30:00.0', 'Grocery shopping',                  'completed'),
(9,  'debit',  1200.00,   16, 'Transfer from savings ACC-0009 to ACC-0016 (Isabel)',        '2026-02-17 11:00:00.0', 'Payment to Isabel Navarro',         'completed'),
(16, 'credit', 1200.00,    9, 'Transfer received from ACC-0009 (Eva Villanueva)',           '2026-02-17 11:00:00.0', 'Payment received from Eva',         'completed'),
(10, 'debit',   300.00, NULL, 'ATM withdrawal from checking ACC-0010',                      '2026-02-22 17:00:00.0', 'Cash withdrawal',                   'completed'),

-- Frank (ACC-0011 savings, ACC-0012 checking)
(11, 'credit', 4500.00, NULL, 'Salary deposit to savings ACC-0011',                         '2026-02-05 10:15:00.0', 'Monthly salary',                    'completed'),
(12, 'debit',   350.00, NULL, 'Bill payment from checking ACC-0012',                        '2026-02-08 09:00:00.0', 'Phone bill',                        'completed'),
(11, 'debit',  1500.00,   13, 'Transfer from savings ACC-0011 to ACC-0013 (Grace)',         '2026-02-15 10:00:00.0', 'Payment to Grace Torres',           'completed'),
(13, 'credit', 1500.00,   11, 'Transfer received from ACC-0011 (Frank Garcia)',             '2026-02-15 10:00:00.0', 'Payment received from Frank',       'completed'),
(12, 'debit',   500.00, NULL, 'POS purchase from checking ACC-0012',                        '2026-02-24 14:00:00.0', 'Home appliance purchase',           'completed'),

-- Grace (ACC-0013 savings)
(13, 'credit', 5000.00, NULL, 'Salary deposit to savings ACC-0013',                         '2026-02-05 10:30:00.0', 'Monthly salary',                    'completed'),
(13, 'debit',   700.00, NULL, 'ATM withdrawal from savings ACC-0013',                       '2026-02-11 12:00:00.0', 'Cash withdrawal',                   'completed'),
(13, 'debit',   250.00, NULL, 'Online payment from savings ACC-0013',                       '2026-02-19 09:00:00.0', 'Internet subscription',             'completed'),
(13, 'debit',   800.00,   19, 'Transfer from savings ACC-0013 to ACC-0019 (James)',         '2026-02-23 15:00:00.0', 'Payment to James Aquino',           'completed'),
(19, 'credit',  800.00,   13, 'Transfer received from ACC-0013 (Grace Torres)',             '2026-02-23 15:00:00.0', 'Payment received from Grace',       'completed'),

-- Henry (ACC-0014 checking, ACC-0015 savings)
(15, 'credit', 6000.00, NULL, 'Salary deposit to savings ACC-0015',                         '2026-02-05 10:45:00.0', 'Monthly salary',                    'completed'),
(14, 'debit',   450.00, NULL, 'Bill payment from checking ACC-0014',                        '2026-02-09 08:30:00.0', 'Electricity bill',                  'completed'),
(15, 'debit',  2000.00,   17, 'Transfer from savings ACC-0015 to ACC-0017 (Isabel)',        '2026-02-16 11:00:00.0', 'Payment to Isabel Navarro',         'completed'),
(17, 'credit', 2000.00,   15, 'Transfer received from ACC-0015 (Henry Lim)',               '2026-02-16 11:00:00.0', 'Payment received from Henry',       'completed'),
(14, 'debit',   350.00, NULL, 'POS purchase from checking ACC-0014',                        '2026-02-26 16:00:00.0', 'Dining out',                        'completed'),

-- Isabel (ACC-0016 savings, ACC-0017 checking, ACC-0018 savings)
(16, 'credit', 7000.00, NULL, 'Salary deposit to savings ACC-0016',                         '2026-02-05 11:00:00.0', 'Monthly salary',                    'completed'),
(17, 'debit',   500.00, NULL, 'Online payment from checking ACC-0017',                      '2026-02-09 09:00:00.0', 'Utility bill',                      'completed'),
(18, 'credit', 1500.00, NULL, 'Deposit to savings ACC-0018',                               '2026-02-13 09:00:00.0', 'Emergency fund deposit',            'completed'),
(16, 'debit',  1000.00,   18, 'Self-transfer from savings ACC-0016 to savings ACC-0018',   '2026-02-20 10:00:00.0', 'Self-transfer between savings',     'completed'),
(18, 'credit', 1000.00,   16, 'Transfer received from savings ACC-0016',                   '2026-02-20 10:00:00.0', 'Self-transfer from savings',        'completed'),

-- James (ACC-0019 checking)
(19, 'credit', 4000.00, NULL, 'Salary deposit to checking ACC-0019',                        '2026-02-05 11:15:00.0', 'Monthly salary',                    'completed'),
(19, 'debit',   500.00, NULL, 'Bill payment from checking ACC-0019',                        '2026-02-10 09:00:00.0', 'Electricity bill',                  'completed'),
(19, 'debit',   400.00, NULL, 'POS purchase from checking ACC-0019',                        '2026-02-17 13:30:00.0', 'Grocery shopping',                  'completed'),
(19, 'debit',   300.00, NULL, 'ATM withdrawal from checking ACC-0019',                      '2026-02-22 10:00:00.0', 'Cash withdrawal',                   'completed'),
(19, 'credit', 1000.00, NULL, 'Deposit to checking ACC-0019',                              '2026-02-27 09:00:00.0', 'Additional income deposit',         'completed'),


-- =============================================================
-- MARCH 2026
-- =============================================================

-- Alice (ACC-0001 savings, ACC-0002 checking)
(1,  'credit', 6000.00, NULL, 'Salary deposit to savings ACC-0001',                         '2026-03-05 09:00:00.0', 'Monthly salary',                    'completed'),
(1,  'debit',  2000.00,    7, 'Transfer from savings ACC-0001 to ACC-0007 (David)',         '2026-03-08 10:00:00.0', 'Payment to David Mendoza',          'completed'),
(7,  'credit', 2000.00,    1, 'Transfer received from ACC-0001 (Alice Santos)',             '2026-03-08 10:00:00.0', 'Payment received from Alice',       'completed'),
(2,  'debit',   350.00, NULL, 'Online bill payment from checking ACC-0002',                 '2026-03-10 11:00:00.0', 'Electricity bill',                  'completed'),
(2,  'debit',   500.00,   10, 'Transfer from checking ACC-0002 to ACC-0010 (Eva)',          '2026-03-22 16:00:00.0', 'Payment to Eva Villanueva',         'completed'),
(10, 'credit',  500.00,    2, 'Transfer received from ACC-0002 (Alice Santos)',             '2026-03-22 16:00:00.0', 'Payment received from Alice',       'completed'),

-- Bob (ACC-0003 savings, ACC-0004 checking, ACC-0005 savings)
(3,  'credit', 8000.00, NULL, 'Salary deposit to savings ACC-0003',                         '2026-03-05 09:15:00.0', 'Monthly salary',                    'completed'),
(4,  'debit',   700.00, NULL, 'Bill payment from checking ACC-0004',                        '2026-03-07 08:00:00.0', 'Internet and cable bill',           'completed'),
(3,  'debit',  1800.00,    6, 'Transfer from savings ACC-0003 to ACC-0006 (Carol)',         '2026-03-12 10:00:00.0', 'Payment to Carol Dela Cruz',        'completed'),
(6,  'credit', 1800.00,    3, 'Transfer received from ACC-0003 (Bob Reyes)',                '2026-03-12 10:00:00.0', 'Payment received from Bob',         'completed'),
(5,  'debit',   900.00, NULL, 'ATM withdrawal from savings ACC-0005',                       '2026-03-19 13:00:00.0', 'Cash withdrawal',                   'completed'),

-- Carol (ACC-0006 savings)
(6,  'credit', 5000.00, NULL, 'Salary deposit to savings ACC-0006',                         '2026-03-05 09:30:00.0', 'Monthly salary',                    'completed'),
(6,  'debit',   400.00, NULL, 'ATM withdrawal from savings ACC-0006',                       '2026-03-09 15:00:00.0', 'Cash withdrawal',                   'completed'),
(6,  'debit',   300.00, NULL, 'Online payment from savings ACC-0006',                       '2026-03-15 10:00:00.0', 'Phone and internet bill',           'completed'),
(6,  'debit',   600.00,   14, 'Transfer from savings ACC-0006 to ACC-0014 (Henry)',         '2026-03-20 11:00:00.0', 'Payment to Henry Lim',              'completed'),
(14, 'credit',  600.00,    6, 'Transfer received from ACC-0006 (Carol Dela Cruz)',          '2026-03-20 11:00:00.0', 'Payment received from Carol',       'completed'),

-- David (ACC-0007 checking, ACC-0008 savings)
(7,  'credit', 4000.00, NULL, 'Salary deposit to checking ACC-0007',                        '2026-03-05 09:45:00.0', 'Monthly salary',                    'completed'),
(8,  'debit',   900.00, NULL, 'ATM withdrawal from savings ACC-0008',                       '2026-03-11 11:30:00.0', 'Cash withdrawal',                   'completed'),
(7,  'debit',   600.00, NULL, 'Bill payment from checking ACC-0007',                        '2026-03-14 08:00:00.0', 'Utility bill',                      'completed'),
(8,  'debit',  1500.00,   11, 'Transfer from savings ACC-0008 to ACC-0011 (Frank)',         '2026-03-18 10:00:00.0', 'Payment to Frank Garcia',           'completed'),
(11, 'credit', 1500.00,    8, 'Transfer received from ACC-0008 (David Mendoza)',            '2026-03-18 10:00:00.0', 'Payment received from David',       'completed'),

-- Eva (ACC-0009 savings, ACC-0010 checking)
(9,  'credit', 5500.00, NULL, 'Salary deposit to savings ACC-0009',                         '2026-03-05 10:00:00.0', 'Monthly salary',                    'completed'),
(10, 'debit',   450.00, NULL, 'POS purchase from checking ACC-0010',                        '2026-03-08 16:00:00.0', 'Grocery shopping',                  'completed'),
(9,  'debit',  1000.00,   15, 'Transfer from savings ACC-0009 to ACC-0015 (Henry)',         '2026-03-13 11:00:00.0', 'Payment to Henry Lim',              'completed'),
(15, 'credit', 1000.00,    9, 'Transfer received from ACC-0009 (Eva Villanueva)',           '2026-03-13 11:00:00.0', 'Payment received from Eva',         'completed'),
(10, 'debit',   200.00, NULL, 'ATM withdrawal from checking ACC-0010',                      '2026-03-24 13:00:00.0', 'Cash withdrawal',                   'completed'),

-- Frank (ACC-0011 savings, ACC-0012 checking)
(11, 'credit', 4500.00, NULL, 'Salary deposit to savings ACC-0011',                         '2026-03-05 10:15:00.0', 'Monthly salary',                    'completed'),
(12, 'debit',   400.00, NULL, 'Bill payment from checking ACC-0012',                        '2026-03-07 09:00:00.0', 'Electricity bill',                  'completed'),
(11, 'debit',  2000.00,   16, 'Transfer from savings ACC-0011 to ACC-0016 (Isabel)',        '2026-03-14 10:00:00.0', 'Payment to Isabel Navarro',         'completed'),
(16, 'credit', 2000.00,   11, 'Transfer received from ACC-0011 (Frank Garcia)',             '2026-03-14 10:00:00.0', 'Payment received from Frank',       'completed'),
(12, 'debit',   600.00, NULL, 'POS purchase from checking ACC-0012',                        '2026-03-21 14:00:00.0', 'Electronics purchase',              'completed'),

-- Grace (ACC-0013 savings)
(13, 'credit', 5000.00, NULL, 'Salary deposit to savings ACC-0013',                         '2026-03-05 10:30:00.0', 'Monthly salary',                    'completed'),
(13, 'debit',   500.00, NULL, 'ATM withdrawal from savings ACC-0013',                       '2026-03-10 12:00:00.0', 'Cash withdrawal',                   'completed'),
(13, 'debit',   300.00, NULL, 'Online payment from savings ACC-0013',                       '2026-03-16 09:00:00.0', 'Streaming subscription',            'completed'),
(13, 'debit',  1000.00,    4, 'Transfer from savings ACC-0013 to ACC-0004 (Bob)',           '2026-03-20 15:00:00.0', 'Payment to Bob Reyes',              'completed'),
(4,  'credit', 1000.00,   13, 'Transfer received from ACC-0013 (Grace Torres)',             '2026-03-20 15:00:00.0', 'Payment received from Grace',       'completed'),

-- Henry (ACC-0014 checking, ACC-0015 savings)
(15, 'credit', 6000.00, NULL, 'Salary deposit to savings ACC-0015',                         '2026-03-05 10:45:00.0', 'Monthly salary',                    'completed'),
(14, 'debit',   500.00, NULL, 'Bill payment from checking ACC-0014',                        '2026-03-09 08:30:00.0', 'Water and utility bill',            'completed'),
(15, 'debit',  1800.00,    3, 'Transfer from savings ACC-0015 to ACC-0003 (Bob)',           '2026-03-15 11:00:00.0', 'Payment to Bob Reyes',              'completed'),
(3,  'credit', 1800.00,   15, 'Transfer received from ACC-0015 (Henry Lim)',               '2026-03-15 11:00:00.0', 'Payment received from Henry',       'completed'),
(14, 'debit',   400.00, NULL, 'POS purchase from checking ACC-0014',                        '2026-03-23 16:00:00.0', 'Dining out',                        'completed'),

-- Isabel (ACC-0016 savings, ACC-0017 checking, ACC-0018 savings)
(16, 'credit', 7000.00, NULL, 'Salary deposit to savings ACC-0016',                         '2026-03-05 11:00:00.0', 'Monthly salary',                    'completed'),
(17, 'debit',   600.00, NULL, 'Online payment from checking ACC-0017',                      '2026-03-08 09:00:00.0', 'Utility bill',                      'completed'),
(18, 'credit', 2000.00, NULL, 'Deposit to savings ACC-0018',                               '2026-03-12 09:00:00.0', 'Emergency fund deposit',            'completed'),
(17, 'debit',  1500.00,    5, 'Transfer from checking ACC-0017 to ACC-0005 (Bob savings)', '2026-03-19 10:00:00.0', 'Payment to Bob Reyes',              'completed'),
(5,  'credit', 1500.00,   17, 'Transfer received from ACC-0017 (Isabel Navarro)',           '2026-03-19 10:00:00.0', 'Payment received from Isabel',      'completed'),

-- James (ACC-0019 checking)
(19, 'credit', 4000.00, NULL, 'Salary deposit to checking ACC-0019',                        '2026-03-05 11:15:00.0', 'Monthly salary',                    'completed'),
(19, 'debit',   600.00, NULL, 'Bill payment from checking ACC-0019',                        '2026-03-08 09:00:00.0', 'Electricity bill',                  'completed'),
(19, 'debit',   450.00, NULL, 'POS purchase from checking ACC-0019',                        '2026-03-14 13:30:00.0', 'Grocery shopping',                  'completed'),
(19, 'debit',   700.00,    1, 'Transfer from checking ACC-0019 to ACC-0001 (Alice)',        '2026-03-20 10:00:00.0', 'Payment to Alice Santos',           'completed'),
(1,  'credit',  700.00,   19, 'Transfer received from ACC-0019 (James Aquino)',             '2026-03-20 10:00:00.0', 'Payment received from James',       'completed');
