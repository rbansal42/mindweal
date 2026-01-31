/**
 * Content Seed Script
 *
 * Seeds TeamMembers, FAQs, Programs, Workshops, and CommunityPrograms.
 *
 * Usage: bun run db:seed
 */

import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Load environment variables (try .env.local first, then .env)
if (fs.existsSync(".env.local")) {
    dotenv.config({ path: ".env.local" });
} else {
    dotenv.config({ path: ".env" });
}

// Import entities
import { TeamMember } from "../src/entities/TeamMember";
import { FAQ } from "../src/entities/FAQ";
import { Program } from "../src/entities/Program";
import { Workshop } from "../src/entities/Workshop";
import { CommunityProgram } from "../src/entities/CommunityProgram";

// Database configuration
const databaseConfig = {
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "3307", 10),
  user: process.env.DATABASE_USER || "mindweal",
  password: process.env.DATABASE_PASSWORD || "mindweal_password",
  database: process.env.DATABASE_NAME || "mindweal",
};

// Helper to create slug
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ============================================================================
// TEAM MEMBERS DATA
// ============================================================================
const teamMembersData = [
  {
    name: "Ms. Pihu Suri",
    role: "Founder & Lead Psychologist",
    qualifications: "B.A., M.Sc. Clinical Psychology",
    bio: "Pihu Suri is the Founder and Lead Psychologist at MindWeal by Pihu Suri. With a strong foundation in clinical psychology, she brings an eclectic therapy approach that integrates multiple evidence-based modalities to meet each client's unique needs. Her practice emphasizes emotional healing, self-exploration, and creating a safe, bias-free therapeutic space where clients can grow at their own pace.",
    email: null,
    phone: null,
    location: null,
    educationalQualifications: [
      "B.A. Psychology",
      "M.Sc. Clinical Psychology",
    ],
    professionalExperience: [
      "Founder and Lead Psychologist at MindWeal by Pihu Suri",
    ],
    areasOfExpertise: [
      "Emotional Healing & Self-Exploration",
      "Stress & Emotional Regulation",
      "Personal Growth & Empowerment",
    ],
    therapeuticApproach: "Eclectic Therapy Approach",
    therapyModalities: [
      "Cognitive Behavioural Therapy (CBT)",
      "Client-Centred Therapy",
      "Dialectical Behaviour Therapy (DBT)",
      "Mindfulness-Based Stress Reduction (MBSR)",
      "Psychodynamic Therapy",
    ],
    servicesOffered: [
      "Individual Therapy",
      "Couples Therapy",
      "Group Counselling & Therapy",
      "Career Guidance & Orientation",
      "Psychology Training & Learning Programs",
      "Mental Health Workshops",
      "Webinars & Guest Lectures",
    ],
    focusAreas: [
      "Emotional Healing & Self-Exploration",
      "Stress & Emotional Regulation",
      "Personal Growth & Empowerment",
      "Creating a Safe, Bias-Free Therapeutic Space",
    ],
    professionalValues: null,
    quote: null,
    displayOrder: 1,
  },
  {
    name: "Dr. Shobha Sharma",
    role: "Clinical Consultant",
    qualifications: "Ph.D. Psychology, M.Phil. Clinical Psychology",
    bio: "Dr. Shobha Sharma serves as Clinical Consultant at MindWeal by Pihu Suri. With over 15 years of experience in clinical psychology and research, she brings extensive expertise in child and adolescent psychology, neurodevelopmental disorders, and psychometric assessments. Her academic and clinical background includes positions at prestigious institutions including AIIMS New Delhi and Yashoda Super Speciality Hospital.",
    email: "shobhasharma.mindwealbyps@gmail.com",
    phone: "+91 95604 69109",
    location: "Dilshad Garden, Delhi - 110093",
    educationalQualifications: [
      "Ph.D. (Psychology), Jamia Millia Islamia, New Delhi (2010-2014)",
      "M.Phil. (Clinical Psychology), OPJS University - Rehabilitation Council of India (2022-2024)",
      "M.A. Psychology, CCS University, Meerut (2003-2005)",
      "B.A. Psychology, CCS University, Meerut (2000-2003)",
      "Diploma in Counselling Psychology, Jamia Millia Islamia, New Delhi (2007)",
      "Diploma in Child Psychology, Bangalore (2020)",
      "Diploma in Mental Retardation, Rehabilitation Council of India (2017)",
    ],
    professionalExperience: [
      "INCLEN - The Trust International (2009-2012)",
      "AIIMS, New Delhi - Senior Research Fellow, Psychologist, Scientist D (2014-2022)",
      "Swastik - Consultant Psychologist (2022-2023)",
      "IGNOU - Academic Counsellor",
      "Yashoda Super Speciality Hospital - Consultant Clinical Psychologist (2023-Present)",
    ],
    areasOfExpertise: [
      "Child & Adolescent Psychology",
      "Clinical Consultation",
      "Academic Counselling",
      "Psychometric Assessments",
      "Research & Evidence-Based Practice",
      "Neurodevelopmental Disorders",
    ],
    therapeuticApproach: null,
    therapyModalities: null,
    servicesOffered: null,
    focusAreas: null,
    professionalValues: null,
    quote: null,
    displayOrder: 2,
  },
  {
    name: "Shivangi Sobti",
    role: "Counselling Psychologist",
    qualifications: "B.A. & M.A. Clinical Psychology",
    bio: "Shivangi Sobti is a Counselling Psychologist at MindWeal by Pihu Suri. She employs an integrative approach combining Cognitive Behavioural Therapy and Psychodynamic Therapy to support clients in their journey toward emotional awareness and personal growth. Her practice is rooted in gender-inclusive, culturally sensitive, and non-judgmental care.",
    email: null,
    phone: null,
    location: null,
    educationalQualifications: [
      "B.A. Clinical Psychology",
      "M.A. Clinical Psychology",
    ],
    professionalExperience: [
      "Counselling Psychologist at MindWeal by Pihu Suri",
    ],
    areasOfExpertise: [
      "Emotional Awareness & Self-Understanding",
      "Personal Growth & Well-Being",
      "Relationship & Life Challenges",
    ],
    therapeuticApproach: "Integrative approach combining CBT and Psychodynamic Therapy",
    therapyModalities: [
      "Cognitive Behavioural Therapy (CBT)",
      "Psychodynamic Therapy",
    ],
    servicesOffered: [
      "Individual Therapy Sessions",
      "Group Counselling Sessions",
      "Career Guidance & Orientation",
      "Couples Counselling",
      "Additional Psychological Support Services",
    ],
    focusAreas: [
      "Emotional Awareness & Self-Understanding",
      "Personal Growth & Well-Being",
      "Relationship & Life Challenges",
      "Creating a Collaborative and Supportive Therapeutic Experience",
    ],
    professionalValues: [
      "Gender-Inclusive Practice",
      "Culturally Sensitive Therapy",
      "Non-Judgmental & Empathetic Care",
    ],
    quote: null,
    displayOrder: 3,
  },
  {
    name: "Avni Kohli",
    role: "Junior Counselling Psychologist",
    qualifications: "B.A. Applied Psychology, M.A. Psychology",
    bio: "Avni Kohli is a Junior Counselling Psychologist at MindWeal by Pihu Suri. She utilizes Cognitive Behavioural Therapy, Psychodynamic Therapy, and Client-Centred Therapy to help clients navigate stress, build self-esteem, and address daily life challenges. Her approach creates a safe and inclusive therapeutic space that encourages growth and well-being.",
    email: null,
    phone: null,
    location: null,
    educationalQualifications: [
      "B.A. Applied Psychology",
      "M.A. Psychology",
    ],
    professionalExperience: [
      "Junior Counselling Psychologist at MindWeal by Pihu Suri",
    ],
    areasOfExpertise: [
      "Stress Management",
      "Self-Esteem & Confidence Building",
      "Overall Emotional Well-Being",
      "Daily Life Challenges",
      "Major Life Transitions",
      "Interpersonal Dynamics",
      "Boundary Setting & Problem Solving",
    ],
    therapeuticApproach: "Integrative approach using CBT, Psychodynamic, and Client-Centred Therapy",
    therapyModalities: [
      "Cognitive Behavioural Therapy (CBT)",
      "Psychodynamic Therapy",
      "Client-Centred Therapy",
    ],
    servicesOffered: [
      "Individual Therapy Sessions",
    ],
    focusAreas: [
      "Stress Management",
      "Self-Esteem & Confidence Building",
      "Overall Emotional Well-Being",
      "Daily Life Challenges",
      "Major Life Transitions",
      "Interpersonal Dynamics",
      "Boundary Setting & Problem Solving",
    ],
    professionalValues: [
      "Safe & Inclusive Therapeutic Space",
      "Culturally Aware Practice",
      "Supportive & Encouraging Approach",
    ],
    quote: null,
    displayOrder: 4,
  },
];

// ============================================================================
// FAQ DATA
// ============================================================================
const faqsData = [
  {
    question: "What therapeutic services do we offer?",
    answer: "We provide a wide range of mental health and counselling services, including: Psychotherapy, Individual Counselling, Relationship Counselling, Queer-Affirmative Therapy, Trauma-Informed Therapy, Psychological First Aid, Career Counselling and Guidance, and Career Guidance for Classes 10-12.",
    category: "therapy" as const,
    displayOrder: 1,
  },
  {
    question: "Why should you consider therapy?",
    answer: "Therapy is for everyone - whether you are navigating everyday stressors or working through deeper emotional or psychological challenges. It supports enhanced self-awareness, emotional resilience, and overall quality of life. Therapy encourages personal growth at a pace that feels right for you, fostering long-term emotional well-being.",
    category: "therapy" as const,
    displayOrder: 2,
  },
  {
    question: "How would you know if you need to take a session?",
    answer: "You may consider seeking therapy if you feel emotionally overwhelmed or stuck, notice changes in your behaviour, or find it difficult to cope with daily life situations. Therapy can help you gain clarity, develop healthier coping mechanisms, and achieve emotional stability.",
    category: "therapy" as const,
    displayOrder: 3,
  },
  {
    question: "What happens during a therapy session?",
    answer: "All sessions are conducted with the utmost confidentiality and privacy. During a session, the client and therapist discuss current concerns and collaboratively work toward emotional and psychological well-being. Goals are set together, and trained therapists use evidence-based therapeutic techniques to support overall growth.",
    category: "therapy" as const,
    displayOrder: 4,
  },
  {
    question: "How many sessions do I need for therapy?",
    answer: "The number of sessions is collaboratively decided by the client and therapist. There is no fixed number, as therapy is personalised and tailored to each individual's needs and goals.",
    category: "therapy" as const,
    displayOrder: 5,
  },
  {
    question: "How do I book a session?",
    answer: "You can book a session through our website, by connecting with a psychologist and booking via QR code, or through our official social media handles such as LinkedIn and Instagram.",
    category: "booking" as const,
    displayOrder: 6,
  },
  {
    question: "What modes of therapy are available?",
    answer: "Currently, therapy is provided only through online platforms, including video conferencing, telephonic sessions, and chat-based sessions. You may choose the mode that best suits your comfort and accessibility.",
    category: "therapy" as const,
    displayOrder: 7,
  },
  {
    question: "Is online therapy safe and confidential?",
    answer: "Yes. Online therapy at MindWeal is both safe and confidential. All information shared with your therapist remains strictly private between you and your therapist.",
    category: "therapy" as const,
    displayOrder: 8,
  },
  {
    question: "Do I need to share all my information with my therapist?",
    answer: "Clients are required to fill out the intake form honestly, but only within their comfort level. The same principle applies during sessions. All client information remains confidential and is never shared without consent. Transparency is an essential part of the therapeutic alliance and is mutually respected by both clients and therapists.",
    category: "therapy" as const,
    displayOrder: 9,
  },
  {
    question: "How can I contact my therapist in case of an emergency?",
    answer: "In case of an emergency, please contact the official MindWeal number: +91 95996 18238. Your therapist will connect with you as soon as possible. For critical situations, please reach out to national helpline services: Tele-MANAS (1-800-891-4416), Mental Health Rehabilitation Helpline KIRAN (1800-599-0019), or Suicide Prevention Helpline (9152987821).",
    category: "general" as const,
    displayOrder: 10,
  },
  {
    question: "Can I change my therapist if I want to?",
    answer: "Yes, you can. The protocol involves first discussing your concerns with your current therapist. If required, you may seek a second opinion or transition to another therapist. Your current therapist can also assist you in connecting with other practitioners within or outside the MindWeal organisation.",
    category: "therapy" as const,
    displayOrder: 11,
  },
  {
    question: "What are the fees for therapy sessions?",
    answer: "Therapy fees vary based on age category (minors or adults), duration of the session, and therapist's experience and expertise. Some MindWeal therapists may offer sessions on a sliding-scale basis at their discretion. Please discuss this directly with your therapist.",
    category: "booking" as const,
    displayOrder: 12,
  },
  {
    question: "What is the cancellation policy?",
    answer: "For pre-booked sessions, cancellations are eligible for 50% reimbursement. There are no charges for complete termination of therapy; however, clients are expected to inform their therapist of the reasons for termination.",
    category: "booking" as const,
    displayOrder: 13,
  },
  {
    question: "Can I contact my therapist outside scheduled sessions?",
    answer: "Direct contact with therapists outside scheduled sessions is not permitted. In case of emergencies, clients should use the emergency contact number provided by their therapist.",
    category: "therapy" as const,
    displayOrder: 14,
  },
  {
    question: "Where can I access internships, bootcamps, webinars, and other programs offered by MindWeal?",
    answer: "You can explore all programs by visiting the Programs section in the navigation menu or the Homepage where upcoming programs are displayed.",
    category: "programs" as const,
    displayOrder: 15,
  },
  {
    question: "I want to be part of the team. How can I join?",
    answer: "Psychology students can apply through the Internship section of the website. Early-career and experienced psychologists can apply via the Careers section. You may also volunteer through our Community Outreach Programs.",
    category: "general" as const,
    displayOrder: 16,
  },
];

// ============================================================================
// PROGRAMS DATA (Therapy Services)
// ============================================================================
const programsData = [
  {
    title: "Individual Therapy",
    description: "MindWeal's Individual Therapy provides a safe, confidential, and non-judgmental space for individuals to explore emotional concerns, life challenges, and personal growth. Sessions focus on building self-awareness, emotional regulation, and healthier coping strategies. Therapy is tailored to each individual's needs, goals, and pace.",
    duration: "50 minutes per session",
    benefits: [
      "Safe and confidential therapeutic space",
      "Personalized approach tailored to your needs",
      "Build self-awareness and emotional regulation",
      "Develop healthier coping strategies",
      "Support for personal growth and healing",
    ],
    category: "therapy-service" as const,
  },
  {
    title: "Child & Adolescent Therapy",
    description: "MindWeal's Child and Adolescent Therapy supports the emotional, behavioural, and developmental needs of children and teenagers. Using age-appropriate, evidence-based approaches, therapy helps young individuals understand emotions, manage challenges, and build resilience. Parents and caregivers are supported as part of the therapeutic process when required.",
    duration: "45-50 minutes per session",
    benefits: [
      "Age-appropriate therapeutic techniques",
      "Support for emotional and behavioural challenges",
      "Help children understand and manage emotions",
      "Build resilience and coping skills",
      "Parent and caregiver involvement when needed",
    ],
    category: "therapy-service" as const,
  },
  {
    title: "Relationship & Couples Counselling",
    description: "MindWeal focuses on improving communication, emotional understanding, and connection within relationships. Couples and individuals explore patterns, conflicts, and relational dynamics in a supportive environment. The goal is to foster healthier, respectful, and more fulfilling relationships.",
    duration: "60 minutes per session",
    benefits: [
      "Improve communication between partners",
      "Understand emotional dynamics in relationships",
      "Explore and resolve conflicts constructively",
      "Build stronger emotional connections",
      "Foster healthier relationship patterns",
    ],
    category: "therapy-service" as const,
  },
  {
    title: "Queer-Affirmative Therapy",
    description: "MindWeal's Queer-Affirmative Therapy offers a safe, inclusive, and validating space for individuals across diverse sexual orientations and gender identities. Therapy acknowledges lived experiences, identity-related stressors, and systemic challenges. The approach affirms identity while supporting emotional well-being and self-acceptance.",
    duration: "50 minutes per session",
    benefits: [
      "Safe and inclusive therapeutic environment",
      "Validation of diverse identities and experiences",
      "Support for identity-related stressors",
      "Address systemic challenges and their impact",
      "Foster self-acceptance and emotional well-being",
    ],
    category: "therapy-service" as const,
  },
  {
    title: "Trauma-Informed Therapy",
    description: "MindWeal's Trauma-Informed Therapy recognises the impact of trauma on emotional, psychological, and physical well-being. Sessions prioritise safety, choice, and empowerment while working at a pace comfortable for the client. The approach supports healing, resilience, and restoration of a sense of control.",
    duration: "50 minutes per session",
    benefits: [
      "Trauma-sensitive and safe approach",
      "Work at your own comfortable pace",
      "Prioritise safety, choice, and empowerment",
      "Support healing and build resilience",
      "Restore sense of control and agency",
    ],
    category: "therapy-service" as const,
  },
  {
    title: "Psychological First Aid",
    description: "Psychological First Aid at MindWeal focuses on providing immediate emotional support during periods of acute stress or crisis. It emphasises compassionate listening, emotional stabilization, and practical support. The service aims to reduce distress and promote a sense of safety and calm.",
    duration: "30-45 minutes per session",
    benefits: [
      "Immediate emotional support during crisis",
      "Compassionate and empathetic listening",
      "Emotional stabilization techniques",
      "Practical support and guidance",
      "Promote sense of safety and calm",
    ],
    category: "therapy-service" as const,
  },
  {
    title: "Career Guidance & Counselling",
    description: "MindWeal's Career Guidance Services are designed to support individuals in making informed academic and professional decisions through a structured and personalised approach. Career guidance helps individuals understand their interests, strengths, abilities, and values, enabling them to explore career paths that align with their unique profile. It helps reduce confusion, anxiety, and uncertainty by offering objective insights and expert support.",
    duration: "60 minutes per session",
    benefits: [
      "Structured career guidance for academic and professional clarity",
      "Use of scientifically validated psychometric assessments",
      "One-on-one counselling tailored to individual strengths",
      "Support during key academic and career decision-making stages",
      "Helps reduce confusion, stress, and uncertainty about career choices",
      "Focus on long-term satisfaction, growth, and adaptability",
    ],
    category: "therapy-service" as const,
  },
];

// ============================================================================
// WORKSHOPS DATA
// ============================================================================
const workshopsData = [
  {
    title: "Psychological First Aid (PFA) Training",
    description: "MindWeal's Psychological First Aid program focuses on providing immediate emotional support during times of stress, crisis, or emotional overwhelm. The program equips participants with practical skills to respond with empathy, safety, and emotional stabilization. It emphasizes compassionate listening and appropriate support while respecting individual needs and boundaries.",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    duration: "2 days (8 hours total)",
    capacity: 100,
  },
  {
    title: "Career Guidance Workshop",
    description: "MindWeal's Career Guidance Workshops support students and young adults in gaining clarity about academic and career choices. Through structured discussions and assessment-based insights, participants explore interests, strengths, and future pathways. The workshops aim to reduce confusion and build confidence in informed decision-making.",
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    duration: "1 day (4 hours)",
    capacity: 50,
  },
  {
    title: "Body Image & Mental Health",
    description: "This MindWeal program addresses the emotional and psychological impact of body image concerns on self-esteem and well-being. Participants explore societal influences, self-perception, and healthy coping strategies in a supportive environment. The program encourages self-acceptance, resilience, and a compassionate relationship with one's body.",
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    duration: "Half day (3 hours)",
    capacity: 70,
  },
  {
    title: "Sex Education Workshop",
    description: "MindWeal's Sex Education program provides age-appropriate, evidence-based information in a safe and respectful space. It focuses on bodily awareness, consent, relationships, and emotional well-being. The program aims to promote informed, healthy, and responsible understanding of sexuality.",
    date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
    duration: "Half day (3 hours)",
    capacity: 70,
  },
  {
    title: "Stress Management Workshop",
    description: "MindWeal's Stress Management program helps individuals understand stress and its effects on mental and emotional health. Participants learn practical coping strategies, emotional regulation skills, and relaxation techniques. The program supports improved resilience, balance, and everyday functioning.",
    date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    duration: "Half day (3 hours)",
    capacity: 70,
  },
  {
    title: "Understanding Relationships",
    description: "This MindWeal program explores the emotional dynamics of personal and interpersonal relationships. It focuses on communication, boundaries, emotional awareness, and conflict resolution. The program supports the development of healthier, respectful, and meaningful relationships.",
    date: new Date(Date.now() + 105 * 24 * 60 * 60 * 1000), // 105 days from now
    duration: "Half day (3 hours)",
    capacity: 70,
  },
];

// ============================================================================
// COMMUNITY PROGRAMS DATA
// ============================================================================
const communityProgramsData = [
  {
    name: "Training Programs",
    description: "MindWeal offers structured professional training programs designed to strengthen applied clinical skills in psychology practice. These programs focus on ethical decision-making and professional responsibility, hands-on exposure to psychological assessment techniques, and introduction to evidence-based therapeutic tools and interventions. Designed to bridge the gap between academic theory and clinical practice, delivered through structured learning, discussions, and practical activities.",
    schedule: "Quarterly batches - Registration opens every 3 months",
  },
  {
    name: "Mentorship Program",
    description: "The MindWeal Mentorship Program provides structured academic and career guidance for psychology students. It is designed for early-career professionals seeking clarity in their professional journey. The program focuses on academic planning and career pathway exploration, personalised mentoring aligned with individual goals, confidence-building and professional clarity, and navigating professional challenges in psychology.",
    schedule: "3 rounds per year - Applications open bi-annually",
  },
  {
    name: "Supervision Program",
    description: "MindWeal's Supervision Program offers ethical and reflective supervision for psychology trainees. It also supports practicing professionals seeking guidance and professional accountability. The program focuses on case conceptualisation and therapeutic skill development, reflective practice and ethical decision-making, and managing clinical and ethical challenges in a safe and confidential space.",
    schedule: "Ongoing - Monthly supervision sessions available",
  },
  {
    name: "Internship Program",
    description: "MindWeal's selective Internship Program offers in-depth training and hands-on experience for psychology students. With a 25% acceptance rate from 60-70+ applicants, this is a highly competitive and in-demand opportunity. Interns receive mentorship, practical exposure, and professional development support.",
    schedule: "Bi-annual intake - Summer and Winter batches",
  },
  {
    name: "Community Outreach: Crisis Support",
    description: "Psychological Crisis Management Workshops are held regularly as part of MindWeal's community outreach initiative. These programs reach 30-50 children of lower socio-economic backgrounds per session across multiple events. MindWeal collaborates with NGOs across Delhi NCR for various education and upliftment programs, widely appreciated by schools and parents for impactful emotional support delivery.",
    schedule: "Monthly outreach events across Delhi NCR",
  },
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function seedContent() {
  console.log("Starting content seeding...\n");

  // Create DataSource
  const dataSource = new DataSource({
    type: "mysql",
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    synchronize: false,
    logging: false,
    entities: [TeamMember, FAQ, Program, Workshop, CommunityProgram],
  });

  try {
    console.log(`Connecting to MySQL at ${databaseConfig.host}:${databaseConfig.port}...`);
    await dataSource.initialize();
    console.log("Connected to database\n");

    // Seed Team Members
    console.log("Seeding Team Members...");
    const teamMemberRepo = dataSource.getRepository(TeamMember);
    let teamCreated = 0;
    let teamSkipped = 0;

    for (const data of teamMembersData) {
      const slug = createSlug(data.name);
      const existing = await teamMemberRepo.findOne({ where: { slug } });
      if (existing) {
        teamSkipped++;
      } else {
        const member = teamMemberRepo.create({
          id: uuidv4(),
          ...data,
          slug,
          isActive: true,
        });
        await teamMemberRepo.save(member);
        teamCreated++;
      }
    }
    console.log(`   Team Members: ${teamCreated} created, ${teamSkipped} already existed\n`);

    // Seed FAQs
    console.log("Seeding FAQs...");
    const faqRepo = dataSource.getRepository(FAQ);
    let faqCreated = 0;
    let faqSkipped = 0;

    for (const data of faqsData) {
      const existing = await faqRepo.findOne({ where: { question: data.question } });
      if (existing) {
        faqSkipped++;
      } else {
        const faq = faqRepo.create({
          id: uuidv4(),
          ...data,
          isActive: true,
        });
        await faqRepo.save(faq);
        faqCreated++;
      }
    }
    console.log(`   FAQs: ${faqCreated} created, ${faqSkipped} already existed\n`);

    // Seed Programs
    console.log("Seeding Programs...");
    const programRepo = dataSource.getRepository(Program);
    let programCreated = 0;
    let programSkipped = 0;

    for (const data of programsData) {
      const slug = createSlug(data.title);
      const existing = await programRepo.findOne({ where: { slug } });
      if (existing) {
        programSkipped++;
      } else {
        const program = programRepo.create({
          id: uuidv4(),
          ...data,
          slug,
          coverImage: null,
          status: "published",
          isActive: true,
        });
        await programRepo.save(program);
        programCreated++;
      }
    }
    console.log(`   Programs: ${programCreated} created, ${programSkipped} already existed\n`);

    // Seed Workshops
    console.log("Seeding Workshops...");
    const workshopRepo = dataSource.getRepository(Workshop);
    let workshopCreated = 0;
    let workshopSkipped = 0;

    for (const data of workshopsData) {
      const slug = createSlug(data.title);
      const existing = await workshopRepo.findOne({ where: { slug } });
      if (existing) {
        workshopSkipped++;
      } else {
        const workshop = workshopRepo.create({
          id: uuidv4(),
          ...data,
          slug,
          coverImage: null,
          status: "published",
          isActive: true,
        });
        await workshopRepo.save(workshop);
        workshopCreated++;
      }
    }
    console.log(`   Workshops: ${workshopCreated} created, ${workshopSkipped} already existed\n`);

    // Seed Community Programs
    console.log("Seeding Community Programs...");
    const communityRepo = dataSource.getRepository(CommunityProgram);
    let communityCreated = 0;
    let communitySkipped = 0;

    for (const data of communityProgramsData) {
      const slug = createSlug(data.name);
      const existing = await communityRepo.findOne({ where: { slug } });
      if (existing) {
        communitySkipped++;
      } else {
        const program = communityRepo.create({
          id: uuidv4(),
          ...data,
          slug,
          coverImage: null,
          status: "published",
          isActive: true,
        });
        await communityRepo.save(program);
        communityCreated++;
      }
    }
    console.log(`   Community Programs: ${communityCreated} created, ${communitySkipped} already existed\n`);

    // Summary
    console.log("Content seeding complete!");
    console.log("\nSummary:");
    console.log(`   Team Members: ${teamCreated} new`);
    console.log(`   FAQs: ${faqCreated} new`);
    console.log(`   Programs: ${programCreated} new`);
    console.log(`   Workshops: ${workshopCreated} new`);
    console.log(`   Community Programs: ${communityCreated} new`);

  } catch (error) {
    console.error("\nContent seeding failed:", error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Run seeding
seedContent();
