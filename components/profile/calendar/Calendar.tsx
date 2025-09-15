// components/profile/calendar/CalendarComponent.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  momentLocalizer,
  SlotInfo,
  Views,
  View,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type EventType = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  status?: string;
};

type ApiEvent = {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status?: string;
};

const localizer = momentLocalizer(moment);

type Props = {
  token: string | null;
};

export default function CalendarComponent({ token }: Props) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [showRescheduleCalendar, setShowRescheduleCalendar] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  // Loading states
  const [loadingBook, setLoadingBook] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingReschedule, setLoadingReschedule] = useState(false);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // ---------------------
  // Fetch events
  // ---------------------
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/appointments/my-events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);

        const data: ApiEvent[] = await res.json();
        const mapped: EventType[] = data.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          start: new Date(e.start_time),
          end: new Date(e.end_time),
          status: e.status ?? 'pending',
        }));

        setEvents(mapped);
      } catch (err) {
        toast.error('❌ Failed to load events.');
        console.error(err);
      }
    })();
  }, [token]);

  // ---------------------
  // Book
  // ---------------------
  const handleBookEvent = async (date: Date, hour: number) => {
    if (!token) return;
    setLoadingBook(true);

    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    // prevent booking in the past
    if (start < new Date()) {
      toast.warn('⚠️ You cannot book in the past.');
      setLoadingBook(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Workout Session',
          event_type: 'workout',
          description: 'User booked session via calendar',
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        }),
      });

      if (!res.ok) throw new Error(`Booking failed: ${res.status}`);
      const { event }: { event: ApiEvent } = await res.json();

      setEvents((prev) => [
        ...prev,
        {
          id: event.id,
          title: event.title,
          description: event.description,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          status: event.status ?? 'pending',
        },
      ]);

      toast.success('✅ Appointment booked!');
      setShowTimeModal(false);
    } catch (err) {
      toast.error('❌ Failed to book appointment.');
      console.error(err);
    } finally {
      setLoadingBook(false);
    }
  };

  // ---------------------
  // Cancel
  // ---------------------
  const handleCancelEvent = async (eventId: string) => {
    if (!token) return;
    setLoadingCancel(true);

    try {
      const res = await fetch(`http://localhost:5000/api/appointments/delete/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Cancel failed: ${res.status}`);

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setShowEventModal(false);

      toast.info('ℹ️ Appointment canceled.');
    } catch (err) {
      toast.error('❌ Failed to cancel appointment.');
      console.error(err);
    } finally {
      setLoadingCancel(false);
    }
  };

  // ---------------------
  // Reschedule
  // ---------------------
  const handleReschedule = async (date: Date, hour: number) => {
    if (!token || !selectedEvent) return;
    setLoadingReschedule(true);

    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    // prevent rescheduling in the past
    if (start < new Date()) {
      toast.warn('⚠️ You cannot reschedule to a past date.');
      setLoadingReschedule(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/update/${selectedEvent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_time: start.toISOString(),
            end_time: end.toISOString(),
          }),
        }
      );

      if (!res.ok) throw new Error(`Reschedule failed: ${res.status}`);
      const { event }: { event: ApiEvent } = await res.json();

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? {
                ...e,
                start: new Date(event.start_time),
                end: new Date(event.end_time),
                status: event.status ?? 'pending',
              }
            : e
        )
      );

      toast.success('✅ Appointment rescheduled!');
      setShowTimeModal(false);
      setShowRescheduleCalendar(false);
      setRescheduleMode(false);
      setSelectedEvent(null);
    } catch (err) {
      toast.error('❌ Failed to reschedule appointment.');
      console.error(err);
    } finally {
      setLoadingReschedule(false);
    }
  };

  // ---------------------
  // Handlers
  // ---------------------
  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const selectedDate = new Date(slotInfo.start);

    if (selectedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      toast.warn('⚠️ You cannot select a past date.');
      return;
    }

    setSelectedSlot(selectedDate);
    if (currentView === 'month') {
      setShowTimeModal(true);
    }
  };

  const handleCloseModals = () => {
    setShowEventModal(false);
    setShowRescheduleCalendar(false);
    setShowTimeModal(false);
    setRescheduleMode(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  // ---------------------
  // Event Styles
  // ---------------------
  const eventStyleGetter = (event: EventType) => {
    let background = 'linear-gradient(135deg, #cfd9df, #e2ebf0)';
    let color = '#333';

    switch (event.status) {
      case 'approved':
        background = 'linear-gradient(135deg, #a8e063, #56ab2f)';
        color = '#fff';
        break;
      case 'declined':
        background = 'linear-gradient(135deg, #ff758c, #ff7eb3)';
        color = '#fff';
        break;
      case 'rescheduled':
        background = 'linear-gradient(135deg, #f6d365, #fda085)';
        color = '#fff';
        break;
    }

    return { style: { background, color, borderRadius: '6px', padding: '2px 4px' } };
  };

  // ---------------------
  // Render
  // ---------------------
  return (
    <div className="box p-3 shadow-sm rounded">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Main Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        defaultView={Views.MONTH}
        view={currentView}
        onView={(view) => setCurrentView(view)}
        selectable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        style={{ height: '80vh' }}
        eventPropGetter={eventStyleGetter}
        formats={{
          timeGutterFormat: (date: Date) => formatTime(date),
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${formatTime(start)} – ${formatTime(end)}`,
        }}
        min={new Date()} // ✅ prevent selecting past in main calendar
      />

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedEvent.title}</h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <p><strong>Date:</strong> {selectedEvent.start.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {formatTime(selectedEvent.start)} – {formatTime(selectedEvent.end)}</p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
                <p><strong>Status:</strong> {selectedEvent.status}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-danger btn-sm"
                  disabled={loadingCancel}
                  onClick={() => handleCancelEvent(selectedEvent.id)}
                >
                  {loadingCancel ? <span className="spinner-border spinner-border-sm" /> : 'Cancel'}
                </button>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => {
                    setRescheduleMode(true);
                    setShowRescheduleCalendar(true);
                    setShowEventModal(false);
                  }}
                >
                  Reschedule
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleCloseModals}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Calendar Modal */}
      {showRescheduleCalendar && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Choose New Date</h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <Calendar
                  localizer={localizer}
                  events={events}
                  defaultView={Views.MONTH}
                  views={['month']}
                  selectable
                  style={{ height: '60vh' }}
                  min={new Date()} // ✅ block past dates
                  onSelectSlot={(slotInfo: SlotInfo) => {
                    const newDate = new Date(slotInfo.start);
                    if (newDate < new Date(new Date().setHours(0, 0, 0, 0))) {
                      toast.warn('⚠️ You cannot reschedule to a past date.');
                      return;
                    }
                    setSelectedSlot(newDate);
                    setShowRescheduleCalendar(false);
                    setShowTimeModal(true);
                  }}
                  eventPropGetter={eventStyleGetter}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Picker Modal */}
      {showTimeModal && selectedSlot && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {rescheduleMode ? 'Reschedule Appointment' : `Select Time – ${selectedSlot.toLocaleDateString()}`}
                </h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-wrap gap-2">
                  {Array.from({ length: 10 }, (_, i) => {
                    const hour = 10 + i;
                    const timeString = formatTime(new Date(0, 0, 0, hour));
                    return (
                      <button
                        key={hour}
                        className="btn btn-outline-primary btn-sm"
                        disabled={loadingBook || loadingReschedule}
                        onClick={() =>
                          rescheduleMode
                            ? handleReschedule(selectedSlot, hour)
                            : handleBookEvent(selectedSlot, hour)
                        }
                      >
                        {(loadingBook || loadingReschedule) ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          timeString
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={handleCloseModals}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



/*

'use client';

import { useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';

type EventType = {
  title: string;
  start: Date;
  end: Date;
  description?: string;
};

const localizer = momentLocalizer(moment);

const initialEvents: EventType[] = [
  {
    title: 'Workout: Upper Body Strength',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000),
    description: 'Push, pull, and shoulder circuit.',
  },
  {
    title: 'Trainer Meeting: Coach Lena',
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    description: 'Progress check-in and plan review.',
  },
];

export default function CalendarComponent() {
  const [events] = useState<EventType[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlot(new Date(slotInfo.start));
    setShowSlotModal(true);
  };

  const handleCloseModals = () => {
    setShowEventModal(false);
    setShowSlotModal(false);
    setShowTimeModal(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  return (
    <div
      className="box p-3 shadow-sm rounded"
      style={{ background: 'linear-gradient(145deg, #f8f9ff, #eef1fc)' }}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        popup
        style={{ height: '80vh' }}
      />

    
      {showEventModal && selectedEvent && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedEvent.title}</h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Date:</strong> {selectedEvent.start.toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong>{' '}
                  {selectedEvent.start.toLocaleTimeString()} –{' '}
                  {selectedEvent.end.toLocaleTimeString()}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleCloseModals}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    
      {showSlotModal && selectedSlot && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule Appointment</h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Date Selected:</strong> {selectedSlot.toLocaleDateString()}
                </p>
                <p>
                  This date is available for booking. Would you like to schedule a
                  workout or meeting?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      lineHeight: '1.2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  onClick={() => {
                    setShowSlotModal(false);
                    setShowTimeModal(true);
                  }}
                >
                  Select a Time
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      lineHeight: '1.2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  onClick={handleCloseModals}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showTimeModal && selectedSlot && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Available Times – {selectedSlot.toLocaleDateString()}
                </h5>
                <button
                  className="btn-close" 
                  onClick={handleCloseModals}>

                  </button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-wrap gap-2">
                  {Array.from({ length: 10 }, (_, i) => {
                    const hour = 10 + i; // 10 AM to 7 PM
                    const timeString = new Date(0, 0, 0, hour).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    });
                    return (
                      <button key={hour}
                        className="btn btn-outline-primary btn-sm"
                        style={{
                        padding: '4px 10px',
                        fontSize: '0.8rem',
                        lineHeight: '1.2',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        {timeString}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-sm" 
                  style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      lineHeight: '1.2',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  onClick={handleCloseModals}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







*/