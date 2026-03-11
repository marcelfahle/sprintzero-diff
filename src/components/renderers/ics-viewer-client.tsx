"use client";

import { type ReactNode, useMemo } from "react";
import ICAL from "ical.js";
import { Calendar, Clock, MapPin, User, Users } from "lucide-react";
import { StructuredFileViewer } from "./structured-file-viewer";

interface ParsedEvent {
  uid: string;
  summary: string;
  description: string;
  location: string;
  organizer: string;
  startDate: Date | null;
  endDate: Date | null;
  isAllDay: boolean;
  attendees: string[];
}

interface IcsViewerClientProps {
  content: string;
  rawView: ReactNode;
}

function parseEvents(content: string): ParsedEvent[] | null {
  try {
    const comp = ICAL.Component.fromString(content);
    const vevents = comp.getAllSubcomponents("vevent");
    if (vevents.length === 0) return null;

    return vevents.map((vevent) => {
      const event = new ICAL.Event(vevent);
      const attendeeProps = vevent.getAllProperties("attendee");
      const attendees = attendeeProps.map(
        (a) =>
          String(a.getParameter("cn") || a.getFirstValue() || ""),
      );

      // Strip mailto: from organizer
      let organizer = event.organizer || "";
      if (organizer.toLowerCase().startsWith("mailto:")) {
        organizer = organizer.slice(7);
      }

      return {
        uid: event.uid || "",
        summary: event.summary || "Untitled Event",
        description: event.description || "",
        location: event.location || "",
        organizer,
        startDate: event.startDate ? event.startDate.toJSDate() : null,
        endDate: event.endDate ? event.endDate.toJSDate() : null,
        isAllDay: event.startDate ? event.startDate.isDate : false,
        attendees,
      };
    });
  } catch {
    return null;
  }
}

function formatDate(date: Date, isAllDay: boolean): string {
  if (isAllDay) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimeRange(event: ParsedEvent): string {
  if (!event.startDate) return "";
  const start = formatDate(event.startDate, event.isAllDay);
  if (!event.endDate || event.isAllDay) return start;
  const end = formatDate(event.endDate, false);
  return `${start} — ${end}`;
}

function EventCard({ event }: { event: ParsedEvent }) {
  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-4">
      <h3 className="text-base font-semibold text-neutral-100 mb-2">
        {event.summary}
      </h3>

      {(event.startDate || event.isAllDay) && (
        <div className="flex items-start gap-2 text-sm text-neutral-300 mb-1.5">
          {event.isAllDay ? (
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
          ) : (
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
          )}
          <span>{formatTimeRange(event)}</span>
        </div>
      )}

      {event.location && (
        <div className="flex items-start gap-2 text-sm text-neutral-300 mb-1.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
          <span>{event.location}</span>
        </div>
      )}

      {event.organizer && (
        <div className="flex items-start gap-2 text-sm text-neutral-300 mb-1.5">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
          <span>{event.organizer}</span>
        </div>
      )}

      {event.attendees.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-neutral-300 mb-1.5">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
          <span>{event.attendees.join(", ")}</span>
        </div>
      )}

      {event.description && (
        <p className="mt-3 text-sm text-neutral-400 whitespace-pre-line border-t border-neutral-700 pt-3">
          {event.description}
        </p>
      )}
    </div>
  );
}

export function IcsViewerClient({ content, rawView }: IcsViewerClientProps) {
  const events = useMemo(() => parseEvents(content), [content]);

  if (!events) {
    return <>{rawView}</>;
  }

  const prettyView = (
    <div className="space-y-3 p-4">
      {events.map((event, i) => (
        <EventCard key={event.uid || i} event={event} />
      ))}
    </div>
  );

  return <StructuredFileViewer prettyView={prettyView} rawView={rawView} />;
}
