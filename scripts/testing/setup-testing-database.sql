-- ============================================================================
-- Mindweal Testing Database Setup Script
-- ============================================================================
-- This script sets up a complete testing database with schema and seed data
-- Run on testing server: mysql -u root -p < setup-testing-database.sql
-- ============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS mindweal;
USE mindweal;

-- ============================================================================
-- TABLE SCHEMAS
-- ============================================================================

-- Users table (Better Auth + custom fields)
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `emailVerified` datetime DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `image` text,
  `role` enum('client','therapist','admin','reception') NOT NULL DEFAULT 'client',
  `timezone` varchar(50) NOT NULL DEFAULT 'Asia/Kolkata',
  `therapistId` varchar(36) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  -- Better Auth admin plugin columns
  `banned` tinyint(1) DEFAULT 0,
  `banReason` text,
  `banExpires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Sessions table (Better Auth)
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `token` varchar(255) NOT NULL,
  `ipAddress` varchar(50) DEFAULT NULL,
  `userAgent` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_session_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Accounts table (Better Auth - OAuth)
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `accountId` varchar(255) NOT NULL,
  `providerId` varchar(255) NOT NULL,
  `accessToken` text,
  `refreshToken` text,
  `expiresAt` datetime DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Verification tokens (Better Auth)
CREATE TABLE IF NOT EXISTS `verification_tokens` (
  `id` varchar(36) NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_verification_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Therapists table
CREATE TABLE IF NOT EXISTS `therapists` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `bio` text NOT NULL,
  `qualifications` text NOT NULL,
  `experience` int NOT NULL,
  `languages` text NOT NULL,
  `specializations` text NOT NULL,
  `approach` text,
  `image` text,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `displayOrder` int NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_therapist_slug` (`slug`),
  UNIQUE KEY `IDX_therapist_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Session types table
CREATE TABLE IF NOT EXISTS `session_types` (
  `id` varchar(36) NOT NULL,
  `therapistId` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `duration` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Therapist availability table
CREATE TABLE IF NOT EXISTS `therapist_availability` (
  `id` varchar(36) NOT NULL,
  `therapistId` varchar(36) NOT NULL,
  `dayOfWeek` int NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Blocked dates table
CREATE TABLE IF NOT EXISTS `blocked_dates` (
  `id` varchar(36) NOT NULL,
  `therapistId` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Bookings table
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` varchar(36) NOT NULL,
  `therapistId` varchar(36) NOT NULL,
  `clientId` varchar(36) DEFAULT NULL,
  `sessionTypeId` varchar(36) NOT NULL,
  `guestName` varchar(255) DEFAULT NULL,
  `guestEmail` varchar(255) DEFAULT NULL,
  `guestPhone` varchar(50) DEFAULT NULL,
  `date` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
  `notes` text,
  `meetingLink` text,
  `reference` varchar(20) NOT NULL,
  `timezone` varchar(50) NOT NULL DEFAULT 'Asia/Kolkata',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_booking_reference` (`reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Programs table
CREATE TABLE IF NOT EXISTS `programs` (
  `id` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `content` longtext NOT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `sessions` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image` text,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `displayOrder` int NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_program_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Workshops table
CREATE TABLE IF NOT EXISTS `workshops` (
  `id` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `content` longtext NOT NULL,
  `date` date DEFAULT NULL,
  `time` varchar(100) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `image` text,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `displayOrder` int NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_workshop_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Community programs table
CREATE TABLE IF NOT EXISTS `community_programs` (
  `id` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `content` longtext NOT NULL,
  `image` text,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `displayOrder` int NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_community_program_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- FAQs table
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` varchar(36) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `displayOrder` int NOT NULL DEFAULT 0,
  `published` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Job postings table
CREATE TABLE IF NOT EXISTS `job_postings` (
  `id` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `department` varchar(100) NOT NULL,
  `location` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `requirements` text NOT NULL,
  `responsibilities` text NOT NULL,
  `published` tinyint(1) NOT NULL DEFAULT 0,
  `displayOrder` int NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_job_posting_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Team members table
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `bio` text NOT NULL,
  `image` text,
  `published` tinyint(1) NOT NULL DEFAULT 1,
  `displayOrder` int NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_team_member_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Specializations table
CREATE TABLE IF NOT EXISTS `specializations` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `displayOrder` int NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_specialization_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Migrations table (TypeORM)
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Clear existing data (for testing environment)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE bookings;
TRUNCATE TABLE blocked_dates;
TRUNCATE TABLE therapist_availability;
TRUNCATE TABLE session_types;
TRUNCATE TABLE therapists;
TRUNCATE TABLE sessions;
TRUNCATE TABLE accounts;
TRUNCATE TABLE verification_tokens;
TRUNCATE TABLE users;
TRUNCATE TABLE programs;
TRUNCATE TABLE workshops;
TRUNCATE TABLE community_programs;
TRUNCATE TABLE faqs;
TRUNCATE TABLE job_postings;
TRUNCATE TABLE team_members;
TRUNCATE TABLE specializations;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert test users
-- Password for all test users: "Test123!" (bcrypt hash)
-- Note: You'll need to replace these with actual bcrypt hashes or create users via Better Auth API
INSERT INTO `users` (`id`, `email`, `emailVerified`, `name`, `phone`, `image`, `role`, `timezone`, `therapistId`, `banned`, `banReason`, `banExpires`) VALUES
('admin-001', 'admin@mindweal.in', NOW(), 'Admin User', '+91 98765 43210', NULL, 'admin', 'Asia/Kolkata', NULL, 0, NULL, NULL),
('reception-001', 'reception@mindweal.in', NOW(), 'Reception Desk', '+91 98765 43211', NULL, 'reception', 'Asia/Kolkata', NULL, 0, NULL, NULL),
('therapist-001', 'dr.sharma@mindweal.in', NOW(), 'Dr. Priya Sharma', '+91 98765 43212', NULL, 'therapist', 'Asia/Kolkata', NULL, 0, NULL, NULL),
('therapist-002', 'dr.verma@mindweal.in', NOW(), 'Dr. Rajesh Verma', '+91 98765 43213', NULL, 'therapist', 'Asia/Kolkata', NULL, 0, NULL, NULL),
('therapist-003', 'dr.singh@mindweal.in', NOW(), 'Dr. Anjali Singh', '+91 98765 43214', NULL, 'therapist', 'Asia/Kolkata', NULL, 0, NULL, NULL),
('client-001', 'client1@example.com', NOW(), 'Rahul Bansal', '+91 98765 43215', NULL, 'client', 'Asia/Kolkata', NULL, 0, NULL, NULL),
('client-002', 'client2@example.com', NOW(), 'Priya Patel', '+91 98765 43216', NULL, 'client', 'Asia/Kolkata', NULL, 0, NULL, NULL),
('client-003', 'client3@example.com', NOW(), 'Amit Kumar', '+91 98765 43217', NULL, 'client', 'Asia/Kolkata', NULL, 0, NULL, NULL),
('client-004', 'banned@example.com', NOW(), 'Banned User', '+91 98765 43218', NULL, 'client', 'Asia/Kolkata', NULL, 1, 'Violation of terms', DATE_ADD(NOW(), INTERVAL 30 DAY)),
('client-005', 'unverified@example.com', NULL, 'Unverified User', '+91 98765 43219', NULL, 'client', 'Asia/Kolkata', NULL, 0, NULL, NULL);

-- Insert accounts (password hash for "Test123!")
-- This is a bcrypt hash - you may need to generate fresh ones
INSERT INTO `accounts` (`id`, `userId`, `accountId`, `providerId`, `password`, `accessToken`, `refreshToken`, `expiresAt`) VALUES
('acc-admin', 'admin-001', 'admin@mindweal.in', 'credential', '$2a$10$YourBcryptHashHere', NULL, NULL, NULL),
('acc-reception', 'reception-001', 'reception@mindweal.in', 'credential', '$2a$10$YourBcryptHashHere', NULL, NULL, NULL),
('acc-therapist-1', 'therapist-001', 'dr.sharma@mindweal.in', 'credential', '$2a$10$YourBcryptHashHere', NULL, NULL, NULL),
('acc-therapist-2', 'therapist-002', 'dr.verma@mindweal.in', 'credential', '$2a$10$YourBcryptHashHere', NULL, NULL, NULL),
('acc-therapist-3', 'therapist-003', 'dr.singh@mindweal.in', 'credential', '$2a$10$YourBcryptHashHere', NULL, NULL, NULL),
('acc-client-1', 'client-001', 'client1@example.com', 'credential', '$2a$10$YourBcryptHashHere', NULL, NULL, NULL),
('acc-client-2', 'client-002', 'client2@example.com', 'credential', '$2a$10$YourBcryptHashHere', NULL, NULL, NULL),
('acc-client-3', 'client-003', 'client3@example.com', 'credential', '$2a$10$YourBcryptHashHere', NULL, NULL, NULL),
('acc-client-4', 'client-004', 'banned@example.com', 'credential', '$2a$10$YourBcryptHashHere', NULL, NULL, NULL),
('acc-client-5', 'client-005', 'unverified@example.com', 'credential', '$2a$10$YourBcryptHashHere', NULL, NULL, NULL);

-- Insert therapists
INSERT INTO `therapists` (`id`, `userId`, `slug`, `bio`, `qualifications`, `experience`, `languages`, `specializations`, `approach`, `image`, `published`, `displayOrder`) VALUES
('therapist-prof-001', 'therapist-001', 'dr-priya-sharma', 'Experienced clinical psychologist specializing in anxiety and depression', 'M.Phil Clinical Psychology, PhD Psychology', 12, '["English", "Hindi"]', '["Anxiety", "Depression", "Stress Management"]', 'Cognitive Behavioral Therapy (CBT) combined with mindfulness techniques', NULL, 1, 1),
('therapist-prof-002', 'therapist-002', 'dr-rajesh-verma', 'Family therapist with expertise in relationship counseling', 'M.A. Psychology, M.Phil Family Therapy', 8, '["English", "Hindi", "Punjabi"]', '["Relationship Counseling", "Family Therapy", "Couples Therapy"]', 'Solution-focused brief therapy', NULL, 1, 2),
('therapist-prof-003', 'therapist-003', 'dr-anjali-singh', 'Child and adolescent psychologist', 'M.Phil Clinical Psychology, Certified Child Psychologist', 10, '["English", "Hindi", "Bengali"]', '["Child Psychology", "Adolescent Issues", "Parenting"]', 'Play therapy and cognitive behavioral approaches', NULL, 1, 3);

-- Insert session types
INSERT INTO `session_types` (`id`, `therapistId`, `name`, `duration`, `price`, `description`, `isActive`) VALUES
('session-type-001', 'therapist-prof-001', 'Individual Therapy', 60, 2500.00, 'One-on-one therapy session', 1),
('session-type-002', 'therapist-prof-001', 'Initial Consultation', 45, 1500.00, 'First session to understand your needs', 1),
('session-type-003', 'therapist-prof-002', 'Couples Therapy', 90, 4000.00, 'Joint session for couples', 1),
('session-type-004', 'therapist-prof-002', 'Family Therapy', 90, 4500.00, 'Session for the whole family', 1),
('session-type-005', 'therapist-prof-003', 'Child Therapy', 45, 2000.00, 'Therapy session for children (5-12 years)', 1),
('session-type-006', 'therapist-prof-003', 'Teen Counseling', 60, 2500.00, 'Counseling for teenagers (13-18 years)', 1);

-- Insert therapist availability (Monday to Friday, 9 AM - 5 PM)
INSERT INTO `therapist_availability` (`id`, `therapistId`, `dayOfWeek`, `startTime`, `endTime`) VALUES
-- Dr. Priya Sharma (Mon-Fri, 9 AM - 5 PM)
(UUID(), 'therapist-prof-001', 1, '09:00:00', '17:00:00'),
(UUID(), 'therapist-prof-001', 2, '09:00:00', '17:00:00'),
(UUID(), 'therapist-prof-001', 3, '09:00:00', '17:00:00'),
(UUID(), 'therapist-prof-001', 4, '09:00:00', '17:00:00'),
(UUID(), 'therapist-prof-001', 5, '09:00:00', '17:00:00'),
-- Dr. Rajesh Verma (Mon-Sat, 10 AM - 6 PM)
(UUID(), 'therapist-prof-002', 1, '10:00:00', '18:00:00'),
(UUID(), 'therapist-prof-002', 2, '10:00:00', '18:00:00'),
(UUID(), 'therapist-prof-002', 3, '10:00:00', '18:00:00'),
(UUID(), 'therapist-prof-002', 4, '10:00:00', '18:00:00'),
(UUID(), 'therapist-prof-002', 5, '10:00:00', '18:00:00'),
(UUID(), 'therapist-prof-002', 6, '10:00:00', '14:00:00'),
-- Dr. Anjali Singh (Tue-Sat, 11 AM - 7 PM)
(UUID(), 'therapist-prof-003', 2, '11:00:00', '19:00:00'),
(UUID(), 'therapist-prof-003', 3, '11:00:00', '19:00:00'),
(UUID(), 'therapist-prof-003', 4, '11:00:00', '19:00:00'),
(UUID(), 'therapist-prof-003', 5, '11:00:00', '19:00:00'),
(UUID(), 'therapist-prof-003', 6, '11:00:00', '19:00:00');

-- Insert sample bookings
INSERT INTO `bookings` (`id`, `therapistId`, `clientId`, `sessionTypeId`, `guestName`, `guestEmail`, `guestPhone`, `date`, `startTime`, `endTime`, `status`, `notes`, `meetingLink`, `reference`, `timezone`) VALUES
(UUID(), 'therapist-prof-001', 'client-001', 'session-type-001', NULL, NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '11:00:00', 'confirmed', 'First session - anxiety management', 'https://meet.google.com/abc-defg-hij', 'MWL-20260201', 'Asia/Kolkata'),
(UUID(), 'therapist-prof-001', 'client-002', 'session-type-002', NULL, NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', '14:45:00', 'pending', 'Initial consultation', 'https://meet.google.com/xyz-abcd-efg', 'MWL-20260202', 'Asia/Kolkata'),
(UUID(), 'therapist-prof-002', 'client-003', 'session-type-003', NULL, NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '11:00:00', '12:30:00', 'confirmed', 'Couples therapy session', 'https://meet.google.com/couples-123', 'MWL-20260203', 'Asia/Kolkata'),
(UUID(), 'therapist-prof-003', NULL, 'session-type-005', 'Guest Parent', 'parent@example.com', '+91 99999 88888', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '15:00:00', '15:45:00', 'pending', 'Child therapy - guest booking', 'https://meet.google.com/child-456', 'MWL-20260204', 'Asia/Kolkata');

-- Insert specializations
INSERT INTO `specializations` (`id`, `name`, `slug`, `description`, `displayOrder`) VALUES
(UUID(), 'Anxiety Management', 'anxiety-management', 'Treatment for various anxiety disorders', 1),
(UUID(), 'Depression', 'depression', 'Support for depression and mood disorders', 2),
(UUID(), 'Relationship Counseling', 'relationship-counseling', 'Couples and relationship therapy', 3),
(UUID(), 'Stress Management', 'stress-management', 'Techniques to manage stress effectively', 4),
(UUID(), 'Child Psychology', 'child-psychology', 'Specialized care for children', 5),
(UUID(), 'Family Therapy', 'family-therapy', 'Therapy for family dynamics', 6);

-- Insert sample FAQs
INSERT INTO `faqs` (`id`, `question`, `answer`, `category`, `displayOrder`, `published`) VALUES
(UUID(), 'How do I book an appointment?', 'You can book an appointment by visiting the Therapists page, selecting a therapist, and choosing an available time slot.', 'Booking', 1, 1),
(UUID(), 'What is the cancellation policy?', 'You can cancel or reschedule appointments up to 24 hours before the scheduled time without any charges.', 'Booking', 2, 1),
(UUID(), 'Are sessions confidential?', 'Yes, all therapy sessions are completely confidential and follow professional ethics guidelines.', 'General', 3, 1),
(UUID(), 'Do you accept insurance?', 'We currently do not directly accept insurance. However, we can provide receipts for you to submit to your insurance provider.', 'Payment', 4, 1);

-- Insert sample programs
INSERT INTO `programs` (`id`, `slug`, `title`, `subtitle`, `description`, `content`, `duration`, `sessions`, `price`, `image`, `published`, `displayOrder`) VALUES
(UUID(), 'anxiety-relief-program', 'Anxiety Relief Program', 'Overcome anxiety and live freely', 'A comprehensive 8-week program designed to help you manage and overcome anxiety', '<p>This structured program combines CBT techniques with mindfulness practices.</p>', '8 weeks', 8, 15000.00, NULL, 1, 1),
(UUID(), 'stress-management', 'Stress Management', 'Learn to handle stress effectively', 'A 6-week program focused on building resilience and managing daily stress', '<p>Practical techniques for everyday stress management.</p>', '6 weeks', 6, 12000.00, NULL, 1, 2);

-- Insert sample workshops
INSERT INTO `workshops` (`id`, `slug`, `title`, `subtitle`, `description`, `content`, `date`, `time`, `duration`, `capacity`, `price`, `location`, `published`, `displayOrder`) VALUES
(UUID(), 'mindfulness-meditation', 'Mindfulness Meditation Workshop', 'Introduction to mindfulness practices', 'Learn the basics of mindfulness meditation in this interactive workshop', '<p>A beginner-friendly workshop on mindfulness.</p>', DATE_ADD(CURDATE(), INTERVAL 15 DAY), '10:00 AM - 1:00 PM', '3 hours', 20, 1500.00, 'Online (Zoom)', 1, 1);

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================
-- 1. Password hashes are placeholders. You need to:
--    - Either generate real bcrypt hashes for "Test123!"
--    - Or create users via Better Auth API after setup
--
-- 2. To generate a bcrypt hash in Node.js:
--    const bcrypt = require('bcryptjs');
--    const hash = await bcrypt.hash('Test123!', 10);
--
-- 3. Test credentials:
--    Admin: admin@mindweal.in / Test123!
--    Reception: reception@mindweal.in / Test123!
--    Therapist 1: dr.sharma@mindweal.in / Test123!
--    Therapist 2: dr.verma@mindweal.in / Test123!
--    Therapist 3: dr.singh@mindweal.in / Test123!
--    Client 1: client1@example.com / Test123!
--    Client 2: client2@example.com / Test123!
--    Client 3: client3@example.com / Test123!
--    Banned: banned@example.com / Test123! (will be unable to login)
--    Unverified: unverified@example.com / Test123! (email not verified)
--
-- 4. After running this script, you should create the accounts properly using
--    Better Auth's signup API to get proper password hashes.
--
-- ============================================================================

SELECT 'Database setup complete! See script comments for next steps.' as Status;
