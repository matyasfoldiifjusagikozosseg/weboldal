import React from 'react';
// Import utility functions and icons
import { addEventToGoogleCalendar, addEventToAppleCalendar, ClockIcon, LocationMarkerIcon, CalendarDaysIcon, GoogleIcon, AppleIcon } from '../utils';

const EventsPage = ({ allEvents }) => {
  // Calendar helper functions are now imported from utils.js

  return (
    <div className="page-container events-page-container pt-8 px-4 md:px-8 pb-8 bg-mik-light-blue">
      <h1 className="text-3xl font-bold mb-8 text-mik-dark-blue text-center flex items-center justify-center">
        <CalendarDaysIcon className="w-10 h-10 mr-3 text-mik-gold" />
        Összes Közelgő Eseményünk
      </h1>
      {(!allEvents || allEvents.length === 0) ? (
        <p className="text-gray-600 text-center">Jelenleg nincsenek meghirdetett események.</p>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {allEvents.map(event => (
            <article key={event.id || event.title} className="event-item-full bg-mik-white shadow-xl rounded-xl p-5 md:p-6 hover:shadow-2xl transition-shadow duration-300 flex flex-col sm:flex-row items-start">
              <div className="event-date bg-mik-gold text-mik-dark-blue rounded-lg p-3 w-full sm:w-32 text-center mb-4 sm:mb-0 sm:mr-6 flex-shrink-0 flex flex-col justify-center items-center">
                <span className="block text-3xl font-bold">{new Date(event.startDate).getDate()}</span>
                <span className="block text-md uppercase">{new Date(event.startDate).toLocaleString('hu-HU', { month: 'short' })}</span>
                <span className="block text-sm">{new Date(event.startDate).getFullYear()}</span>
              </div>
              <div className="event-details flex-grow">
                <h2 className="text-xl font-semibold mb-2 text-mik-dark-blue">{event.title}</h2>
                <p className="text-gray-700 mb-3 leading-relaxed text-sm">{event.description}</p>
                <div className="text-xs text-gray-600 space-y-1 mb-4">
                    <p className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <strong>Időpont:</strong> {new Date(event.startDate).toLocaleString('hu-HU', { dateStyle: 'medium', timeStyle: event.startDate.includes('T') ? 'short' : undefined })}
                        {event.endDate && event.startDate.split('T')[0] !== event.endDate.split('T')[0] &&
                            ` - ${new Date(event.endDate).toLocaleString('hu-HU', { dateStyle: 'medium', timeStyle: event.endDate.includes('T') ? 'short' : undefined })}`}
                    </p>
                    <p className="flex items-center">
                        <LocationMarkerIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <strong>Helyszín:</strong> {event.location}
                    </p>
                </div>
                <div className="button-group flex space-x-2">
                  <button 
                    onClick={() => addEventToGoogleCalendar(event)} 
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md text-xs transition-colors duration-300 shadow hover:shadow-md flex items-center"
                    title="Hozzáadás Google Naptárhoz"
                  >
                    <GoogleIcon className="w-4 h-4 mr-1.5" /> Google Naptár
                  </button>
                  <button 
                    onClick={() => addEventToAppleCalendar(event)} 
                    className="bg-gray-700 hover:bg-gray-800 text-mik-white font-semibold py-2 px-3 rounded-md text-xs transition-colors duration-300 shadow hover:shadow-md flex items-center"
                    title="Hozzáadás Apple Naptárhoz"
                  >
                    <AppleIcon className="w-4 h-4 mr-1.5" /> Apple Naptár
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
