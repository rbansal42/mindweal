import "reflect-metadata";
import { getDataSource } from "../src/lib/db";
import { BlogPost } from "../src/entities/BlogPost";
import { TeamMember } from "../src/entities/TeamMember";

type BlogCategory = "wellness-tips" | "practice-news" | "professional-insights" | "resources";
type BlogStatus = "draft" | "published";

const samplePosts: Array<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: BlogCategory;
    tags: string[];
    metaTitle: string;
    metaDescription: string;
    status: BlogStatus;
    isFeatured: boolean;
    featuredOrder?: number;
}> = [
    {
        title: "Welcome to MindWeal's Blog",
        slug: "welcome-to-mindweals-blog",
        excerpt: "We're excited to launch our blog where we'll share insights on mental health, wellness tips, and updates from our practice. Join us on this journey towards better mental health.",
        content: `<h2>Welcome to the MindWeal Blog!</h2>

<p>We are thrilled to announce the launch of the MindWeal blog, a space dedicated to mental health awareness, wellness insights, and stories from our community.</p>

<h3>What You Can Expect</h3>

<p>Our blog will feature:</p>

<ul>
<li><strong>Wellness Tips:</strong> Practical advice for managing stress, anxiety, and building resilience</li>
<li><strong>Professional Insights:</strong> Expert perspectives on mental health topics and therapeutic approaches</li>
<li><strong>Practice News:</strong> Updates on our programs, workshops, and team</li>
<li><strong>Community Resources:</strong> Helpful tools and information for your mental health journey</li>
</ul>

<h3>Our Mission</h3>

<p>At MindWeal, we believe in the power of knowledge and community. This blog is our way of extending our support beyond therapy sessions, providing you with resources and insights that can help you on your mental health journey.</p>

<h3>Join the Conversation</h3>

<p>Mental health is not a destination—it's a journey. We invite you to join us as we explore topics that matter, share experiences, and build a supportive community together.</p>

<p>Stay tuned for regular updates, and don't hesitate to reach out if there's a topic you'd like us to cover!</p>

<p><em>— The MindWeal Team</em></p>`,
        category: "practice-news",
        tags: ["announcements", "welcome", "mental health"],
        metaTitle: "Welcome to MindWeal's Blog | Mental Health & Wellness",
        metaDescription: "Join us on our journey to better mental health. Read insights, tips, and updates from MindWeal by Pihu Suri.",
        status: "published" as const,
        isFeatured: true,
        featuredOrder: 1,
    },
    {
        title: "5 Simple Grounding Techniques for Managing Anxiety",
        slug: "5-simple-grounding-techniques-for-managing-anxiety",
        excerpt: "When anxiety strikes, grounding techniques can help you reconnect with the present moment. Here are five simple methods you can use anywhere, anytime.",
        content: `<h2>Finding Your Ground: Simple Techniques for Anxiety</h2>

<p>Anxiety can feel overwhelming, pulling us into spirals of worry about the future or rumination about the past. Grounding techniques are powerful tools that help us anchor ourselves in the present moment.</p>

<h3>1. The 5-4-3-2-1 Technique</h3>

<p>Engage your five senses to reconnect with your surroundings:</p>

<ul>
<li><strong>5 things you can see:</strong> Look around and name five objects in your environment</li>
<li><strong>4 things you can touch:</strong> Notice the texture of your clothes, the chair beneath you</li>
<li><strong>3 things you can hear:</strong> Listen for sounds in your environment</li>
<li><strong>2 things you can smell:</strong> Notice any scents, or imagine calming ones</li>
<li><strong>1 thing you can taste:</strong> Sip water or notice the taste in your mouth</li>
</ul>

<h3>2. Box Breathing</h3>

<p>This simple breathing pattern calms the nervous system:</p>

<ol>
<li>Breathe in for 4 counts</li>
<li>Hold for 4 counts</li>
<li>Breathe out for 4 counts</li>
<li>Hold for 4 counts</li>
<li>Repeat 4-5 times</li>
</ol>

<h3>3. Physical Grounding</h3>

<p>Feel your connection to the earth:</p>

<ul>
<li>Press your feet firmly into the floor</li>
<li>Notice the weight of your body in the chair</li>
<li>Touch a nearby object and focus on its temperature and texture</li>
</ul>

<h3>4. The 'Categories' Game</h3>

<p>Challenge your mind to think of categories:</p>

<ul>
<li>Name 5 countries</li>
<li>List 7 colors</li>
<li>Think of 5 animals that start with 'B'</li>
</ul>

<p>This redirects anxious thoughts and engages your cognitive resources.</p>

<h3>5. The 'Body Scan' Technique</h3>

<p>Starting from your toes, slowly move your attention up through your body:</p>

<ul>
<li>Notice any tension or sensations</li>
<li>Breathe into each area</li>
<li>Consciously relax each muscle group</li>
<li>Move gradually up to the crown of your head</li>
</ul>

<h3>When to Use These Techniques</h3>

<p>These techniques are most effective when:</p>

<ul>
<li>You feel anxiety starting to build</li>
<li>You're in the middle of a panic attack</li>
<li>You need to calm down before an important event</li>
<li>You're having trouble sleeping due to worry</li>
</ul>

<h3>Practice Makes Progress</h3>

<p>Like any skill, grounding techniques become more effective with practice. Try incorporating one or two into your daily routine, even when you're calm, so they're readily available when anxiety strikes.</p>

<p>Remember: These techniques are tools in your mental health toolkit, not cures. If anxiety is significantly impacting your life, please reach out to a mental health professional.</p>`,
        category: "wellness-tips",
        tags: ["anxiety", "grounding techniques", "mindfulness", "coping strategies"],
        metaTitle: "5 Simple Grounding Techniques for Managing Anxiety | MindWeal",
        metaDescription: "Learn five evidence-based grounding techniques to help manage anxiety. Simple, practical methods you can use anywhere, anytime.",
        status: "published" as const,
        isFeatured: true,
        featuredOrder: 2,
    },
    {
        title: "Understanding the Therapeutic Relationship: Why It Matters",
        slug: "understanding-the-therapeutic-relationship-why-it-matters",
        excerpt: "The therapeutic relationship is one of the most important factors in successful therapy. Here's why finding the right therapist matters, and what makes a therapeutic relationship effective.",
        content: `<h2>The Foundation of Healing: The Therapeutic Relationship</h2>

<p>When people think about therapy, they often focus on techniques, credentials, or specific therapeutic approaches. While these are important, research consistently shows that the single most important factor in successful therapy is the therapeutic relationship itself.</p>

<h3>What is the Therapeutic Relationship?</h3>

<p>The therapeutic relationship is the professional connection between therapist and client, characterized by:</p>

<ul>
<li><strong>Trust:</strong> Feeling safe to be vulnerable and honest</li>
<li><strong>Empathy:</strong> Being understood without judgment</li>
<li><strong>Collaboration:</strong> Working together toward shared goals</li>
<li><strong>Authenticity:</strong> Genuine human connection within professional boundaries</li>
</ul>

<h3>Why It Matters More Than You Think</h3>

<p>Research in psychotherapy has revealed some surprising findings:</p>

<ul>
<li>The therapeutic relationship accounts for approximately 30% of therapy outcomes</li>
<li>This is often more significant than the specific therapeutic technique used</li>
<li>Clients who feel understood and supported are more likely to:</li>
<ul>
<li>Stay engaged in therapy</li>
<li>Be open about difficult issues</li>
<li>Practice new skills between sessions</li>
<li>Experience lasting positive change</li>
</ul>
</ul>

<h3>Key Elements of an Effective Therapeutic Relationship</h3>

<h4>1. Empathic Understanding</h4>

<p>Your therapist should demonstrate genuine understanding of your experiences, even when they haven't been through the same situations. This doesn't mean they'll always agree with you, but they'll strive to see the world through your eyes.</p>

<h4>2. Unconditional Positive Regard</h4>

<p>A good therapist accepts you without judgment, creating a space where you can explore even your most difficult thoughts and feelings without fear of criticism.</p>

<h4>3. Congruence (Authenticity)</h4>

<p>Effective therapists are genuine in their interactions. While maintaining professional boundaries, they bring their authentic selves to the therapeutic relationship.</p>

<h4>4. Collaborative Spirit</h4>

<p>Therapy isn't something done <em>to</em> you—it's a partnership. You and your therapist work together to set goals, choose approaches, and navigate challenges.</p>

<h3>How to Know If It's Working</h3>

<p>Signs of a strong therapeutic relationship include:</p>

<ul>
<li>You feel comfortable sharing difficult thoughts or experiences</li>
<li>You sense your therapist genuinely cares about your wellbeing</li>
<li>You can disagree or express concerns about therapy without fear</li>
<li>You feel understood, even when discussing complex emotions</li>
<li>You notice progress, even if it's gradual</li>
</ul>

<h3>When It's Not a Good Fit</h3>

<p>Not every therapist-client match will work, and that's okay. Consider finding a new therapist if:</p>

<ul>
<li>You don't feel heard or understood</li>
<li>You feel judged or criticized</li>
<li>You're not making progress after several months</li>
<li>You can't be honest about important issues</li>
<li>Your values or communication styles clash significantly</li>
</ul>

<h3>Building the Relationship Takes Time</h3>

<p>Remember: developing trust and connection doesn't happen overnight. Give the relationship a few sessions to develop, but also trust your instincts. A good therapeutic fit should feel safe and supportive, even when the work itself is challenging.</p>

<h3>At MindWeal</h3>

<p>We understand that finding the right therapist is crucial. That's why we take time to match clients with therapists whose approach, personality, and expertise align with their needs. We encourage you to ask questions, share concerns, and work with us to find the best fit for your healing journey.</p>

<p>The therapeutic relationship is where healing happens. When you feel truly seen, heard, and supported, transformation becomes possible.</p>`,
        category: "professional-insights",
        tags: ["therapy", "therapeutic relationship", "mental health", "counseling"],
        metaTitle: "Understanding the Therapeutic Relationship | MindWeal",
        metaDescription: "Why the therapeutic relationship is the most important factor in successful therapy, and how to know if you've found the right therapist.",
        status: "published" as const,
        isFeatured: false,
    },
];

async function seedBlogPosts() {
    try {
        console.log("Initializing database connection...");
        const dataSource = await getDataSource();
        console.log("✓ Database connected");

        const teamMemberRepo = dataSource.getRepository(TeamMember);
        const blogPostRepo = dataSource.getRepository(BlogPost);

        // Find Pihu Suri as the author
        console.log("\nFinding author (Pihu Suri)...");
        const author = await teamMemberRepo.findOne({
            where: { name: "Ms. Pihu Suri" },
        });

        if (!author) {
            console.error("❌ Could not find Pihu Suri in team_members table");
            console.log("Please ensure team members are seeded first.");
            process.exit(1);
        }
        console.log(`✓ Found author: ${author.name} (${author.id})`);

        // Check if posts already exist
        const existingCount = await blogPostRepo.count();
        if (existingCount > 0) {
            console.log(`\n⚠️  Found ${existingCount} existing blog posts.`);
            const readline = require("readline").createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            const answer = await new Promise<string>((resolve) => {
                readline.question("Do you want to add sample posts anyway? (y/N): ", resolve);
            });
            readline.close();

            if (answer.toLowerCase() !== "y") {
                console.log("Cancelled. No posts added.");
                process.exit(0);
            }
        }

        // Create blog posts
        console.log("\nCreating blog posts...");
        for (const postData of samplePosts) {
            const post = blogPostRepo.create({
                title: postData.title,
                slug: postData.slug,
                excerpt: postData.excerpt,
                content: postData.content,
                category: postData.category,
                tags: postData.tags,
                metaTitle: postData.metaTitle,
                metaDescription: postData.metaDescription,
                status: postData.status,
                isFeatured: postData.isFeatured,
                featuredOrder: postData.featuredOrder || null,
                authorId: author.id,
                isActive: true,
                publishedAt: new Date(), // Set published date for published posts
            });

            await blogPostRepo.save(post);
            console.log(`✓ Created: "${post.title}" (${post.status})`);
        }

        console.log("\n✅ Successfully seeded blog posts!");
        console.log(`\nCreated ${samplePosts.length} blog posts:`);
        samplePosts.forEach((post, i) => {
            console.log(`  ${i + 1}. ${post.title} [${post.category}]`);
        });

        console.log("\nYou can now view them at:");
        console.log("  - Admin: http://localhost:4242/admin/blog");
        console.log("  - Public: http://localhost:4242/blog");

    } catch (error) {
        console.error("Error seeding blog posts:", error);
        process.exit(1);
    }
    // Note: We don't destroy the connection when using getDataSource helper
}

// Run the seed function
seedBlogPosts();
