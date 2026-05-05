"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { AvailabilityEvent } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  deviceId: string | null;
  onSelect?: (start: Date, end: Date) => void;
  className?: string;
};

export function CalendarView({ deviceId, onSelect, className }: Props) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [events, setEvents] = useState<AvailabilityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<{ start: string; end: string } | null>(
    null,
  );

  useEffect(() => {
    if (!deviceId || !range) {
      setEvents([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(
      `/api/availability?deviceId=${encodeURIComponent(deviceId)}&start=${encodeURIComponent(range.start)}&end=${encodeURIComponent(range.end)}`,
      { signal: controller.signal },
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) {
          setEvents(json.events as AvailabilityEvent[]);
        } else {
          setEvents([]);
        }
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [deviceId, range]);

  return (
    <div className={cn("relative", className)}>
      {loading ? (
        <div className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] text-muted-foreground backdrop-blur">
          Loading...
        </div>
      ) : null}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridDay,timeGridWeek,dayGridMonth",
        }}
        nowIndicator
        height="auto"
        slotMinTime="08:00:00"
        slotMaxTime="26:00:00"
        allDaySlot={false}
        selectable={Boolean(deviceId)}
        selectMirror
        select={(info) => {
          if (onSelect) onSelect(info.start, info.end);
        }}
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          classNames:
            e.type === "BLOCKED" ? ["fc-blocked"] : ["fc-reservation"],
          editable: false,
          overlap: false,
        }))}
        datesSet={(arg) => {
          setRange({
            start: arg.start.toISOString(),
            end: arg.end.toISOString(),
          });
        }}
      />
    </div>
  );
}
