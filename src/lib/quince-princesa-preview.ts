import demo from "../../data/quince-princesa-demo.json";
import { getTemplate } from "@/lib/templates";
import type { EventRecord } from "@/lib/types";

export function getQuincePrincesaPreviewEvent(): EventRecord {
  const tpl = getTemplate("quince-princesa");
  const now = new Date().toISOString();
  return {
    ...(demo as unknown as EventRecord),
    theme: tpl.theme,
    templateId: "quince-princesa",
    createdAt: now,
    updatedAt: now,
  };
}
