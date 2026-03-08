import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DATA } from "@/data/resume";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (DATA.projects && DATA.projects.length > 0) {
      // Delete all existing projects
      await prisma.project.deleteMany({});

      // Re-insert from resume data
      await Promise.all(
        DATA.projects.map((p: any) =>
          prisma.project.create({
            data: {
              title: p.title,
              dates: p.dates,
              active: p.active ?? true,
              description: p.description,
              technologies: p.technologies ?? [],
              links: (p.links ?? []).map((l: any) => ({ type: l.type, href: l.href })),
              image: p.image ?? null,
              projectUrl: p.projectUrl ?? null,
              githubUrl: p.githubUrl ?? null,
              caseStudyUrl: p.caseStudyUrl ?? null,
            },
          }),
        ),
      );
    }

    return NextResponse.json({
      success: true,
      message: "Projects seeded successfully from resume.tsx",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
