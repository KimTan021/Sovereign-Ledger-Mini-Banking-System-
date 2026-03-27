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
('Alice',   'Marie',     'Santos',     'alice.santos@email.com',     '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'admin');

-- 5 Pending users (waiting for approval)
INSERT INTO `pending_user` (`first_name`, `middle_name`, `last_name`, `user_email`, `password`, `request_account_type`, `request_time`) VALUES
('Juan',  'Santos', 'Dela Cruz',  'juan@banktest.com',  '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'savings',  NOW()),
('Bob',   'Cruz',   'Reyes',      'bob@banktest.com',   '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'checking', NOW()),
('Carol', 'Ann',    'Dela Cruz',  'carol@banktest.com', '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'savings',  NOW()),
('David', 'Jose',   'Mendoza',    'david@banktest.com', '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'checking', NOW()),
('Eva',   'Grace',  'Villanueva', 'eva@banktest.com',   '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'savings',  NOW());