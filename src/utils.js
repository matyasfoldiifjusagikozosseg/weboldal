const formatDateForCalendar = (dateTimeString, forICS = false) => {
  const date = new Date(dateTimeString);
  if (forICS) {
    // ICS format: YYYYMMDDTHHmmssZ
    // If no time, it's an all-day event, so just YYYYMMDD
    if (dateTimeString.includes('T')) {
      return (
        date.getUTCFullYear() +
        ('0' + (date.getUTCMonth() + 1)).slice(-2) +
        ('0' + date.getUTCDate()).slice(-2) +
        'T' +
        ('0' + date.getUTCHours()).slice(-2) +
        ('0' + date.getUTCMinutes()).slice(-2) +
        ('0' + date.getUTCSeconds()).slice(-2) +
        'Z'
      );
    } else {
      // For all-day events, ICS expects DTSTART;VALUE=DATE:YYYYMMDD
      return (
        date.getUTCFullYear() +
        ('0' + (date.getUTCMonth() + 1)).slice(-2) +
        ('0' + date.getUTCDate()).slice(-2)
      );
    }
  } else { // For Google Calendar URL
    if (dateTimeString.includes('T')) {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0];
    } else {
      const year = date.getUTCFullYear();
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = date.getUTCDate().toString().padStart(2, '0');
      return `${year}${month}${day}`;
    }
  }
};

export const addEventToGoogleCalendar = (event) => {
  let startDate = formatDateForCalendar(event.startDate);
  let endDate = event.endDate ? formatDateForCalendar(event.endDate) : startDate;

  // Adjust for all-day events for Google Calendar
  if (!event.startDate.includes('T')) {
    const d = new Date(event.startDate);
    d.setUTCDate(d.getUTCDate() + 1); // Google expects end date to be the next day for single all-day events
    endDate = formatDateForCalendar(d.toISOString().split('T')[0]);
     // If event.endDate was originally provided and it's also an all-day event on a different day
    if (event.endDate && !event.endDate.includes('T') && event.startDate.split('T')[0] !== event.endDate.split('T')[0]) {
        const ed = new Date(event.endDate);
        ed.setUTCDate(ed.getUTCDate() + 1);
        endDate = formatDateForCalendar(ed.toISOString().split('T')[0]);
    }
  }


  const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
    event.description || ''
  )}&location=${encodeURIComponent(event.location || '')}`;
  window.open(googleCalendarUrl, '_blank');
};

export const addEventToAppleCalendar = (event) => {
  const formatForICS = (dateTimeString, isAllDay) => {
    const date = new Date(dateTimeString);
    const year = date.getUTCFullYear();
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const day = ('0' + date.getUTCDate()).slice(-2);
    if (isAllDay) {
      return `${year}${month}${day}`;
    }
    const hours = ('0' + date.getUTCHours()).slice(-2);
    const minutes = ('0' + date.getUTCMinutes()).slice(-2);
    const seconds = ('0' + date.getUTCSeconds()).slice(-2);
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  const isStartDateAllDay = !event.startDate.includes('T');
  let icsStartDate = formatForICS(event.startDate, isStartDateAllDay);
  let icsEndDate;

  if (event.endDate) {
    const isEndDateAllDay = !event.endDate.includes('T');
    icsEndDate = formatForICS(event.endDate, isEndDateAllDay);
    // For all-day events spanning multiple days, Apple needs DTEND to be the day AFTER the actual end day.
    if (isEndDateAllDay) {
        const d = new Date(event.endDate);
        d.setUTCDate(d.getUTCDate() + 1);
        icsEndDate = formatForICS(d.toISOString().split('T')[0], true);
    }
  } else {
    // If no end date, for an all-day event, DTEND is the day after DTSTART.
    // For a timed event, make it one hour long for simplicity or use DTEND same as DTSTART.
    if (isStartDateAllDay) {
      const d = new Date(event.startDate);
      d.setUTCDate(d.getUTCDate() + 1);
      icsEndDate = formatForICS(d.toISOString().split('T')[0], true);
    } else {
      // Default to 1 hour duration if no end date for timed event
      const d = new Date(event.startDate);
      d.setUTCHours(d.getUTCHours() + 1);
      icsEndDate = formatForICS(d.toISOString(), false);
    }
  }
  
  // If it's a single all-day event (no end date or end date is same as start date)
  if (isStartDateAllDay && (!event.endDate || event.startDate.split('T')[0] === event.endDate.split('T')[0])) {
    const d = new Date(event.startDate);
    d.setUTCDate(d.getUTCDate() + 1); // DTEND should be the next day for a single all-day event
    icsEndDate = formatForICS(d.toISOString().split('T')[0], true);
  }


  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mátyásföldi Ifjúsági Közösség//NONSGML v1.0//HU',
    'BEGIN:VEVENT',
    `UID:${event.id || new Date().getTime()}@mik.hu`,
    `DTSTAMP:${formatForICS(new Date().toISOString(), false)}`,
    isStartDateAllDay ? `DTSTART;VALUE=DATE:${icsStartDate}` : `DTSTART:${icsStartDate}`,
    isStartDateAllDay && event.endDate && event.startDate.split('T')[0] === event.endDate.split('T')[0] ? 
    `DTEND;VALUE=DATE:${icsEndDate}` : 
    (event.endDate && !event.endDate.includes('T') ? `DTEND;VALUE=DATE:${icsEndDate}` : `DTEND:${icsEndDate}`),
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ''}`,
    `LOCATION:${event.location || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// Heroicon SVGs (outline style)
export const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 inline">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
  </svg>
);

export const AppleIcon = () => ( // Using a generic calendar icon for Apple as direct Apple logo might be restrictive
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 inline">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

export const GoogleIcon = () => ( // Simplified G
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 mr-2 inline">
    <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2.18 12.19,2.18C6.42,2.18 2.03,6.8 2.03,12C2.03,17.05 6.16,21.82 12.19,21.82C17.6,21.82 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
  </svg>
);

export const LocationMarkerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 inline text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

export const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 inline text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const NewspaperIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 inline text-blue-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18V7.875c0-.621.504-1.125 1.125-1.125H6.75M12 7.5V9m0 3V9m0 3v2.25m0 3v-2.25m0 0V15m0-6.75V9m0 3h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm0-9h.008v.008H12V9Z" />
  </svg>
);

export const CalendarDaysIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 inline text-blue-600">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
</svg>
);

export const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1 md:mr-2 inline">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const InformationCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1 md:mr-2 inline">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);
