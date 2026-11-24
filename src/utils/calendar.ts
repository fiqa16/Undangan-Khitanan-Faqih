export interface CalendarEventDetails {
  title: string;
  description: string;
  location: string;
  startIso: string; // e.g., 20261220T020000Z (09:00 WIB)
  endIso: string;   // e.g., 20261220T060000Z (13:00 WIB)
}

export function downloadCalendarInvite(event: CalendarEventDetails): void {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Choo-Choo Khitan Adventure//ID',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:khitan-faqih-2026@choochookhitan.id`,
    `DTSTAMP:20261124T000000Z`,
    `DTSTART:${event.startIso}`,
    `DTEND:${event.endIso}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], {type: 'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Walimatul-Khitan-Faqih.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
