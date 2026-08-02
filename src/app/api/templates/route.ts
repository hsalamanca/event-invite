import { NextResponse } from "next/server";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates";

export const runtime = "nodejs";

/** Public catalog of Ownvite templates (Evite/Canva-inspired looks). */
export async function GET() {
  return NextResponse.json({
    categories: TEMPLATE_CATEGORIES,
    templates: TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      nameEs: t.nameEs,
      description: t.description,
      descriptionEs: t.descriptionEs,
      inspiredBy: t.inspiredBy,
      inspiredByEs: t.inspiredByEs,
      categories: t.categories,
      heroImage: t.heroImage,
      headline: t.headline,
      theme: t.theme,
    })),
  });
}
