import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'; // Added Link
import './App.css';
import newsData from './news.json';
import eventsData from './events.json';
import Navbar from './components/Navbar';
import EventsPage from './pages/Events';
import AboutPage from './pages/About';
import NewsDetailPage from './pages/NewsDetailPage'; // Import NewsDetailPage
import { addEventToGoogleCalendar, addEventToAppleCalendar, NewspaperIcon, CalendarDaysIcon, LocationMarkerIcon, ClockIcon, GoogleIcon, AppleIcon } from './utils'; // Import calendar functions and icons

function App() {
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    // Sort news by date descending to show newest first
    const sortedNews = newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setNews(sortedNews);
    
    const today = new Date();
    const filteredEvents = eventsData.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= today;
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // Sort events by date
    setEvents(filteredEvents.slice(0, 3)); 
    setUpcomingEvents(filteredEvents);
  }, []);

  const HomePage = () => (
    <>
      <main className="container mx-auto py-8 px-4 bg-mik-light-blue"> {/* Changed classes for centering and padding */}
        {/* Hero Section for Mobile - Visible only on mobile, hidden on md and larger */}
        <section className="md:hidden hero-section bg-mik-dark-blue text-mik-white py-12 px-4 text-center rounded-lg shadow-xl mb-8">
          <img src={process.env.PUBLIC_URL + '/MIK_logo.png'} alt="MIK Logo" className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-mik-gold"/>
          <h1 className="text-3xl font-bold mb-2 text-mik-gold">Üdvözlünk!</h1>
          <p className="text-md text-mik-light-blue">A Mátyásföldi Ifjúsági Közösség hivatalos weboldala.</p>
        </section>

        {/* Wrapper for News and Events sections */}
        <div className="flex flex-col md:flex-row gap-8">
          <section className="news-section md:w-2/3">
            <h2 className="text-3xl font-bold mb-6 text-mik-dark-blue flex items-center">
              <NewspaperIcon className="w-8 h-8 mr-3 text-mik-gold" />
              Hírfolyam
            </h2>
            {news.length === 0 && <p className="text-gray-600">Nincsenek aktuális hírek.</p>}
            <div className="space-y-8"> {/* Re-instated space-y-8 for spacing between cards */}
              {news.map((item) => (
                <article 
                  key={item.id} 
                  className="bg-mik-white shadow-xl rounded-lg p-6 group transition-shadow duration-300 hover:shadow-2xl flex flex-col"
                >
                  {item.imageUrl && (
                    <div className="mb-6">
                      <img 
                        src={process.env.PUBLIC_URL + item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-56 object-cover rounded-md shadow"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-grow">
                    <h3 className="text-2xl font-semibold mb-2 text-mik-dark-blue group-hover:text-mik-blue transition-colors duration-300">
                      <Link to={`/news/${item.id}`}>{item.title}</Link>
                    </h3>
                    <div className="flex items-center text-xs text-mik-gray mb-4">
                      {/* Optional: <CalendarDaysIcon className="w-4 h-4 mr-1.5 text-mik-gray" /> */}
                      <span>
                        Publikálva: {new Date(item.date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed flex-grow">{item.summary}</p>
                    <div className="mt-auto"> {/* Ensures link is at the bottom */}
                      <Link
                        to={`/news/${item.id}`}
                        className="inline-flex items-center text-mik-orange hover:text-mik-yellow font-semibold text-sm group-hover:underline"
                      >
                        Bővebben olvasok <span aria-hidden="true" className="ml-1.5">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="events-section md:w-1/3">
            <h2 className="text-3xl font-bold mb-6 text-mik-dark-blue flex items-center">
              <CalendarDaysIcon className="w-8 h-8 mr-3 text-mik-gold" />
              Közelgő Események (Top 3)
            </h2>
            {events.length === 0 && <p className="text-gray-600">Nincsenek közelgő események.</p>}
            <div className="space-y-6">
              {events.map((event, index) => (
                <article key={index} className="event-item-new bg-mik-white shadow-lg rounded-lg p-5 hover:shadow-xl transition-shadow duration-300 flex flex-col sm:flex-row items-start">
                  <div className="event-date bg-mik-gold text-mik-dark-blue rounded-lg p-3 w-full sm:w-28 text-center mb-4 sm:mb-0 sm:mr-5 flex-shrink-0">
                    <span className="block text-2xl font-bold">{new Date(event.startDate).getDate()}</span>
                    <span className="block text-xs uppercase">{new Date(event.startDate).toLocaleString('hu-HU', { month: 'short' })}</span>
                    <span className="block text-xs">{new Date(event.startDate).getFullYear()}</span>
                  </div>
                  <div className="event-details flex-grow">
                    <h3 className="text-lg font-semibold mb-1 text-mik-dark-blue">{event.title}</h3>
                    <p className="text-gray-600 text-xs mb-2 leading-snug">{event.description.substring(0,100)}{event.description.length > 100 ? '...' : ''}</p>
                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      <p className="flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1.5 text-gray-400" />
                        {new Date(event.startDate).toLocaleString('hu-HU', { day: 'numeric', month: 'numeric', year: 'numeric', hour: event.startDate.includes('T') ? '2-digit' : undefined, minute: event.startDate.includes('T') ? '2-digit' : undefined })}
                        {event.endDate && event.startDate.split('T')[0] !== event.endDate.split('T')[0] && 
                          ` - ${new Date(event.endDate).toLocaleString('hu-HU', { day: 'numeric', month: 'numeric', year: 'numeric', hour: event.endDate.includes('T') ? '2-digit' : undefined, minute: event.endDate.includes('T') ? '2-digit' : undefined })}`}
                      </p>
                      <p className="flex items-center">
                        <LocationMarkerIcon className="w-3 h-3 mr-1.5 text-gray-400" />
                        {event.location}
                      </p>
                    </div>
                    <div className="button-group flex space-x-2">
                      <button 
                        onClick={() => addEventToGoogleCalendar(event)} 
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-3 rounded-md text-xs transition-colors duration-300 flex items-center"
                        title="Hozzáadás Google Naptárhoz"
                      >
                        <GoogleIcon className="w-3 h-3 mr-1.5" /> Google
                      </button>
                      <button 
                        onClick={() => addEventToAppleCalendar(event)} 
                        className="bg-gray-700 hover:bg-gray-800 text-mik-white font-semibold py-1.5 px-3 rounded-md text-xs transition-colors duration-300 flex items-center"
                        title="Hozzáadás Apple Naptárhoz"
                      >
                        <AppleIcon className="w-3 h-3 mr-1.5" /> Apple
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );

  return (
    <BrowserRouter basename={"/weboldal"} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App bg-mik-light-blue min-h-screen flex flex-col">
        <Navbar /> 
        <div className="flex-grow">
          <Routes> 
            <Route path="/" element={<HomePage />} />
            <Route path="/news/:newsId" element={<NewsDetailPage />} /> {/* Route for news detail */} 
            <Route path="/events" element={<EventsPage allEvents={upcomingEvents} />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </div>
        <footer className="App-footer bg-mik-dark-blue text-mik-light-blue text-center p-4 mt-auto">
          <p>&copy; {new Date().getFullYear()} Mátyásföldi Ifjúsági Közösség. Minden jog fenntartva.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
