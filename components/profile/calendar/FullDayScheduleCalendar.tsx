// components/profile/calendar/FullDayScheduleCalendar.tsx
// components/profile/calendar/FullDayScheduleCalendar.tsx

'use client';

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
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

export default function FullDayScheduleCalendar({ token }: Props) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
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

  const handleConfirmBooking = async () => {
    if (!token || !selectedSlot) return;

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
          description: 'Booked via full day view',
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

      setShowModal(false);
      setSelectedSlot(null);
    } catch (err) {
      console.error('❌ Failed to book event:', err);
    }
  };

  const handleSelectSlot = (slot: SlotInfo) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
  };

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
            Full Day Schedule
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
            Plan your training day
          </h2>

          <p
            style={{
              margin: '0.55rem 0 0',
              color: '#64748b',
              lineHeight: 1.7,
              maxWidth: 720,
            }}
          >
            View available training windows between business hours and book a
            workout session directly from your daily schedule.
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
              defaultView="day"
              views={['day']}
              step={30}
              timeslots={2}
              min={new Date(new Date().setHours(10, 0, 0))}
              max={new Date(new Date().setHours(19, 0, 0))}
              selectable
              onSelectSlot={handleSelectSlot}
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
            Swipe horizontally to view the full day schedule.
          </p>
        )}
      </div>

      {showModal && selectedSlot && (
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
              <div
                className="modal-header border-0"
                style={{
                  padding: '1.25rem 1.25rem 0.75rem',
                }}
              >
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
                    Selected Time Slot
                  </span>

                  <h5
                    className="modal-title fw-bold"
                    style={{
                      color: '#111827',
                      margin: 0,
                    }}
                  >
                    Confirm this booking?
                  </h5>
                </div>

                <button className="btn-close" onClick={handleCloseModal} />
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
                    boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
                  }}
                >
                  <p style={{ marginBottom: '0.6rem' }}>
                    <strong>Start:</strong>{' '}
                    {formatTime(new Date(selectedSlot.start))}
                  </p>

                  <p style={{ marginBottom: 0 }}>
                    <strong>End:</strong>{' '}
                    {formatTime(new Date(selectedSlot.end))}
                  </p>
                </div>

                <p
                  style={{
                    margin: '1rem 0 0',
                    color: '#64748b',
                    lineHeight: 1.7,
                  }}
                >
                  Would you like to confirm this workout session booking?
                </p>
              </div>

              <div
                className="modal-footer border-0"
                style={{
                  padding: '0 1.25rem 1.25rem',
                  gap: '0.65rem',
                }}
              >
                <button
                  type="button"
                  onClick={handleConfirmBooking}
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
                  Confirm
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
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
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
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

export default function FullDayScheduleCalendar({ token }: Props) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Helper: clean 12h time format
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // ✅ Fetch events from backend
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

  // ✅ Book new event
  const handleConfirmBooking = async () => {
    if (!token || !selectedSlot) return;

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
          description: 'Booked via full day view',
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

      setShowModal(false);
      setSelectedSlot(null);
    } catch (err) {
      console.error('❌ Failed to book event:', err);
    }
  };

  const handleSelectSlot = (slot: SlotInfo) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
        defaultView="day"
        views={['day']}
        step={30}
        timeslots={2}
        min={new Date(new Date().setHours(10, 0, 0))}
        max={new Date(new Date().setHours(19, 0, 0))}
        selectable
        onSelectSlot={handleSelectSlot}
        style={{ height: '80vh' }}
        formats={{
          eventTimeRangeFormat: ({ start, end }) =>
            `${formatTime(start)} – ${formatTime(end)}`,
          timeGutterFormat: (date) => formatTime(date),
        }}
      />

      {showModal && selectedSlot && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Selected Time Slot</h5>
                <button className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Start:</strong> {formatTime(new Date(selectedSlot.start))}
                </p>
                <p>
                  <strong>End:</strong> {formatTime(new Date(selectedSlot.end))}
                </p>
                <p>Would you like to confirm this booking?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={handleConfirmBooking}>
                  Confirm
                </button>
                <button className="btn btn-secondary" onClick={handleCloseModal}>
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