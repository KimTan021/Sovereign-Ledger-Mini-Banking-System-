-- =============================================================
-- Database Seeder
-- Schema: mydb
-- Covers: user, account, transaction
-- Date range: 2026-01-01 to 2026-03-26
-- =============================================================

-- =============================================================
-- USERS (10 users, plaintext passwords for testing)
-- =============================================================
INSERT INTO `user` (`first_name`, `middle_name`, `last_name`, `user_email`, `password`, `role`)
SELECT 'Alice', 'Marie', 'Santos', 'alice.santos@email.com', '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'admin'
WHERE NOT EXISTS (
    SELECT 1
    FROM `user`
    WHERE `user_email` = 'alice.santos@email.com'
);

-- 5 Pending users (waiting for approval)
INSERT INTO `pending_user` (`first_name`, `middle_name`, `last_name`, `user_email`, `password`, `request_account_type`, `request_time`)
SELECT 'Juan', 'Santos', 'Dela Cruz', 'juan@banktest.com', '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'savings', NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM `pending_user`
    WHERE `user_email` = 'juan@banktest.com'
);

INSERT INTO `pending_user` (`first_name`, `middle_name`, `last_name`, `user_email`, `password`, `request_account_type`, `request_time`)
SELECT 'Bob', 'Cruz', 'Reyes', 'bob@banktest.com', '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'checking', NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM `pending_user`
    WHERE `user_email` = 'bob@banktest.com'
);

INSERT INTO `pending_user` (`first_name`, `middle_name`, `last_name`, `user_email`, `password`, `request_account_type`, `request_time`)
SELECT 'Carol', 'Ann', 'Dela Cruz', 'carol@banktest.com', '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'savings', NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM `pending_user`
    WHERE `user_email` = 'carol@banktest.com'
);

INSERT INTO `pending_user` (`first_name`, `middle_name`, `last_name`, `user_email`, `password`, `request_account_type`, `request_time`)
SELECT 'David', 'Jose', 'Mendoza', 'david@banktest.com', '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'checking', NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM `pending_user`
    WHERE `user_email` = 'david@banktest.com'
);

INSERT INTO `pending_user` (`first_name`, `middle_name`, `last_name`, `user_email`, `password`, `request_account_type`, `request_time`)
SELECT 'Eva', 'Grace', 'Villanueva', 'eva@banktest.com', '$2a$12$73dmYQ69Gc3FxRhl.FBFAetaZF8sI77mCsyMbhfvn00OKqYtxdOTG', 'savings', NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM `pending_user`
    WHERE `user_email` = 'eva@banktest.com'
);
