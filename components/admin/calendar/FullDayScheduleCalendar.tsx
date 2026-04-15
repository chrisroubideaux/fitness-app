// components/admin/calendar/FullDayScheduleCalendar.tsx
// components/admin/calendar/FullDayScheduleCalendar.tsx
'use client';

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiInfo, FiCheckCircle } from 'react-icons/fi';

type EventType = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  status?: string;
  userName?: string;
};

type ApiEvent = {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status?: string;
  user_name?: string;
};

const localizer = momentLocalizer(moment);

export default function FullDayScheduleCalendar() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [showRescheduleCalendar, setShowRescheduleCalendar] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [loadingRespond, setLoadingRespond] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingReschedule, setLoadingReschedule] = useState(false);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

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
        const res = await fetch(
          'http://localhost:5000/api/appointments/admin/all-events',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error(`Failed with status ${res.status}`);

        const data: ApiEvent[] = await res.json();

        const mapped: EventType[] = data.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          start: new Date(e.start_time),
          end: new Date(e.end_time),
          status: e.status ?? 'pending',
          userName: e.user_name,
        }));

        setEvents(mapped);
      } catch (err) {
        toast.error('❌ Failed to load events.');
        console.error(err);
      }
    })();
  }, [token]);

  const handleRespond = async (
    eventId: string,
    action: 'approve' | 'decline'
  ) => {
    if (!token) return;

    setLoadingRespond(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/admin/respond/${eventId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      if (!res.ok) throw new Error(`Respond failed: ${res.status}`);

      const { event }: { event: ApiEvent } = await res.json();

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, status: event.status } : e
        )
      );

      toast.success(`✅ Appointment ${action}d`);
      setShowEventModal(false);
    } catch (err) {
      toast.error(`❌ Failed to ${action} appointment.`);
      console.error(err);
    } finally {
      setLoadingRespond(false);
    }
  };

  const handleCancel = async (eventId: string) => {
    if (!token) return;

    setLoadingCancel(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/admin/delete/${eventId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(`Cancel failed: ${res.status}`);

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setShowEventModal(false);
      toast.info('ℹ️ Appointment canceled');
    } catch (err) {
      toast.error('❌ Failed to cancel appointment.');
      console.error(err);
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleReschedule = async (date: Date, hour: number) => {
    if (!token || !selectedEvent) return;

    setLoadingReschedule(true);

    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);

    const end = new Date(start.getTime() + 60 * 60 * 1000);

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/admin/update/${selectedEvent.id}`,
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

      toast.success('✅ Appointment rescheduled');
      setShowTimeModal(false);
      setShowRescheduleCalendar(false);
      setSelectedEvent(null);
    } catch (err) {
      toast.error('❌ Failed to reschedule appointment.');
      console.error(err);
    } finally {
      setLoadingReschedule(false);
    }
  };

  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSelectSlot = (slot: SlotInfo) => {
    setSelectedSlot(new Date(slot.start));
    setShowTimeModal(true);
  };

  const handleCloseModals = () => {
    setShowEventModal(false);
    setShowRescheduleCalendar(false);
    setShowTimeModal(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  const eventStyleGetter = (event: EventType) => {
    let background = 'linear-gradient(135deg,#8b5cf6,#a855f7)';

    if (event.status === 'approved') {
      background = 'linear-gradient(135deg,#22c55e,#16a34a)';
    }

    if (event.status === 'declined') {
      background = 'linear-gradient(135deg,#ef4444,#fb7185)';
    }

    if (event.status === 'rescheduled') {
      background = 'linear-gradient(135deg,#f59e0b,#fb923c)';
    }

    return {
      style: {
        background,
        color: '#fff',
        borderRadius: '10px',
        padding: '3px 6px',
        border: 'none',
        fontWeight: 700,
        boxShadow: '0 6px 14px rgba(15,23,42,0.10)',
      },
    };
  };

  const todaysEvents = events.filter(
    (e) => e.start.toDateString() === new Date().toDateString()
  );

  const pendingCount = todaysEvents.filter((e) => e.status === 'pending').length;
  const approvedCount = todaysEvents.filter((e) => e.status === 'approved').length;

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
      <ToastContainer position="top-right" autoClose={3000} />

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
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
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
            <FiCalendar />
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
            Manage the full training day
          </h2>

          <p
            style={{
              margin: '0.55rem 0 0',
              color: '#64748b',
              lineHeight: 1.7,
              maxWidth: 760,
            }}
          >
            Review client sessions across business hours, approve requests, and
            reschedule appointments when needed.
          </p>
        </div>

        <div className="row g-3 mb-3">
          {[
            { label: 'Today', value: todaysEvents.length, icon: <FiCalendar /> },
            { label: 'Pending', value: pendingCount, icon: <FiClock /> },
            { label: 'Approved', value: approvedCount, icon: <FiCheckCircle /> },
          ].map((item) => (
            <div key={item.label} className="col-12 col-md-4">
              <div
                style={{
                  height: '100%',
                  borderRadius: 24,
                  padding: '1rem',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,250,252,0.92))',
                  border: '1px solid rgba(139,92,246,0.08)',
                  boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 15,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(96,165,250,0.12))',
                    color: '#8b5cf6',
                    marginBottom: '0.75rem',
                  }}
                >
                  {item.icon}
                </div>

                <div
                  style={{
                    color: '#111827',
                    fontWeight: 950,
                    fontSize: '1.45rem',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {item.value}
                </div>

                <div
                  style={{
                    color: '#64748b',
                    fontWeight: 750,
                    fontSize: '0.86rem',
                  }}
                >
                  {item.label}
                </div>
              </div>
            </div>
          ))}
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
              step={30}
              timeslots={2}
              min={new Date(new Date().setHours(10, 0))}
              max={new Date(new Date().setHours(19, 0))}
              selectable
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              formats={{
                timeGutterFormat: (date: Date) => formatTime(date),
                eventTimeRangeFormat: ({
                  start,
                  end,
                }: {
                  start: Date;
                  end: Date;
                }) => `${formatTime(start)} – ${formatTime(end)}`,
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

      {showEventModal && selectedEvent && (
        <AdminEventModal
          selectedEvent={selectedEvent}
          loadingRespond={loadingRespond}
          loadingCancel={loadingCancel}
          formatTime={formatTime}
          onClose={handleCloseModals}
          onApprove={() => handleRespond(selectedEvent.id, 'approve')}
          onDecline={() => handleRespond(selectedEvent.id, 'decline')}
          onCancel={() => handleCancel(selectedEvent.id)}
          onReschedule={() => {
            setShowRescheduleCalendar(true);
            setShowEventModal(false);
          }}
        />
      )}

      {showRescheduleCalendar && (
        <div style={overlayStyle}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div style={modalCardStyle}>
              <div style={modalHeaderStyle}>
                <div>
                  <span style={modalPillStyle}>Reschedule</span>
                  <h5 style={modalTitleStyle}>Choose New Date</h5>
                </div>

                <button className="btn-close" onClick={handleCloseModals} />
              </div>

              <div style={{ padding: '1.25rem' }}>
                <div
                  style={{
                    width: '100%',
                    overflowX: isMobile ? 'auto' : 'hidden',
                    borderRadius: 22,
                    background: 'rgba(255,255,255,0.78)',
                    border: '1px solid rgba(139,92,246,0.08)',
                    padding: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      minWidth: isMobile ? 720 : 'auto',
                      height: isMobile ? 480 : '60vh',
                    }}
                  >
                    <Calendar
                      localizer={localizer}
                      events={events}
                      defaultView={Views.MONTH}
                      views={['month']}
                      selectable
                      style={{ height: '100%' }}
                      onSelectSlot={(slotInfo: SlotInfo) => {
                        const newDate = new Date(slotInfo.start);
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
          </div>
        </div>
      )}

      {showTimeModal && selectedSlot && (
        <div style={overlayStyle}>
          <div className="modal-dialog modal-dialog-centered">
            <div style={modalCardStyle}>
              <div style={modalHeaderStyle}>
                <div>
                  <span style={modalPillStyle}>Reschedule Time</span>

                  <h5 style={modalTitleStyle}>
                    Reschedule Appointment – {selectedSlot.toLocaleDateString()}
                  </h5>
                </div>

                <button className="btn-close" onClick={handleCloseModals} />
              </div>

              <div style={{ padding: '1.25rem' }}>
                <div className="d-flex flex-wrap" style={{ gap: '0.65rem' }}>
                  {Array.from({ length: 10 }, (_, i) => {
                    const hour = 10 + i;
                    const timeString = formatTime(new Date(0, 0, 0, hour));

                    return (
                      <button
                        key={hour}
                        type="button"
                        disabled={loadingReschedule}
                        onClick={() => handleReschedule(selectedSlot, hour)}
                        style={{
                          minHeight: 42,
                          padding: '0.75rem 0.95rem',
                          borderRadius: 14,
                          border: '1px solid rgba(139,92,246,0.14)',
                          background: 'rgba(255,255,255,0.78)',
                          color: '#7c3aed',
                          fontWeight: 850,
                          cursor: loadingReschedule
                            ? 'not-allowed'
                            : 'pointer',
                        }}
                      >
                        {loadingReschedule ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          timeString
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  padding: '0 1.25rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModals}
                  style={secondaryButtonStyle}
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

function AdminEventModal({
  selectedEvent,
  loadingRespond,
  loadingCancel,
  formatTime,
  onClose,
  onApprove,
  onDecline,
  onCancel,
  onReschedule,
}: {
  selectedEvent: EventType;
  loadingRespond: boolean;
  loadingCancel: boolean;
  formatTime: (date: Date) => string;
  onClose: () => void;
  onApprove: () => void;
  onDecline: () => void;
  onCancel: () => void;
  onReschedule: () => void;
}) {
  return (
    <div style={overlayStyle}>
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="modal-dialog modal-dialog-centered"
      >
        <div style={modalCardStyle}>
          <div
            style={{
              padding: '2rem 1.25rem 1.5rem',
              background:
                'linear-gradient(135deg, #8b5cf6 0%, #6366f1 48%, #60a5fa 100%)',
              color: '#ffffff',
            }}
          >
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div>
                <span
                  style={{
                    display: 'inline-flex',
                    padding: '0.35rem 0.7rem',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.16)',
                    color: '#ffffff',
                    fontWeight: 850,
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.7rem',
                  }}
                >
                  Appointment
                </span>

                <h5 style={{ margin: 0, fontWeight: 950 }}>
                  {selectedEvent.title}
                </h5>
              </div>

              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>
          </div>

          <div style={{ padding: '1.25rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 22,
                background: 'linear-gradient(135deg, #faf7ff 0%, #eef7ff 100%)',
                border: '1px solid rgba(139,92,246,0.08)',
                boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
                display: 'grid',
                gap: '0.75rem',
                color: '#475569',
                fontWeight: 700,
              }}
            >
              <div>
                <FiUser /> <strong>User:</strong>{' '}
                {selectedEvent.userName ?? 'Unknown'}
              </div>

              <div>
                <FiCalendar /> <strong>Date:</strong>{' '}
                {selectedEvent.start.toLocaleDateString()}
              </div>

              <div>
                <FiClock /> <strong>Time:</strong>{' '}
                {formatTime(selectedEvent.start)} –{' '}
                {formatTime(selectedEvent.end)}
              </div>

              <div>
                <FiInfo /> <strong>Description:</strong>{' '}
                {selectedEvent.description || 'No description provided.'}
              </div>

              <div>
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    display: 'inline-flex',
                    padding: '0.25rem 0.55rem',
                    borderRadius: 999,
                    background: 'rgba(139,92,246,0.10)',
                    color: '#7c3aed',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    fontSize: '0.78rem',
                  }}
                >
                  {selectedEvent.status}
                </span>
              </div>
            </div>

            <div
              className="d-flex flex-wrap justify-content-between"
              style={{ gap: '0.75rem', marginTop: '1.25rem' }}
            >
              <button
                type="button"
                disabled={loadingRespond}
                onClick={onApprove}
                style={successButtonStyle}
              >
                {loadingRespond ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  'Approve'
                )}
              </button>

              <button
                type="button"
                disabled={loadingRespond}
                onClick={onDecline}
                style={dangerButtonStyle}
              >
                {loadingRespond ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  'Decline'
                )}
              </button>

              <button
                type="button"
                onClick={onReschedule}
                style={warningButtonStyle}
              >
                Reschedule
              </button>

              <button
                type="button"
                disabled={loadingCancel}
                onClick={onCancel}
                style={darkButtonStyle}
              >
                {loadingCancel ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  'Cancel'
                )}
              </button>

              <button type="button" onClick={onClose} style={secondaryButtonStyle}>
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 5000,
  background: 'rgba(15,23,42,0.56)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  overflowY: 'auto',
  padding: '1rem',
};

const modalCardStyle: React.CSSProperties = {
  borderRadius: 28,
  overflow: 'hidden',
  background: '#ffffff',
  border: 'none',
  boxShadow: '0 28px 80px rgba(15,23,42,0.22)',
};

const modalHeaderStyle: React.CSSProperties = {
  padding: '1.25rem 1.25rem 0.75rem',
  borderBottom: 'none',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
};

const modalPillStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.35rem 0.7rem',
  borderRadius: 999,
  background: 'rgba(139,92,246,0.10)',
  color: '#8b5cf6',
  fontWeight: 850,
  fontSize: '0.72rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '0.6rem',
};

const modalTitleStyle: React.CSSProperties = {
  color: '#111827',
  fontWeight: 900,
  margin: 0,
};

const baseButtonStyle: React.CSSProperties = {
  minHeight: 42,
  padding: '0.75rem 1rem',
  borderRadius: 14,
  fontWeight: 850,
  border: '1px solid transparent',
};

const successButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: 'rgba(220,252,231,0.95)',
  color: '#16a34a',
  border: '1px solid rgba(34,197,94,0.18)',
};

const dangerButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: 'rgba(254,242,242,0.95)',
  color: '#dc2626',
  border: '1px solid rgba(239,68,68,0.18)',
};

const warningButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: 'rgba(255,251,235,0.95)',
  color: '#d97706',
  border: '1px solid rgba(245,158,11,0.18)',
};

const darkButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: 'rgba(15,23,42,0.92)',
  color: '#ffffff',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  background: '#ffffff',
  color: '#475569',
  border: '1px solid rgba(148,163,184,0.24)',
};

{/*
'use client';

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo, Views } from 'react-big-calendar';
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
  userName?: string;
};

type ApiEvent = {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status?: string;
  user_name?: string;
};

const localizer = momentLocalizer(moment);

export default function FullDayScheduleCalendar() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [showRescheduleCalendar, setShowRescheduleCalendar] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  // loading states
  const [loadingRespond, setLoadingRespond] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingReschedule, setLoadingReschedule] = useState(false);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // -------------------------
  // Fetch events (admin)
  // -------------------------
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(
          'http://localhost:5000/api/appointments/admin/all-events',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);

        const data: ApiEvent[] = await res.json();
        const mapped: EventType[] = data.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          start: new Date(e.start_time),
          end: new Date(e.end_time),
          status: e.status ?? 'pending',
          userName: e.user_name,
        }));
        setEvents(mapped);
      } catch (err) {
        toast.error('❌ Failed to load events.');
        console.error(err);
      }
    })();
  }, [token]);

  // -------------------------
  // Approve / Decline
  // -------------------------
  const handleRespond = async (eventId: string, action: 'approve' | 'decline') => {
    if (!token) return;
    setLoadingRespond(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/admin/respond/${eventId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );
      if (!res.ok) throw new Error(`Respond failed: ${res.status}`);
      const { event }: { event: ApiEvent } = await res.json();

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: event.status } : e))
      );
      toast.success(`✅ Appointment ${action}d`);
      setShowEventModal(false);
    } catch (err) {
      toast.error(`❌ Failed to ${action} appointment.`);
      console.error(err);
    } finally {
      setLoadingRespond(false);
    }
  };

  // -------------------------
  // Cancel
  // -------------------------
  const handleCancel = async (eventId: string) => {
    if (!token) return;
    setLoadingCancel(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/admin/delete/${eventId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Cancel failed: ${res.status}`);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setShowEventModal(false);
      toast.info('ℹ️ Appointment canceled');
    } catch (err) {
      toast.error('❌ Failed to cancel appointment.');
      console.error(err);
    } finally {
      setLoadingCancel(false);
    }
  };

  // -------------------------
  // Reschedule
  // -------------------------
  const handleReschedule = async (date: Date, hour: number) => {
    if (!token || !selectedEvent) return;
    setLoadingReschedule(true);

    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/admin/update/${selectedEvent.id}`,
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
      toast.success('✅ Appointment rescheduled');
      setShowTimeModal(false);
      setShowRescheduleCalendar(false);
      setSelectedEvent(null);
    } catch (err) {
      toast.error('❌ Failed to reschedule appointment.');
      console.error(err);
    } finally {
      setLoadingReschedule(false);
    }
  };

  // -------------------------
  // Handlers
  // -------------------------
  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSelectSlot = (slot: SlotInfo) => {
    setSelectedSlot(new Date(slot.start));
    setShowTimeModal(true);
  };

  const handleCloseModals = () => {
    setShowEventModal(false);
    setShowRescheduleCalendar(false);
    setShowTimeModal(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  // -------------------------
  // Event style
  // -------------------------
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

  return (
    <div
      className="box p-3 shadow-sm rounded"
      style={{ background: 'linear-gradient(145deg, #f8f9ff, #eef1fc)' }}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <Calendar
        localizer={localizer}
        events={events}
        defaultView={Views.DAY}
        views={['day']}
        startAccessor="start"
        endAccessor="end"
        step={30}
        timeslots={2}
        min={new Date(new Date().setHours(10, 0))}
        max={new Date(new Date().setHours(19, 0))}
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
      />

      {showEventModal && selectedEvent && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedEvent.title}</h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <p><strong>User:</strong> {selectedEvent.userName ?? 'Unknown'}</p>
                <p><strong>Date:</strong> {selectedEvent.start.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {formatTime(selectedEvent.start)} – {formatTime(selectedEvent.end)}</p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
                <p><strong>Status:</strong> {selectedEvent.status}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success btn-sm" disabled={loadingRespond} onClick={() => handleRespond(selectedEvent.id, 'approve')}>
                  {loadingRespond ? <span className="spinner-border spinner-border-sm" /> : 'Approve'}
                </button>
                <button className="btn btn-danger btn-sm" disabled={loadingRespond} onClick={() => handleRespond(selectedEvent.id, 'decline')}>
                  {loadingRespond ? <span className="spinner-border spinner-border-sm" /> : 'Decline'}
                </button>
                <button className="btn btn-warning btn-sm" onClick={() => { setShowRescheduleCalendar(true); setShowEventModal(false); }}>
                  Reschedule
                </button>
                <button className="btn btn-dark btn-sm" disabled={loadingCancel} onClick={() => handleCancel(selectedEvent.id)}>
                  {loadingCancel ? <span className="spinner-border spinner-border-sm" /> : 'Cancel'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleCloseModals}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  onSelectSlot={(slotInfo: SlotInfo) => {
                    const newDate = new Date(slotInfo.start);
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

      {showTimeModal && selectedSlot && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reschedule Appointment – {selectedSlot.toLocaleDateString()}</h5>
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
                        disabled={loadingReschedule}
                        onClick={() => handleReschedule(selectedSlot, hour)}
                      >
                        {loadingReschedule ? <span className="spinner-border spinner-border-sm" /> : timeString}
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

*/}
