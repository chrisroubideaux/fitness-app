// components/profile/calendar/DayViewCalendar.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  momentLocalizer,
  SlotInfo,
  Views,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

type Props = {
  token: string | null;
};

const localizer = momentLocalizer(moment);

export default function DayViewCalendar({ token }: Props) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        console.error('❌ Failed to load events:', err);
      }
    })();
  }, [token]);

  const handleBookEvent = async () => {
    if (!token || !selectedSlot) return;

    try {
      const res = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Custom Session',
          event_type: 'workout',
          description: 'Booked via day view',
          start_time: new Date(selectedSlot.start).toISOString(),
          end_time: new Date(selectedSlot.end).toISOString(),
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

      setShowSlotModal(false);
      setSelectedSlot(null);
    } catch (err) {
      console.error('❌ Failed to book event:', err);
    }
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setShowSlotModal(true);
  };

  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCloseModals = () => {
    setShowEventModal(false);
    setShowSlotModal(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
  };

  const statusColor =
    selectedEvent?.status === 'approved'
      ? '#16a34a'
      : selectedEvent?.status === 'declined'
      ? '#dc2626'
      : selectedEvent?.status === 'rescheduled'
      ? '#d97706'
      : '#8b5cf6';

  return (
    <section
      style={{
        width: '100%',
        borderRadius: 38,
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, #faf7ff 0%, #f5f3ff 36%, #eef7ff 72%, #fdfcff 100%)',
        boxShadow:
          '0 18px 45px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(255,255,255,0.45)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, rgba(139,92,246,0.08), transparent 28%), radial-gradient(circle at bottom left, rgba(96,165,250,0.08), transparent 26%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: isMobile ? '1rem' : '1.5rem',
        }}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '0.4rem 0.75rem',
              borderRadius: 999,
              background: 'rgba(139,92,246,0.10)',
              color: '#8b5cf6',
              fontWeight: 800,
              fontSize: '0.76rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.7rem',
            }}
          >
            Day View
          </span>

          <h2
            style={{
              margin: 0,
              color: '#111827',
              fontSize: 'clamp(1.55rem, 3vw, 2.35rem)',
              fontWeight: 950,
              letterSpacing: '-0.04em',
            }}
          >
            Today’s schedule
          </h2>

          <p
            style={{
              margin: '0.55rem 0 0',
              color: '#64748b',
              lineHeight: 1.7,
              maxWidth: 720,
            }}
          >
            View your daily trainer sessions and book available time slots.
          </p>
        </div>

        <div
          style={{
            width: '100%',
            borderRadius: 30,
            overflowX: isMobile ? 'auto' : 'hidden',
            overflowY: 'hidden',
            background: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(139,92,246,0.08)',
            boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
            padding: isMobile ? '0.7rem' : '1rem',
          }}
        >
          <div
            style={{
              width: '100%',
              minWidth: isMobile ? 760 : 'auto',
              height: isMobile ? 620 : '78vh',
            }}
          >
            <Calendar
              localizer={localizer}
              events={events}
              defaultView={Views.DAY}
              views={['day']}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              step={30}
              timeslots={2}
              min={new Date(new Date().setHours(10, 0, 0))}
              max={new Date(new Date().setHours(19, 0, 0))}
              style={{ height: '100%' }}
              formats={{
                eventTimeRangeFormat: ({ start, end }) =>
                  `${formatTime(start)} – ${formatTime(end)}`,
                timeGutterFormat: (date) => formatTime(date),
              }}
            />
          </div>
        </div>

        {isMobile && (
          <p
            style={{
              margin: '0.85rem 0 0',
              color: '#64748b',
              fontSize: '0.86rem',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Swipe horizontally to view the full day calendar.
          </p>
        )}
      </div>

      {showEventModal && selectedEvent && (
        <div
          className="modal fade show d-block"
          style={{
            background: 'rgba(15,23,42,0.56)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0"
              style={{
                borderRadius: 28,
                overflow: 'hidden',
                background: '#ffffff',
                boxShadow: '0 28px 80px rgba(15,23,42,0.22)',
              }}
            >
              <div
                style={{
                  padding: '1.4rem 1.25rem',
                  background:
                    'linear-gradient(135deg, #8b5cf6 0%, #6366f1 48%, #60a5fa 100%)',
                  color: '#ffffff',
                }}
              >
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.35rem 0.7rem',
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.16)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: '0.7rem',
                      }}
                    >
                      Appointment
                    </span>

                    <h5 className="modal-title fw-bold mb-0">
                      {selectedEvent.title}
                    </h5>
                  </div>

                  <button
                    className="btn-close btn-close-white"
                    onClick={handleCloseModals}
                  />
                </div>
              </div>

              <div className="modal-body p-4">
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 22,
                    background:
                      'linear-gradient(135deg, #faf7ff 0%, #eef7ff 100%)',
                    border: '1px solid rgba(139,92,246,0.08)',
                    boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
                  }}
                >
                  <div className="mb-2">
                    ⏰ <strong>Time:</strong> {formatTime(selectedEvent.start)} –{' '}
                    {formatTime(selectedEvent.end)}
                  </div>

                  <div className="mb-2">
                    📝 <strong>Description:</strong>{' '}
                    {selectedEvent.description || 'No description provided.'}
                  </div>

                  <div>
                    💬 <strong>Status:</strong>{' '}
                    <span
                      style={{
                        display: 'inline-flex',
                        padding: '0.25rem 0.55rem',
                        borderRadius: 999,
                        background: `${statusColor}18`,
                        color: statusColor,
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0" style={{ padding: '0 1.25rem 1.25rem' }}>
                <button
                  type="button"
                  onClick={handleCloseModals}
                  style={{
                    minHeight: 42,
                    padding: '0.75rem 1rem',
                    borderRadius: 14,
                    border: '1px solid rgba(148,163,184,0.24)',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: 850,
                  }}
                >
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
          style={{
            background: 'rgba(15,23,42,0.56)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0"
              style={{
                borderRadius: 28,
                overflow: 'hidden',
                background:
                  'linear-gradient(135deg, #faf7ff 0%, #eef7ff 100%)',
                boxShadow: '0 28px 80px rgba(15,23,42,0.22)',
              }}
            >
              <div className="modal-header border-0" style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.35rem 0.7rem',
                      borderRadius: 999,
                      background: 'rgba(139,92,246,0.10)',
                      color: '#8b5cf6',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '0.6rem',
                    }}
                  >
                    Available Slot
                  </span>

                  <h5 className="modal-title fw-bold" style={{ color: '#111827', margin: 0 }}>
                    Book this time?
                  </h5>
                </div>

                <button className="btn-close" onClick={handleCloseModals} />
              </div>

              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 22,
                    background: 'rgba(255,255,255,0.78)',
                    border: '1px solid rgba(139,92,246,0.08)',
                    color: '#475569',
                    fontWeight: 700,
                  }}
                >
                  <strong>Time:</strong>{' '}
                  {formatTime(new Date(selectedSlot.start))} –{' '}
                  {formatTime(new Date(selectedSlot.end))}
                </div>

                <p
                  style={{
                    margin: '1rem 0 0',
                    color: '#64748b',
                    lineHeight: 1.7,
                  }}
                >
                  Would you like to book this slot as a custom workout session?
                </p>
              </div>

              <div className="modal-footer border-0" style={{ padding: '0 1.25rem 1.25rem' }}>
                <button
                  type="button"
                  onClick={handleBookEvent}
                  style={{
                    minHeight: 42,
                    padding: '0.75rem 1rem',
                    borderRadius: 14,
                    border: '1px solid transparent',
                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                    color: '#ffffff',
                    fontWeight: 850,
                    boxShadow: '0 12px 26px rgba(139,92,246,0.18)',
                  }}
                >
                  Book
                </button>

                <button
                  type="button"
                  onClick={handleCloseModals}
                  style={{
                    minHeight: 42,
                    padding: '0.75rem 1rem',
                    borderRadius: 14,
                    border: '1px solid rgba(148,163,184,0.24)',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: 850,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


{/*
'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  momentLocalizer,
  SlotInfo,
  Views,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

export default function DayViewCalendar({ token }: Props) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);

  // ✅ Helper: clean time format
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // ✅ Fetch events
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
        console.error('❌ Failed to load events:', err);
      }
    })();
  }, [token]);

  // ✅ Book event into backend
  const handleBookEvent = async () => {
    if (!token || !selectedSlot) return;

    try {
      const res = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Custom Session',
          event_type: 'workout',
          description: 'Booked via day view',
          start_time: new Date(selectedSlot.start).toISOString(),
          end_time: new Date(selectedSlot.end).toISOString(),
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

      setShowSlotModal(false);
      setSelectedSlot(null);
    } catch (err) {
      console.error('❌ Failed to book event:', err);
    }
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setShowSlotModal(true);
  };

  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCloseModals = () => {
    setShowEventModal(false);
    setShowSlotModal(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
  };

  return (
    <div
      className="box p-3 shadow-sm rounded"
      style={{ background: 'linear-gradient(145deg, #f8f9ff, #eef1fc)' }}
    >
      <Calendar
        localizer={localizer}
        events={events}
        defaultView={Views.DAY}
        views={['day']}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        step={30}
        timeslots={2}
        min={new Date(new Date().setHours(10, 0, 0))}
        max={new Date(new Date().setHours(19, 0, 0))}
        style={{ height: '80vh' }}
        formats={{
          eventTimeRangeFormat: ({ start, end }) =>
            `${formatTime(start)} – ${formatTime(end)}`,
          timeGutterFormat: (date) => formatTime(date),
        }}
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
                  <strong>Time:</strong> {formatTime(selectedEvent.start)} –{' '}
                  {formatTime(selectedEvent.end)}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${
                    selectedEvent.status === 'approved'
                      ? 'bg-success'
                      : selectedEvent.status === 'declined'
                      ? 'bg-danger'
                      : selectedEvent.status === 'rescheduled'
                      ? 'bg-warning text-dark'
                      : 'bg-secondary'
                  }`}>
                    {selectedEvent.status}
                  </span>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCloseModals}
                >
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
                <h5 className="modal-title">Available Time Slot</h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Time:</strong>{' '}
                  {formatTime(new Date(selectedSlot.start))} –{' '}
                  {formatTime(new Date(selectedSlot.end))}
                </p>
                <p>Would you like to book this slot?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success btn-sm" onClick={handleBookEvent}>
                  Book
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleCloseModals}>
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

*/}