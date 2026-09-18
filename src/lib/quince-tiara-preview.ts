import demo from "../../data/quince-tiara-demo.json";
import { getTemplate } from "@/lib/templates";
import type { EventRecord } from "@/lib/types";

export function getQuinceTiaraPreviewEvent(): EventRecord {
  const tpl = getTemplate("quince-tiara");
  const now = new Date().toISOString();
  return {
    ...(demo as unknown as EventRecord),
    theme: tpl.theme,
    templateId: "quince-tiara",
    createdAt: now,
    updatedAt: now,
  };
}
