-- MySQL dump 10.13  Distrib 8.0.44, for Linux (aarch64)
--
-- Host: localhost    Database: mindweal
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `accountId` varchar(255) NOT NULL,
  `providerId` varchar(50) NOT NULL,
  `accessToken` text,
  `refreshToken` text,
  `accessTokenExpiresAt` datetime DEFAULT NULL,
  `refreshTokenExpiresAt` datetime DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `idToken` text,
  `password` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES ('18cfc80a-379e-461f-8e87-4fd01fbaf1a4','bca876e1-9b54-4d1a-a46d-9d562d6a55f7','bca876e1-9b54-4d1a-a46d-9d562d6a55f7','credential',NULL,NULL,NULL,NULL,NULL,NULL,'$2b$10$dgQIsftk1oAL5OGPanBDQ.sMoOscBnkgIVKow2GvBuO2B5Wd3ZA9S','2026-01-29 15:46:18.449331','2026-01-29 15:46:18.449331');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blocked_dates`
--

DROP TABLE IF EXISTS `blocked_dates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blocked_dates` (
  `id` varchar(36) NOT NULL,
  `therapistId` varchar(36) NOT NULL,
  `startDatetime` datetime NOT NULL,
  `endDatetime` datetime NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `isAllDay` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blocked_dates`
--

LOCK TABLES `blocked_dates` WRITE;
/*!40000 ALTER TABLE `blocked_dates` DISABLE KEYS */;
/*!40000 ALTER TABLE `blocked_dates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` varchar(36) NOT NULL,
  `bookingReference` varchar(50) NOT NULL,
  `therapistId` varchar(36) NOT NULL,
  `clientId` varchar(36) DEFAULT NULL,
  `sessionTypeId` varchar(36) DEFAULT NULL,
  `clientName` varchar(255) NOT NULL,
  `clientEmail` varchar(255) NOT NULL,
  `clientPhone` varchar(50) DEFAULT NULL,
  `startDatetime` datetime NOT NULL,
  `endDatetime` datetime NOT NULL,
  `timezone` varchar(50) NOT NULL DEFAULT 'Asia/Kolkata',
  `status` enum('pending','confirmed','cancelled','completed','no_show') NOT NULL DEFAULT 'confirmed',
  `cancellationReason` text,
  `cancelledBy` varchar(36) DEFAULT NULL,
  `cancelledAt` datetime DEFAULT NULL,
  `meetingType` enum('in_person','video','phone') NOT NULL,
  `meetingLink` text,
  `meetingLocation` varchar(255) DEFAULT NULL,
  `clientNotes` text,
  `internalNotes` text,
  `reminderSentAt` datetime DEFAULT NULL,
  `createdBy` varchar(36) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_efae15c3deed139b3a0ce03f69` (`bookingReference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `community_programs`
--

DROP TABLE IF EXISTS `community_programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_programs` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `schedule` varchar(255) NOT NULL,
  `coverImage` varchar(500) DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_9e486528444a9abf3a67edc534` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `community_programs`
--

LOCK TABLES `community_programs` WRITE;
/*!40000 ALTER TABLE `community_programs` DISABLE KEYS */;
INSERT INTO `community_programs` VALUES ('5ef9eeb6-b4db-4850-9a6e-17b08f06c42f','Supervision Program','supervision-program','MindWeal\'s Supervision Program offers ethical and reflective supervision for psychology trainees. It also supports practicing professionals seeking guidance and professional accountability. The program focuses on case conceptualisation and therapeutic skill development, reflective practice and ethical decision-making, and managing clinical and ethical challenges in a safe and confidential space.','Ongoing - Monthly supervision sessions available',NULL,'published',1,'2026-01-29 17:25:33.357780','2026-01-29 17:25:33.357780'),('9b72cacf-d08b-4409-8e88-fcdb52e07c87','Training Programs','training-programs','MindWeal offers structured professional training programs designed to strengthen applied clinical skills in psychology practice. These programs focus on ethical decision-making and professional responsibility, hands-on exposure to psychological assessment techniques, and introduction to evidence-based therapeutic tools and interventions. Designed to bridge the gap between academic theory and clinical practice, delivered through structured learning, discussions, and practical activities.','Quarterly batches - Registration opens every 3 months',NULL,'published',1,'2026-01-29 17:25:33.351255','2026-01-29 17:25:33.351255'),('b24e9e87-9ed7-4612-ab9e-a99367565923','Mentorship Program','mentorship-program','The MindWeal Mentorship Program provides structured academic and career guidance for psychology students. It is designed for early-career professionals seeking clarity in their professional journey. The program focuses on academic planning and career pathway exploration, personalised mentoring aligned with individual goals, confidence-building and professional clarity, and navigating professional challenges in psychology.','3 rounds per year - Applications open bi-annually',NULL,'published',1,'2026-01-29 17:25:33.355555','2026-01-29 17:25:33.355555'),('bb2808f3-99c2-44e8-8a24-1fc98330cd60','Internship Program','internship-program','MindWeal\'s selective Internship Program offers in-depth training and hands-on experience for psychology students. With a 25% acceptance rate from 60-70+ applicants, this is a highly competitive and in-demand opportunity. Interns receive mentorship, practical exposure, and professional development support.','Bi-annual intake - Summer and Winter batches',NULL,'published',1,'2026-01-29 17:25:33.360806','2026-01-29 17:25:33.360806'),('d4502fe8-d426-4c20-8664-d37d778c59c8','Community Outreach: Crisis Support','community-outreach-crisis-support','Psychological Crisis Management Workshops are held regularly as part of MindWeal\'s community outreach initiative. These programs reach 30-50 children of lower socio-economic backgrounds per session across multiple events. MindWeal collaborates with NGOs across Delhi NCR for various education and upliftment programs, widely appreciated by schools and parents for impactful emotional support delivery.','Monthly outreach events across Delhi NCR',NULL,'published',1,'2026-01-29 17:25:33.363198','2026-01-29 17:25:33.363198');
/*!40000 ALTER TABLE `community_programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` varchar(36) NOT NULL,
  `question` varchar(500) NOT NULL,
  `answer` text NOT NULL,
  `category` enum('therapy','booking','programs','general') NOT NULL DEFAULT 'general',
  `displayOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` VALUES ('07e23ff0-8342-414d-94da-b3a24eb1aabe','What happens during a therapy session?','All sessions are conducted with the utmost confidentiality and privacy. During a session, the client and therapist discuss current concerns and collaboratively work toward emotional and psychological well-being. Goals are set together, and trained therapists use evidence-based therapeutic techniques to support overall growth.','therapy',4,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('0ddeb129-3e81-4ea2-a062-524598606a18','Where can I access internships, bootcamps, webinars, and other programs offered by MindWeal?','You can explore all programs by visiting the Programs section in the navigation menu or the Homepage where upcoming programs are displayed.','programs',15,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('1df407bb-c8ad-49b3-9769-6be687c8c2c2','What therapeutic services do we offer?','We provide a wide range of mental health and counselling services, including: Psychotherapy, Individual Counselling, Relationship Counselling, Queer-Affirmative Therapy, Trauma-Informed Therapy, Psychological First Aid, Career Counselling and Guidance, and Career Guidance for Classes 10-12.','therapy',1,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('3bf02b86-9c9e-4ea6-b462-71090996b113','Can I change my therapist if I want to?','Yes, you can. The protocol involves first discussing your concerns with your current therapist. If required, you may seek a second opinion or transition to another therapist. Your current therapist can also assist you in connecting with other practitioners within or outside the MindWeal organisation.','therapy',11,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('5f317af4-c5ee-455a-a435-2a2ef417f5a1','What are the fees for therapy sessions?','Therapy fees vary based on age category (minors or adults), duration of the session, and therapist\'s experience and expertise. Some MindWeal therapists may offer sessions on a sliding-scale basis at their discretion. Please discuss this directly with your therapist.','booking',12,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('69d8eeb4-f621-4bda-99e1-c113ee0f10e3','What is the cancellation policy?','For pre-booked sessions, cancellations are eligible for 50% reimbursement. There are no charges for complete termination of therapy; however, clients are expected to inform their therapist of the reasons for termination.','booking',13,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('7728c01f-7ba9-40f0-83e4-fef5c2efbf2c','Do I need to share all my information with my therapist?','Clients are required to fill out the intake form honestly, but only within their comfort level. The same principle applies during sessions. All client information remains confidential and is never shared without consent. Transparency is an essential part of the therapeutic alliance and is mutually respected by both clients and therapists.','therapy',9,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('85bf6308-efbd-4586-9152-90dfb587ff5d','How do I book a session?','You can book a session through our website, by connecting with a psychologist and booking via QR code, or through our official social media handles such as LinkedIn and Instagram.','booking',6,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('8b629a67-235f-4fde-aacc-c514acc2fa3d','Why should you consider therapy?','Therapy is for everyone - whether you are navigating everyday stressors or working through deeper emotional or psychological challenges. It supports enhanced self-awareness, emotional resilience, and overall quality of life. Therapy encourages personal growth at a pace that feels right for you, fostering long-term emotional well-being.','therapy',2,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('b3fb85f7-de83-4eee-8e05-addc1767424a','What modes of therapy are available?','Currently, therapy is provided only through online platforms, including video conferencing, telephonic sessions, and chat-based sessions. You may choose the mode that best suits your comfort and accessibility.','therapy',7,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('bbd1d34e-4156-4d12-be01-944dc513f541','Is online therapy safe and confidential?','Yes. Online therapy at MindWeal is both safe and confidential. All information shared with your therapist remains strictly private between you and your therapist.','therapy',8,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('bc145a6a-e3ec-4bc0-b4c7-5182499e5d61','Can I contact my therapist outside scheduled sessions?','Direct contact with therapists outside scheduled sessions is not permitted. In case of emergencies, clients should use the emergency contact number provided by their therapist.','therapy',14,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('dcaffb9f-bc63-47a7-bb89-8e91b59113f2','How many sessions do I need for therapy?','The number of sessions is collaboratively decided by the client and therapist. There is no fixed number, as therapy is personalised and tailored to each individual\'s needs and goals.','therapy',5,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('e47657b4-ee1f-4f5c-9213-5021f13de42f','I want to be part of the team. How can I join?','Psychology students can apply through the Internship section of the website. Early-career and experienced psychologists can apply via the Careers section. You may also volunteer through our Community Outreach Programs.','general',16,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('e74bbe8a-b0d2-42e0-b778-b3c5fa718216','How would you know if you need to take a session?','You may consider seeking therapy if you feel emotionally overwhelmed or stuck, notice changes in your behaviour, or find it difficult to cope with daily life situations. Therapy can help you gain clarity, develop healthier coping mechanisms, and achieve emotional stability.','therapy',3,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('f4d37ed7-a633-4f57-a9e9-8991afbc739c','How can I contact my therapist in case of an emergency?','In case of an emergency, please contact the official MindWeal number: +91 95996 18238. Your therapist will connect with you as soon as possible. For critical situations, please reach out to national helpline services: Tele-MANAS (1-800-891-4416), Mental Health Rehabilitation Helpline KIRAN (1800-599-0019), or Suicide Prevention Helpline (9152987821).','general',10,1,'2026-01-29 17:25:33','2026-01-29 17:25:33');
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_postings`
--

DROP TABLE IF EXISTS `job_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_postings` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `department` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `requirements` text,
  `location` varchar(100) NOT NULL,
  `type` enum('full-time','part-time','contract') NOT NULL DEFAULT 'full-time',
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2417855e28af02ef2cd93dfb5b` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_postings`
--

LOCK TABLES `job_postings` WRITE;
/*!40000 ALTER TABLE `job_postings` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_postings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,1737369600000,'AddSpecializationAndTherapistUpdates1737369600000'),(2,1769700724095,'RemoveStrapiIdFromTherapists1769700724095'),(3,1769800000000,'CreateTeamMemberTable1769800000000'),(4,1769800000001,'CreateFAQTable1769800000001'),(5,1769800000002,'AddCategoryToProgram1769800000002');
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `duration` varchar(100) NOT NULL,
  `coverImage` varchar(500) DEFAULT NULL,
  `benefits` json DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `category` enum('therapy-service','professional-programs','workshop') NOT NULL DEFAULT 'therapy-service',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_4180c2bfa0402878a63b70cb4a` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES ('430960bc-4033-446c-acbc-c39a2712b15f','Psychological First Aid','psychological-first-aid','Psychological First Aid at MindWeal focuses on providing immediate emotional support during periods of acute stress or crisis. It emphasises compassionate listening, emotional stabilization, and practical support. The service aims to reduce distress and promote a sense of safety and calm.','30-45 minutes per session',NULL,'[\"Immediate emotional support during crisis\", \"Compassionate and empathetic listening\", \"Emotional stabilization techniques\", \"Practical support and guidance\", \"Promote sense of safety and calm\"]','published',1,'2026-01-29 17:25:33.323075','2026-01-29 17:25:33.323075','therapy-service'),('a2a085e2-ffd4-4456-ac6a-41c0441d90b4','Individual Therapy','individual-therapy','MindWeal\'s Individual Therapy provides a safe, confidential, and non-judgmental space for individuals to explore emotional concerns, life challenges, and personal growth. Sessions focus on building self-awareness, emotional regulation, and healthier coping strategies. Therapy is tailored to each individual\'s needs, goals, and pace.','50 minutes per session',NULL,'[\"Safe and confidential therapeutic space\", \"Personalized approach tailored to your needs\", \"Build self-awareness and emotional regulation\", \"Develop healthier coping strategies\", \"Support for personal growth and healing\"]','published',1,'2026-01-29 17:25:33.305074','2026-01-29 17:25:33.305074','therapy-service'),('a7e3ac83-faf9-4cb9-a1fe-b3b22bd30646','Career Guidance & Counselling','career-guidance-counselling','MindWeal\'s Career Guidance Services are designed to support individuals in making informed academic and professional decisions through a structured and personalised approach. Career guidance helps individuals understand their interests, strengths, abilities, and values, enabling them to explore career paths that align with their unique profile. It helps reduce confusion, anxiety, and uncertainty by offering objective insights and expert support.','60 minutes per session',NULL,'[\"Structured career guidance for academic and professional clarity\", \"Use of scientifically validated psychometric assessments\", \"One-on-one counselling tailored to individual strengths\", \"Support during key academic and career decision-making stages\", \"Helps reduce confusion, stress, and uncertainty about career choices\", \"Focus on long-term satisfaction, growth, and adaptability\"]','published',1,'2026-01-29 17:25:33.326007','2026-01-29 17:25:33.326007','therapy-service'),('bf5be3cc-5c67-477d-808e-455616cea792','Relationship & Couples Counselling','relationship-couples-counselling','MindWeal focuses on improving communication, emotional understanding, and connection within relationships. Couples and individuals explore patterns, conflicts, and relational dynamics in a supportive environment. The goal is to foster healthier, respectful, and more fulfilling relationships.','60 minutes per session',NULL,'[\"Improve communication between partners\", \"Understand emotional dynamics in relationships\", \"Explore and resolve conflicts constructively\", \"Build stronger emotional connections\", \"Foster healthier relationship patterns\"]','published',1,'2026-01-29 17:25:33.313232','2026-01-29 17:25:33.313232','therapy-service'),('c0d1a287-f4a2-4f70-a48c-c98c1994c500','Trauma-Informed Therapy','trauma-informed-therapy','MindWeal\'s Trauma-Informed Therapy recognises the impact of trauma on emotional, psychological, and physical well-being. Sessions prioritise safety, choice, and empowerment while working at a pace comfortable for the client. The approach supports healing, resilience, and restoration of a sense of control.','50 minutes per session',NULL,'[\"Trauma-sensitive and safe approach\", \"Work at your own comfortable pace\", \"Prioritise safety, choice, and empowerment\", \"Support healing and build resilience\", \"Restore sense of control and agency\"]','published',1,'2026-01-29 17:25:33.320790','2026-01-29 17:25:33.320790','therapy-service'),('d3120ea8-a6e1-4efe-86d3-efcdb3def3d7','Child & Adolescent Therapy','child-adolescent-therapy','MindWeal\'s Child and Adolescent Therapy supports the emotional, behavioural, and developmental needs of children and teenagers. Using age-appropriate, evidence-based approaches, therapy helps young individuals understand emotions, manage challenges, and build resilience. Parents and caregivers are supported as part of the therapeutic process when required.','45-50 minutes per session',NULL,'[\"Age-appropriate therapeutic techniques\", \"Support for emotional and behavioural challenges\", \"Help children understand and manage emotions\", \"Build resilience and coping skills\", \"Parent and caregiver involvement when needed\"]','published',1,'2026-01-29 17:25:33.307633','2026-01-29 17:25:33.307633','therapy-service'),('e1ce275a-7fb4-4a49-9ede-62477cf42925','Queer-Affirmative Therapy','queer-affirmative-therapy','MindWeal\'s Queer-Affirmative Therapy offers a safe, inclusive, and validating space for individuals across diverse sexual orientations and gender identities. Therapy acknowledges lived experiences, identity-related stressors, and systemic challenges. The approach affirms identity while supporting emotional well-being and self-acceptance.','50 minutes per session',NULL,'[\"Safe and inclusive therapeutic environment\", \"Validation of diverse identities and experiences\", \"Support for identity-related stressors\", \"Address systemic challenges and their impact\", \"Foster self-acceptance and emotional well-being\"]','published',1,'2026-01-29 17:25:33.318073','2026-01-29 17:25:33.318073','therapy-service');
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_types`
--

DROP TABLE IF EXISTS `session_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_types` (
  `id` varchar(36) NOT NULL,
  `therapistId` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `duration` int NOT NULL,
  `meetingType` enum('in_person','video','phone') NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `description` text,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `color` varchar(20) NOT NULL DEFAULT '#00A99D',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_types`
--

LOCK TABLES `session_types` WRITE;
/*!40000 ALTER TABLE `session_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `session_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `token` varchar(255) NOT NULL,
  `ipAddress` varchar(50) DEFAULT NULL,
  `userAgent` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e9f62f5dcb8a54b84234c9e7a0` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('zAiaKcxnsXkGMmoKbNhmqDaWt51AxX5P','bca876e1-9b54-4d1a-a46d-9d562d6a55f7','2026-02-05 21:24:30','av8Zz6aqbpkwCaxxIwmbFhGbOs5ZtxU4','::ffff:127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0','2026-01-29 21:24:29.709000','2026-01-29 21:24:29.709000');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specializations`
--

DROP TABLE IF EXISTS `specializations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `specializations` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_68ccfdea9eca4570f9aa5454b2` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specializations`
--

LOCK TABLES `specializations` WRITE;
/*!40000 ALTER TABLE `specializations` DISABLE KEYS */;
INSERT INTO `specializations` VALUES ('0d71b229-9e65-4fed-ac75-75af363273b6','Life Transitions',1,'2026-01-29 15:46:18.477078'),('0dd901e1-e530-48c5-8057-29150f9e1f7b','Relationship Issues',1,'2026-01-29 15:46:18.463319'),('2372f41c-1c7d-4b32-a620-479c23c8270a','Anxiety',1,'2026-01-29 15:46:18.453685'),('6af4aaf1-41c0-428d-9a0d-353807bdd211','Work-Life Balance',1,'2026-01-29 15:46:18.479499'),('6fb21b8d-e41f-46ec-988e-78a521a0f1e3','Self-Esteem',1,'2026-01-29 15:46:18.474162'),('a10bdc24-8cf3-41f7-ac77-972e61241754','Family Therapy',1,'2026-01-29 15:46:18.482390'),('da76bda1-04ac-4a0c-ba15-9475aa7edc18','Grief & Loss',1,'2026-01-29 15:46:18.470086'),('e55066e5-3aa8-452d-84b6-f0e6d7eaec07','Depression',1,'2026-01-29 15:46:18.457862'),('e651d633-11b7-46b4-abbc-0bbb0027345b','Stress Management',1,'2026-01-29 15:46:18.467056'),('ee8517b9-dd1d-477c-9d95-1140f71d412a','Trauma & PTSD',1,'2026-01-29 15:46:18.460933');
/*!40000 ALTER TABLE `specializations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `qualifications` varchar(500) DEFAULT NULL,
  `bio` text NOT NULL,
  `photoUrl` text,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `educationalQualifications` json DEFAULT NULL,
  `professionalExperience` json DEFAULT NULL,
  `areasOfExpertise` json DEFAULT NULL,
  `therapeuticApproach` varchar(255) DEFAULT NULL,
  `therapyModalities` json DEFAULT NULL,
  `servicesOffered` json DEFAULT NULL,
  `focusAreas` json DEFAULT NULL,
  `professionalValues` json DEFAULT NULL,
  `quote` text,
  `displayOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_a3f55af63bfe54cc9b6f641c6e6` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES ('a85df35b-453c-44d6-8d99-fc118d0d1c19','Dr. Shobha Sharma','dr-shobha-sharma','Clinical Consultant','Ph.D. Psychology, M.Phil. Clinical Psychology','Dr. Shobha Sharma serves as Clinical Consultant at MindWeal by Pihu Suri. With over 15 years of experience in clinical psychology and research, she brings extensive expertise in child and adolescent psychology, neurodevelopmental disorders, and psychometric assessments. Her academic and clinical background includes positions at prestigious institutions including AIIMS New Delhi and Yashoda Super Speciality Hospital.',NULL,'shobhasharma.mindwealbyps@gmail.com','+91 95604 69109','Dilshad Garden, Delhi - 110093','[\"Ph.D. (Psychology), Jamia Millia Islamia, New Delhi (2010-2014)\", \"M.Phil. (Clinical Psychology), OPJS University - Rehabilitation Council of India (2022-2024)\", \"M.A. Psychology, CCS University, Meerut (2003-2005)\", \"B.A. Psychology, CCS University, Meerut (2000-2003)\", \"Diploma in Counselling Psychology, Jamia Millia Islamia, New Delhi (2007)\", \"Diploma in Child Psychology, Bangalore (2020)\", \"Diploma in Mental Retardation, Rehabilitation Council of India (2017)\"]','[\"INCLEN - The Trust International (2009-2012)\", \"AIIMS, New Delhi - Senior Research Fellow, Psychologist, Scientist D (2014-2022)\", \"Swastik - Consultant Psychologist (2022-2023)\", \"IGNOU - Academic Counsellor\", \"Yashoda Super Speciality Hospital - Consultant Clinical Psychologist (2023-Present)\"]','[\"Child & Adolescent Psychology\", \"Clinical Consultation\", \"Academic Counselling\", \"Psychometric Assessments\", \"Research & Evidence-Based Practice\", \"Neurodevelopmental Disorders\"]',NULL,NULL,NULL,NULL,NULL,NULL,2,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('bb16ed85-6b44-48fc-a051-e4ae9cb259b8','Avni Kohli','avni-kohli','Junior Counselling Psychologist','B.A. Applied Psychology, M.A. Psychology','Avni Kohli is a Junior Counselling Psychologist at MindWeal by Pihu Suri. She utilizes Cognitive Behavioural Therapy, Psychodynamic Therapy, and Client-Centred Therapy to help clients navigate stress, build self-esteem, and address daily life challenges. Her approach creates a safe and inclusive therapeutic space that encourages growth and well-being.',NULL,NULL,NULL,NULL,'[\"B.A. Applied Psychology\", \"M.A. Psychology\"]','[\"Junior Counselling Psychologist at MindWeal by Pihu Suri\"]','[\"Stress Management\", \"Self-Esteem & Confidence Building\", \"Overall Emotional Well-Being\", \"Daily Life Challenges\", \"Major Life Transitions\", \"Interpersonal Dynamics\", \"Boundary Setting & Problem Solving\"]','Integrative approach using CBT, Psychodynamic, and Client-Centred Therapy','[\"Cognitive Behavioural Therapy (CBT)\", \"Psychodynamic Therapy\", \"Client-Centred Therapy\"]','[\"Individual Therapy Sessions\"]','[\"Stress Management\", \"Self-Esteem & Confidence Building\", \"Overall Emotional Well-Being\", \"Daily Life Challenges\", \"Major Life Transitions\", \"Interpersonal Dynamics\", \"Boundary Setting & Problem Solving\"]','[\"Safe & Inclusive Therapeutic Space\", \"Culturally Aware Practice\", \"Supportive & Encouraging Approach\"]',NULL,4,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('c88752e6-dda1-4bc0-bc99-c4dacb7cf7e6','Ms. Pihu Suri','ms-pihu-suri','Founder & Lead Psychologist','B.A., M.Sc. Clinical Psychology','Pihu Suri is the Founder and Lead Psychologist at MindWeal by Pihu Suri. With a strong foundation in clinical psychology, she brings an eclectic therapy approach that integrates multiple evidence-based modalities to meet each client\'s unique needs. Her practice emphasizes emotional healing, self-exploration, and creating a safe, bias-free therapeutic space where clients can grow at their own pace.',NULL,NULL,NULL,NULL,'[\"B.A. Psychology\", \"M.Sc. Clinical Psychology\"]','[\"Founder and Lead Psychologist at MindWeal by Pihu Suri\"]','[\"Emotional Healing & Self-Exploration\", \"Stress & Emotional Regulation\", \"Personal Growth & Empowerment\"]','Eclectic Therapy Approach','[\"Cognitive Behavioural Therapy (CBT)\", \"Client-Centred Therapy\", \"Dialectical Behaviour Therapy (DBT)\", \"Mindfulness-Based Stress Reduction (MBSR)\", \"Psychodynamic Therapy\"]','[\"Individual Therapy\", \"Couples Therapy\", \"Group Counselling & Therapy\", \"Career Guidance & Orientation\", \"Psychology Training & Learning Programs\", \"Mental Health Workshops\", \"Webinars & Guest Lectures\"]','[\"Emotional Healing & Self-Exploration\", \"Stress & Emotional Regulation\", \"Personal Growth & Empowerment\", \"Creating a Safe, Bias-Free Therapeutic Space\"]',NULL,NULL,1,1,'2026-01-29 17:25:33','2026-01-29 17:25:33'),('cbecbba5-5fa0-49c4-96af-46cb02f69cbf','Shivangi Sobti','shivangi-sobti','Counselling Psychologist','B.A. & M.A. Clinical Psychology','Shivangi Sobti is a Counselling Psychologist at MindWeal by Pihu Suri. She employs an integrative approach combining Cognitive Behavioural Therapy and Psychodynamic Therapy to support clients in their journey toward emotional awareness and personal growth. Her practice is rooted in gender-inclusive, culturally sensitive, and non-judgmental care.',NULL,NULL,NULL,NULL,'[\"B.A. Clinical Psychology\", \"M.A. Clinical Psychology\"]','[\"Counselling Psychologist at MindWeal by Pihu Suri\"]','[\"Emotional Awareness & Self-Understanding\", \"Personal Growth & Well-Being\", \"Relationship & Life Challenges\"]','Integrative approach combining CBT and Psychodynamic Therapy','[\"Cognitive Behavioural Therapy (CBT)\", \"Psychodynamic Therapy\"]','[\"Individual Therapy Sessions\", \"Group Counselling Sessions\", \"Career Guidance & Orientation\", \"Couples Counselling\", \"Additional Psychological Support Services\"]','[\"Emotional Awareness & Self-Understanding\", \"Personal Growth & Well-Being\", \"Relationship & Life Challenges\", \"Creating a Collaborative and Supportive Therapeutic Experience\"]','[\"Gender-Inclusive Practice\", \"Culturally Sensitive Therapy\", \"Non-Judgmental & Empathetic Care\"]',NULL,3,1,'2026-01-29 17:25:33','2026-01-29 17:25:33');
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `therapist_availability`
--

DROP TABLE IF EXISTS `therapist_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `therapist_availability` (
  `id` varchar(36) NOT NULL,
  `therapistId` varchar(36) NOT NULL,
  `dayOfWeek` tinyint NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `therapist_availability`
--

LOCK TABLES `therapist_availability` WRITE;
/*!40000 ALTER TABLE `therapist_availability` DISABLE KEYS */;
/*!40000 ALTER TABLE `therapist_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `therapists`
--

DROP TABLE IF EXISTS `therapists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `therapists` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `bio` text NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `photoUrl` text,
  `defaultSessionDuration` int NOT NULL DEFAULT '60',
  `bufferTime` int NOT NULL DEFAULT '15',
  `advanceBookingDays` int NOT NULL DEFAULT '30',
  `minBookingNotice` int NOT NULL DEFAULT '24',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `specializationIds` text,
  `deletedAt` datetime DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_0e1aed65139ebecbff520c9aee` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `therapists`
--

LOCK TABLES `therapists` WRITE;
/*!40000 ALTER TABLE `therapists` DISABLE KEYS */;
/*!40000 ALTER TABLE `therapists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
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
  `banned` tinyint(1) DEFAULT '0',
  `banReason` text,
  `banExpires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('bca876e1-9b54-4d1a-a46d-9d562d6a55f7','admin@mindweal.in','2026-01-29 21:16:18','Admin',NULL,NULL,'admin','Asia/Kolkata',NULL,'2026-01-29 15:46:18.443320','2026-01-29 15:46:18.443320',0,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification_tokens`
--

DROP TABLE IF EXISTS `verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification_tokens` (
  `id` varchar(36) NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `type` enum('email_verification','password_reset') NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_b00b1be0e5a820594d7c07a3df` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_tokens`
--

LOCK TABLES `verification_tokens` WRITE;
/*!40000 ALTER TABLE `verification_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workshops`
--

DROP TABLE IF EXISTS `workshops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workshops` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `date` datetime NOT NULL,
  `duration` varchar(100) NOT NULL,
  `capacity` int NOT NULL DEFAULT '20',
  `coverImage` varchar(500) DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_eb018fe70c86a54cbb15200f6e` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workshops`
--

LOCK TABLES `workshops` WRITE;
/*!40000 ALTER TABLE `workshops` DISABLE KEYS */;
INSERT INTO `workshops` VALUES ('07b74f9f-5d85-4780-9c6d-81c68098674b','Body Image & Mental Health','body-image-mental-health','This MindWeal program addresses the emotional and psychological impact of body image concerns on self-esteem and well-being. Participants explore societal influences, self-perception, and healthy coping strategies in a supportive environment. The program encourages self-acceptance, resilience, and a compassionate relationship with one\'s body.','2026-03-30 22:55:33','Half day (3 hours)',70,NULL,'published',1,'2026-01-29 17:25:33.336336','2026-01-29 17:25:33.336336'),('167d36ae-d72d-40df-9884-9ab4c18c4248','Stress Management Workshop','stress-management-workshop','MindWeal\'s Stress Management program helps individuals understand stress and its effects on mental and emotional health. Participants learn practical coping strategies, emotional regulation skills, and relaxation techniques. The program supports improved resilience, balance, and everyday functioning.','2026-04-29 22:55:33','Half day (3 hours)',70,NULL,'published',1,'2026-01-29 17:25:33.343766','2026-01-29 17:25:33.343766'),('923631ec-cdaf-4906-b3bc-d26ce6b9437d','Career Guidance Workshop','career-guidance-workshop','MindWeal\'s Career Guidance Workshops support students and young adults in gaining clarity about academic and career choices. Through structured discussions and assessment-based insights, participants explore interests, strengths, and future pathways. The workshops aim to reduce confusion and build confidence in informed decision-making.','2026-03-15 22:55:33','1 day (4 hours)',50,NULL,'published',1,'2026-01-29 17:25:33.333872','2026-01-29 17:25:33.333872'),('adf1f8c4-e30f-45ff-8b18-0865f59aef17','Understanding Relationships','understanding-relationships','This MindWeal program explores the emotional dynamics of personal and interpersonal relationships. It focuses on communication, boundaries, emotional awareness, and conflict resolution. The program supports the development of healthier, respectful, and meaningful relationships.','2026-05-14 22:55:33','Half day (3 hours)',70,NULL,'published',1,'2026-01-29 17:25:33.347347','2026-01-29 17:25:33.347347'),('bc78f583-b085-4a0a-9ea2-2b29b7cc5bae','Psychological First Aid (PFA) Training','psychological-first-aid-pfa-training','MindWeal\'s Psychological First Aid program focuses on providing immediate emotional support during times of stress, crisis, or emotional overwhelm. The program equips participants with practical skills to respond with empathy, safety, and emotional stabilization. It emphasizes compassionate listening and appropriate support while respecting individual needs and boundaries.','2026-02-28 22:55:33','2 days (8 hours total)',100,NULL,'published',1,'2026-01-29 17:25:33.330817','2026-01-29 17:25:33.330817'),('e98d5ac0-1ec2-46ac-a3ce-f75119a233c8','Sex Education Workshop','sex-education-workshop','MindWeal\'s Sex Education program provides age-appropriate, evidence-based information in a safe and respectful space. It focuses on bodily awareness, consent, relationships, and emotional well-being. The program aims to promote informed, healthy, and responsible understanding of sexuality.','2026-04-14 22:55:33','Half day (3 hours)',70,NULL,'published',1,'2026-01-29 17:25:33.340112','2026-01-29 17:25:33.340112');
/*!40000 ALTER TABLE `workshops` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-31 11:15:04
