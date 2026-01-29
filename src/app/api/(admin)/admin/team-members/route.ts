import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppDataSource } from "@/lib/db";
import { TeamMember } from "@/entities/TeamMember";
import { createTeamMemberSchema } from "@/lib/validation";
import slugify from "slugify";

async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    return AppDataSource;
}

async function generateUniqueSlug(name: string, repo: any): Promise<string> {
    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await repo.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get("activeOnly") === "true";

        const ds = await getDataSource();
        const repo = ds.getRepository(TeamMember);

        const whereClause: Record<string, any> = {};
        if (activeOnly) {
            whereClause.isActive = true;
        }

        const teamMembers = await repo.find({
            where: whereClause,
            order: { displayOrder: "ASC", createdAt: "DESC" },
        });

        return NextResponse.json({ success: true, teamMembers });
    } catch (error) {
        console.error("Error fetching team members:", error);
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const validated = createTeamMemberSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(TeamMember);

        // Generate unique slug from name
        const slug = await generateUniqueSlug(validated.data.name, repo);

        const teamMember = repo.create({
            ...validated.data,
            slug,
        });
        await repo.save(teamMember);

        return NextResponse.json({ success: true, teamMember }, { status: 201 });
    } catch (error) {
        console.error("Error creating team member:", error);
        return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
    }
}
