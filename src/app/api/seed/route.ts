import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { DATA } from "@/data/resume";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
    // Guard with internal secret or token if needed, but for dev we can just check if logged in
    const token = await getToken({ req });
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // Seed Projects
        if (DATA.projects && DATA.projects.length > 0) {
            await db.collection("projects").deleteMany({});
            const projectsToInsert = DATA.projects.map((p: any) => ({
                ...p,
                links: p.links?.map((l: any) => ({
                    type: l.type,
                    href: l.href
                })) || [],
                createdAt: new Date(),
            }));
            await db.collection("projects").insertMany(projectsToInsert);
        }

        return NextResponse.json({
            success: true,
            message: "Projects seeded successfully from resume.tsx"
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
