import { getTemplate } from "@/lib/templates";
import type { EventRecord, ScheduleItem } from "@/lib/types";

/** Mini-web print/share card stays on quince-tiara stationery. */
export function toQuincePrintCompanion(event: EventRecord): EventRecord {
  if (event.templateId !== "quince-princesa") return event;
  const tpl = getTemplate("quince-tiara");
  const misa = event.misa;
  const recepcion = event.recepcion;
  const schedule: ScheduleItem[] =
    event.schedule && event.schedule.length > 0
      ? event.schedule
      : [
          {
            id: "misa",
            time: misa?.time || event.timeLabel,
            title: "Mass",
            titleEs: "Misa",
            description: [misa?.place || event.venue, misa?.address || event.address]
              .filter(Boolean)
              .join(", "),
          },
          {
            id: "comida",
            time: recepcion?.time || "",
            title: "Lunch",
            titleEs: "Comida",
            description: [recepcion?.place, recepcion?.address]
              .filter(Boolean)
              .join(", "),
          },
        ];

  return {
    ...event,
    templateId: "quince-tiara",
    theme: tpl.theme,
    hostName: event.parentsLine?.trim() || event.hostName,
    schedule,
  };
}
