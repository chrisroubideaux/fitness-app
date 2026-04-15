// components/profile/calendar/Calendar.tsx
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

type Props = {
  token: string | null;
};

const localizer = momentLocalizer(moment);

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
  const [isMobile, setIsMobile] = useState(false);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const getImageUrl = (url?: string | null) => {
    if (!url || url.trim() === '') return '/default-avatar.png';

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    if (url.startsWith('/')) {
      return `http://localhost:5000${url}`;
    }

    return `http://localhost:5000/${url}`;
  };

  const createLocalDate = (year: number, month: number, day: number) =>
    new Date(year, month - 1, day);

  const calculateEaster = (year: number) => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month - 1, day);
  };

  const getNthWeekdayOfMonth = (
    year: number,
    monthIndex: number,
    weekday: number,
    nth: number
  ) => {
    const firstDay = new Date(year, monthIndex, 1);
    const firstWeekdayOffset = (7 + weekday - firstDay.getDay()) % 7;
    const day = 1 + firstWeekdayOffset + (nth - 1) * 7;
    return new Date(year, monthIndex, day);
  };

  const getLastWeekdayOfMonth = (
    year: number,
    monthIndex: number,
    weekday: number
  ) => {
    const lastDay = new Date(year, monthIndex + 1, 0);
    const offset = (7 + lastDay.getDay() - weekday) % 7;
    return new Date(year, monthIndex, lastDay.getDate() - offset);
  };

  const toDateKey = (date: Date) => date.toDateString();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const year = new Date().getFullYear();

        const res = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${year}/US`
        );
        const data: Holiday[] = await res.json();

        const official: EventType[] = data.map((h) => {
          const [y, m, d] = h.date.split('-').map(Number);
          const localDate = new Date(y, m - 1, d);

          return {
            id: `holiday-${h.date}-${h.localName.replace(/\s+/g, '-')}`,
            title: `🎉 ${h.localName}`,
            start: localDate,
            end: localDate,
            description: h.name,
            isHoliday: true,
          };
        });

        const easter = calculateEaster(year);
        const goodFriday = new Date(easter);
        goodFriday.setDate(easter.getDate() - 2);

        const mothersDay = getNthWeekdayOfMonth(year, 4, 0, 2); // May, 2nd Sunday
        const fathersDay = getNthWeekdayOfMonth(year, 5, 0, 3); // June, 3rd Sunday
        const thanksgiving = getNthWeekdayOfMonth(year, 10, 4, 4); // Nov, 4th Thursday
        const memorialDay = getLastWeekdayOfMonth(year, 4, 1); // May, last Monday

        const customHolidaySeeds = [
          {
            id: `custom-new-years-day-${year}`,
            title: `🎊 New Year's Day`,
            start: createLocalDate(year, 1, 1),
            description: "New Year's Day",
          },
          {
            id: `custom-valentines-day-${year}`,
            title: `🎊 Valentine's Day`,
            start: createLocalDate(year, 2, 14),
            description: "Valentine's Day",
          },
          {
            id: `custom-st-patricks-day-${year}`,
            title: `🎊 St. Patrick's Day`,
            start: createLocalDate(year, 3, 17),
            description: "St. Patrick's Day",
          },
          {
            id: `custom-good-friday-${year}`,
            title: `🎊 Good Friday`,
            start: goodFriday,
            description: 'Good Friday',
          },
          {
            id: `custom-easter-${year}`,
            title: `🎊 Easter`,
            start: easter,
            description: 'Easter Sunday',
          },
          {
            id: `custom-mothers-day-${year}`,
            title: `🎊 Mother's Day`,
            start: mothersDay,
            description: "Mother's Day",
          },
          {
            id: `custom-memorial-day-${year}`,
            title: `🎊 Memorial Day`,
            start: memorialDay,
            description: 'Memorial Day',
          },
          {
            id: `custom-fathers-day-${year}`,
            title: `🎊 Father's Day`,
            start: fathersDay,
            description: "Father's Day",
          },
          {
            id: `custom-independence-day-${year}`,
            title: `🎊 Independence Day`,
            start: createLocalDate(year, 7, 4),
            description: 'Independence Day',
          },
          {
            id: `custom-halloween-${year}`,
            title: `🎊 Halloween`,
            start: createLocalDate(year, 10, 31),
            description: 'Halloween',
          },
          {
            id: `custom-thanksgiving-${year}`,
            title: `🎊 Thanksgiving`,
            start: thanksgiving,
            description: 'Thanksgiving',
          },
          {
            id: `custom-christmas-eve-${year}`,
            title: `🎊 Christmas Eve`,
            start: createLocalDate(year, 12, 24),
            description: 'Christmas Eve',
          },
          {
            id: `custom-christmas-day-${year}`,
            title: `🎊 Christmas Day`,
            start: createLocalDate(year, 12, 25),
            description: 'Christmas Day',
          },
          {
            id: `custom-new-years-eve-${year}`,
            title: `🎊 New Year's Eve`,
            start: createLocalDate(year, 12, 31),
            description: "New Year's Eve",
          },
        ];

        const officialDateKeys = new Set(official.map((h) => toDateKey(h.start)));

        const custom: EventType[] = customHolidaySeeds
          .filter((h) => !officialDateKeys.has(toDateKey(h.start)))
          .map((h) => ({
            id: h.id,
            title: h.title,
            start: h.start,
            end: h.start,
            description: h.description,
            isHoliday: true,
          }));

        setHolidays([...official, ...custom]);
      } catch (err) {
        console.warn('⚠️ Failed to fetch holidays', err);
      }
    })();
  }, []);

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

  const eventStyleGetter = (event: EventType) => {
    if (event.isHoliday) {
      return {
        style: {
          background: 'linear-gradient(135deg,#eef4ff,#ede9fe)',
          color: '#6d28d9',
          border: '1px solid rgba(139,92,246,0.18)',
          borderRadius: '10px',
          fontWeight: 700,
          opacity: 0.95,
        },
      };
    }

    let background = 'linear-gradient(135deg,#cbd5e1,#e2e8f0)';

    if (event.status === 'approved') {
      background = 'linear-gradient(135deg,#22c55e,#16a34a)';
    }
    if (event.status === 'pending') {
      background = 'linear-gradient(135deg,#8b5cf6,#a855f7)';
    }
    if (event.status === 'rescheduled') {
      background = 'linear-gradient(135deg,#f59e0b,#fb923c)';
    }
    if (event.status === 'declined') {
      background = 'linear-gradient(135deg,#ef4444,#fb7185)';
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

  const handleCloseModals = () => {
    setShowTimeModal(false);
    setShowEventModal(false);
    setSelectedTrainer(null);
    setSelectedEvent(null);
    setRescheduleMode(false);
  };

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '100%',
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
        <div
          className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center"
          style={{ gap: '1rem', marginBottom: '1.25rem' }}
        >
          <div>
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
              Schedule
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
              Book your trainer sessions
            </h2>

            <p
              style={{
                margin: '0.55rem 0 0',
                color: '#64748b',
                lineHeight: 1.7,
                maxWidth: 720,
              }}
            >
              Select an open day, choose a trainer, and schedule or manage your
              upcoming workout appointments.
            </p>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            borderRadius: 30,
            overflow: isMobile ? 'auto' : 'hidden',
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
              height: isMobile ? 640 : '78vh',
            }}
          >
            <Calendar
              localizer={localizer}
              events={[...events, ...holidays]}
              startAccessor="start"
              endAccessor="end"
              selectable
              min={new Date()}
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
              style={{ height: '100%' }}
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
            Swipe horizontally to view the full calendar.
          </p>
        )}
      </div>

      {showTimeModal && selectedSlot && (
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
                background: 'linear-gradient(135deg, #faf7ff 0%, #eef7ff 100%)',
                boxShadow: '0 28px 80px rgba(15,23,42,0.22)',
              }}
            >
              <div
                className="modal-header border-0"
                style={{ padding: '1.25rem 1.25rem 0.75rem' }}
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
                    {rescheduleMode ? 'Reschedule' : 'Book Session'}
                  </span>

                  <h5
                    className="modal-title fw-bold"
                    style={{
                      color: '#111827',
                      margin: 0,
                    }}
                  >
                    {rescheduleMode
                      ? 'Reschedule Appointment'
                      : selectedSlot.toLocaleDateString()}
                  </h5>
                </div>

                <button className="btn-close" onClick={handleCloseModals} />
              </div>

              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    color: '#475569',
                    fontWeight: 800,
                  }}
                >
                  Select Trainer
                </label>

                <Select
                  options={trainers.map((t) => ({
                    value: t.id,
                    label: (
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={t.profile_image_url || '/default-avatar.png'}
                          alt={t.full_name || 'Trainer'}
                          onError={(e) => {
                            e.currentTarget.src = '/default-avatar.png';
                          }}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            background: '#f1f5f9',
                          }}
                        />
                        <span>{t.full_name || t.email || 'Trainer'}</span>
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

                <div
                  className="d-flex flex-wrap justify-content-center"
                  style={{ gap: '0.65rem', marginTop: '1.25rem' }}
                >
                  {Array.from({ length: 9 }, (_, i) => {
                    const hour = 10 + i;
                    const time = formatTime(new Date(0, 0, 0, hour));

                    return (
                      <button
                        key={hour}
                        type="button"
                        disabled={loadingBook || loadingReschedule}
                        onClick={() =>
                          rescheduleMode
                            ? handleReschedule(selectedSlot, hour)
                            : handleBookEvent(selectedSlot, hour)
                        }
                        style={{
                          minHeight: 42,
                          padding: '0.75rem 0.95rem',
                          borderRadius: 14,
                          border: '1px solid rgba(139,92,246,0.14)',
                          background: 'rgba(255,255,255,0.78)',
                          color: '#7c3aed',
                          fontWeight: 800,
                          cursor:
                            loadingBook || loadingReschedule
                              ? 'not-allowed'
                              : 'pointer',
                        }}
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

              <div
                className="modal-footer border-0"
                style={{ padding: '0 1.25rem 1.25rem' }}
              >
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
                    fontWeight: 800,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                className="text-center"
                style={{
                  padding: '2rem 1.25rem 1.5rem',
                  background:
                    'linear-gradient(135deg, #8b5cf6 0%, #6366f1 48%, #60a5fa 100%)',
                  color: '#ffffff',
                }}
              >
                <img
                  src={getImageUrl(selectedEvent.trainer?.profile_image_url)}
                  alt={selectedEvent.trainer?.full_name || 'Trainer'}
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png';
                  }}
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: '50%',
                    border: '4px solid rgba(255,255,255,0.85)',
                    objectFit: 'cover',
                    marginBottom: '0.85rem',
                    boxShadow: '0 14px 30px rgba(15,23,42,0.22)',
                    background: '#f1f5f9',
                  }}
                />

                <h5 className="fw-bold mb-0">
                  {selectedEvent.trainer?.full_name || 'Trainer'}
                </h5>

                {selectedEvent.trainer?.email && (
                  <small style={{ color: 'rgba(255,255,255,0.78)' }}>
                    {selectedEvent.trainer.email}
                  </small>
                )}
              </div>

              <div className="modal-body p-4">
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 22,
                    background: 'linear-gradient(135deg, #faf7ff 0%, #eef7ff 100%)',
                    border: '1px solid rgba(139,92,246,0.08)',
                    boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
                  }}
                >
                  <div className="mb-2">
                    📅 <strong>Date:</strong>{' '}
                    {selectedEvent.start.toLocaleDateString()}
                  </div>

                  <div className="mb-2">
                    ⏰ <strong>Time:</strong> {formatTime(selectedEvent.start)} –{' '}
                    {formatTime(selectedEvent.end)}
                  </div>

                  <div className="mb-2">
                    💬 <strong>Status:</strong>{' '}
                    <span
                      style={{
                        fontWeight: 900,
                        color:
                          selectedEvent.status === 'approved'
                            ? '#16a34a'
                            : selectedEvent.status === 'pending'
                            ? '#d97706'
                            : selectedEvent.status === 'rescheduled'
                            ? '#ea580c'
                            : '#dc2626',
                      }}
                    >
                      {selectedEvent.status?.toUpperCase()}
                    </span>
                  </div>

                  {selectedEvent.description && (
                    <div>
                      📝 <strong>Notes:</strong>
                      <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}
                </div>

                <div
                  className="d-flex flex-wrap justify-content-between"
                  style={{ gap: '0.75rem', marginTop: '1.25rem' }}
                >
                  <button
                    type="button"
                    disabled={loadingCancel}
                    onClick={() => handleCancelEvent(selectedEvent.id)}
                    style={{
                      minHeight: 42,
                      padding: '0.75rem 1rem',
                      borderRadius: 14,
                      border: '1px solid rgba(239,68,68,0.16)',
                      background: 'rgba(254,242,242,0.90)',
                      color: '#dc2626',
                      fontWeight: 850,
                    }}
                  >
                    {loadingCancel ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      'Cancel'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRescheduleMode(true);
                      setShowTimeModal(true);
                      setShowEventModal(false);
                    }}
                    style={{
                      minHeight: 42,
                      padding: '0.75rem 1rem',
                      borderRadius: 14,
                      border: '1px solid rgba(245,158,11,0.18)',
                      background: 'rgba(255,251,235,0.95)',
                      color: '#d97706',
                      fontWeight: 850,
                    }}
                  >
                    Reschedule
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
                    Close
                  </button>
                </div>
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
    <div className="p-3 shadow-lg rounded">
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
*/}