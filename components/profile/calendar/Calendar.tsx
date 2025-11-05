// components/profile/calendar/Calendar.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  momentLocalizer,
  SlotInfo,
  Views,
  View,
} from 'react-big-calendar';
import Select from 'react-select';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ---------- Types ----------
type EventType = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  status?: string;
  trainer?: {
    id: string;
    full_name?: string;
    email?: string;
    profile_image_url?: string;
  };
  isHoliday?: boolean;
};

type ApiEvent = {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status?: string;
  trainer?: {
    id: string;
    full_name?: string;
    email?: string;
    profile_image_url?: string;
  };
};

type Trainer = {
  id: string;
  full_name?: string;
  email?: string;
  profile_image_url?: string;
};

type Holiday = {
  date: string;
  localName: string;
  name: string;
};

const localizer = momentLocalizer(moment);

type Props = {
  token: string | null;
};

// ---------- Component ----------
export default function CalendarComponent({ token }: Props) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [holidays, setHolidays] = useState<EventType[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [rescheduleMode, setRescheduleMode] = useState(false);

  const [loadingBook, setLoadingBook] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingReschedule, setLoadingReschedule] = useState(false);
  const [loadingTrainers, setLoadingTrainers] = useState(false);

  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // ---------- Fetch Holidays ----------
  useEffect(() => {
    (async () => {
      try {
        const year = new Date().getFullYear();
        const res = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${year}/US`
        );
        const data: Holiday[] = await res.json();

        const official: EventType[] = data.map((h) => {
          const utcDate = new Date(h.date + 'T00:00:00Z');
          const localDate = new Date(
            utcDate.getUTCFullYear(),
            utcDate.getUTCMonth(),
            utcDate.getUTCDate()
          );

          return {
            id: `holiday-${h.date}`,
            title: `🎉 ${h.localName}`,
            start: localDate,
            end: localDate,
            description: h.name,
            isHoliday: true,
          };
        });

        const customDates = [
          { month: 2, day: 14, name: "Valentine's Day" },
          { month: 3, day: 17, name: "St. Patrick's Day" },
          { month: 10, day: 31, name: 'Halloween' },
          { month: 12, day: 24, name: 'Christmas Eve' },
          { month: 12, day: 31, name: "New Year's Eve" },
        ];

        const custom: EventType[] = customDates.map((d) => {
          const localDate = new Date(year, d.month - 1, d.day);
          return {
            id: `custom-${d.name.replace(/\s+/g, '-')}`,
            title: `🎊 ${d.name}`,
            start: localDate,
            end: localDate,
            description: d.name,
            isHoliday: true,
          };
        });

        setHolidays([...official, ...custom]);
      } catch (err) {
        console.warn('⚠️ Failed to fetch holidays', err);
      }
    })();
  }, []);

  // ---------- Fetch User Events ----------
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(
          'http://localhost:5000/api/appointments/my-events',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data: ApiEvent[] = await res.json();
        const mapped: EventType[] = data.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          start: new Date(e.start_time),
          end: new Date(e.end_time),
          status: e.status ?? 'pending',
          trainer: e.trainer,
        }));
        setEvents(mapped);
      } catch (err) {
        toast.error('❌ Failed to load events.');
        console.error(err);
      }
    })();
  }, [token]);

  // ---------- Fetch Trainers ----------
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoadingTrainers(true);
      try {
        const res = await fetch('http://localhost:5000/api/users/admins', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: Trainer[] = await res.json();
        setTrainers(data);
      } catch (err) {
        toast.error('❌ Failed to load trainers.');
        console.error(err);
      } finally {
        setLoadingTrainers(false);
      }
    })();
  }, [token]);

  // ---------- Booking ----------
  const handleBookEvent = async (date: Date, hour: number) => {
    if (!token || !selectedTrainer) {
      toast.warn('⚠️ Please select a trainer first.');
      return;
    }

    setLoadingBook(true);
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    try {
      const res = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Workout with ${selectedTrainer.full_name || 'Trainer'}`,
          event_type: 'workout',
          description: `Session with ${selectedTrainer.full_name}`,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          trainer_id: selectedTrainer.id,
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
          trainer: event.trainer,
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

  // ---------- Cancel ----------
  const handleCancelEvent = async (eventId: string) => {
    if (!token) return;
    setLoadingCancel(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/delete/${eventId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setShowEventModal(false);
      toast.info('ℹ️ Appointment canceled.');
    } catch (err) {
      toast.error('❌ Cancel failed.');
      console.error(err);
    } finally {
      setLoadingCancel(false);
    }
  };

  // ---------- Reschedule ----------
  const handleReschedule = async (date: Date, hour: number) => {
    if (!token || !selectedEvent) return;
    setLoadingReschedule(true);

    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

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
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id
            ? { ...e, start, end, status: 'rescheduled' }
            : e
        )
      );
      toast.success('✅ Appointment rescheduled!');
      setShowTimeModal(false);
      setRescheduleMode(false);
    } catch (err) {
      toast.error('❌ Reschedule failed.');
      console.error(err);
    } finally {
      setLoadingReschedule(false);
    }
  };

  // ---------- Slot Select ----------
  const handleSelectSlot = (slot: SlotInfo) => {
    const date = new Date(slot.start);

    if (date < new Date()) {
      toast.warn('⚠️ You cannot select a past date.');
      return;
    }

    const isHoliday = holidays.some(
      (h) => h.start.toDateString() === date.toDateString()
    );
    if (isHoliday) {
      toast.warn('🎉 It’s a holiday — bookings are disabled!');
      return;
    }

    setSelectedSlot(date);
    setShowTimeModal(true);
  };

  // ---------- Event Style ----------
  const eventStyleGetter = (event: EventType) => {
    if (event.isHoliday) {
      return {
        style: {
          background: 'linear-gradient(135deg,#f2e6ff,#e5ccff)',
          color: '#6c2db5',
          border: '1px solid #c79dff',
          borderRadius: '6px',
          opacity: 0.9,
        },
      };
    }

    let background = 'linear-gradient(135deg,#cfd9df,#e2ebf0)';
    if (event.status === 'approved')
      background = 'linear-gradient(135deg,#7ed957,#56ab2f)';
    if (event.status === 'pending')
      background = 'linear-gradient(135deg,#b14cff,#f58fff)';
    if (event.status === 'rescheduled')
      background = 'linear-gradient(135deg,#f6d365,#fda085)';
    if (event.status === 'declined')
      background = 'linear-gradient(135deg,#ff6a88,#ff99ac)';

    return {
      style: {
        background,
        color: '#fff',
        borderRadius: '6px',
        padding: '2px 4px',
      },
    };
  };

  // ---------- Close ----------
  const handleCloseModals = () => {
    setShowTimeModal(false);
    setShowEventModal(false);
    setSelectedTrainer(null);
    setSelectedEvent(null);
  };

  // ---------- Render ----------
  return (
    <div className="p-3 shadow-sm rounded">
      <ToastContainer position="top-right" autoClose={3000} />

      <Calendar
        localizer={localizer}
        events={[...events, ...holidays]}
        startAccessor="start"
        endAccessor="end"
        selectable
        min={new Date()} // ✅ Prevent selecting past dates
        onSelectSlot={handleSelectSlot}
        onSelectEvent={(event: EventType) => {
          if (!event.isHoliday) {
            setSelectedEvent(event);
            setShowEventModal(true);
          }
        }}
        view={currentView}
        date={currentDate}
        onView={setCurrentView}
        onNavigate={setCurrentDate}
        eventPropGetter={eventStyleGetter}
        style={{ height: '80vh' }}
      />

      {/* ---------- Time Picker Modal ---------- */}
      {showTimeModal && selectedSlot && (
        <div
          className="modal fade show d-block"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header border-0">
                <h5
                  className="modal-title fw-bold"
                  style={{
                    background: 'linear-gradient(90deg,#b14cff,#f58fff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {rescheduleMode
                    ? 'Reschedule Appointment'
                    : `Book Trainer – ${selectedSlot.toLocaleDateString()}`}
                </h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>

              <div className="modal-body">
                <label className="form-label fw-semibold">Select Trainer</label>
                <Select
                  options={trainers.map((t) => ({
                    value: t.id,
                    label: (
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={t.profile_image_url || '/default-avatar.png'}
                          alt={t.full_name || 'Trainer'}
                          style={{ width: 28, height: 28, borderRadius: '50%' }}
                        />
                        <span>{t.full_name || t.email}</span>
                      </div>
                    ),
                    data: t,
                  }))}
                  onChange={(option: { data?: Trainer } | null) =>
                    setSelectedTrainer(option?.data ?? null)
                  }
                  isLoading={loadingTrainers}
                  placeholder="Choose a trainer…"
                />

                <div className="d-flex flex-wrap gap-2 justify-content-center mt-3">
                  {Array.from({ length: 9 }, (_, i) => {
                    const hour = 10 + i;
                    const time = formatTime(new Date(0, 0, 0, hour));
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
                        {loadingBook || loadingReschedule ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          time
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCloseModals}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Event Details Modal (Modernized) ---------- */}
      {showEventModal && selectedEvent && (
        <div
          className="modal fade show d-block"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '20px',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                className="text-center p-4"
                style={{
                  background: 'linear-gradient(135deg,#b14cff,#f58fff)',
                  color: 'white',
                }}
              >
                <img
                  src={
                    selectedEvent.trainer?.profile_image_url ||
                    '/default-avatar.png'
                  }
                  alt={selectedEvent.trainer?.full_name || 'Trainer'}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    border: '3px solid white',
                    objectFit: 'cover',
                    marginBottom: '12px',
                  }}
                />
                <h5 className="fw-bold mb-0">
                  {selectedEvent.trainer?.full_name || 'Trainer'}
                </h5>
                {selectedEvent.trainer?.email && (
                  <small className="text-light">
                    {selectedEvent.trainer.email}
                  </small>
                )}
              </div>

              {/* Body */}
              <div className="modal-body p-4">
                <div
                  className="p-3 rounded-4 mb-3"
                  style={{
                    background: 'linear-gradient(135deg,#f8f3ff,#fff9ff)',
                    boxShadow: '0 2px 10px rgba(177, 76, 255, 0.1)',
                  }}
                >
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-2">📅</span>
                    <strong>Date:</strong>&nbsp;
                    <span>{selectedEvent.start.toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-2">⏰</span>
                    <strong>Time:</strong>&nbsp;
                    <span>
                      {formatTime(selectedEvent.start)} –{' '}
                      {formatTime(selectedEvent.end)}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-2">💬</span>
                    <strong>Status:</strong>&ensp;
                    <span
                      style={{
                        color:
                          selectedEvent.status === 'approved'
                            ? '#2ecc71'
                            : selectedEvent.status === 'pending'
                            ? '#f39c12'
                            : selectedEvent.status === 'rescheduled'
                            ? '#e67e22'
                            : '#e74c3c',
                      }}
                    >
                      {selectedEvent.status?.toUpperCase()}
                    </span>
                  </div>

                  {selectedEvent.description && (
                    <div className="d-flex align-items-start">
                      <span className="me-2 mt-1">📝</span>
                      <div>
                        <strong>Notes:</strong>
                        <p className="mb-0">{selectedEvent.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <button
                    className="btn btn-danger btn-sm px-3"
                    disabled={loadingCancel}
                    onClick={() => handleCancelEvent(selectedEvent.id)}
                  >
                    {loadingCancel ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <>
                        ❌ Cancel
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-warning btn-sm px-3"
                    onClick={() => {
                      setRescheduleMode(true);
                      setShowTimeModal(true);
                      setShowEventModal(false);
                    }}
                  >
                    🔄 Reschedule
                  </button>

                  <button
                    className="btn btn-secondary btn-sm px-3"
                    onClick={handleCloseModals}
                  >
                    Close
                  </button>
                </div>
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