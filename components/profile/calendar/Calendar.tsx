// components/profile/calendar/CalendarComponent.tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
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

// ----------------------------
// Types
// ----------------------------
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

type Trainer = {
  id: string;
  full_name?: string;
  email?: string;
  profile_image_url?: string;
};

type TrainerOption = {
  value: string;
  label: ReactNode;
  data: Trainer;
};

const localizer = momentLocalizer(moment);

type Props = {
  token: string | null;
};

// ----------------------------
// Component
// ----------------------------
export default function CalendarComponent({ token }: Props) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [rescheduleMode, setRescheduleMode] = useState(false);

  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Trainers
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  // Loading states
  const [loadingBook, setLoadingBook] = useState(false);
  const [loadingReschedule, setLoadingReschedule] = useState(false);
  const [loadingTrainers, setLoadingTrainers] = useState(false);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // ----------------------------
  // Fetch events
  // ----------------------------
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

  // ----------------------------
  // Fetch trainers
  // ----------------------------
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoadingTrainers(true);
      try {
        const res = await fetch('http://localhost:5000/api/users/admins', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Trainer fetch failed: ${res.status}`);
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

  // ----------------------------
  // Book
  // ----------------------------
  const handleBookEvent = async (date: Date, hour: number) => {
    if (!token) return;
    if (!selectedTrainer) {
      toast.warn('⚠️ Please select a trainer before booking.');
      return;
    }

    setLoadingBook(true);
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

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
          title: `Workout with ${selectedTrainer.full_name || 'Trainer'}`,
          event_type: 'workout',
          description: `Session booked with ${selectedTrainer.full_name || selectedTrainer.email}`,
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
        },
      ]);

      toast.success('✅ Appointment booked!');
      setShowTimeModal(false);
      setSelectedTrainer(null);
    } catch (err) {
      toast.error('❌ Failed to book appointment.');
      console.error(err);
    } finally {
      setLoadingBook(false);
    }
  };

  // ----------------------------
  // Reschedule
  // ----------------------------
  const handleReschedule = async (date: Date, hour: number) => {
    if (!token) return;
    setLoadingReschedule(true);

    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    if (start < new Date()) {
      toast.warn('⚠️ You cannot reschedule to a past date.');
      setLoadingReschedule(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/appointments/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        }),
      });

      if (!res.ok) throw new Error(`Reschedule failed: ${res.status}`);

      toast.success('✅ Appointment rescheduled!');
      setShowTimeModal(false);
      setRescheduleMode(false);
    } catch (err) {
      toast.error('❌ Failed to reschedule appointment.');
      console.error(err);
    } finally {
      setLoadingReschedule(false);
    }
  };

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const selectedDate = new Date(slotInfo.start);
    if (selectedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      toast.warn('⚠️ You cannot select a past date.');
      return;
    }
    setSelectedSlot(selectedDate);
    if (currentView === 'month') setShowTimeModal(true);
  };

  const handleCloseModals = () => {
    setShowTimeModal(false);
    setSelectedSlot(null);
    setSelectedTrainer(null);
  };

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

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="box p-3 shadow-sm rounded">
      <ToastContainer position="top-right" autoClose={3000} />

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        defaultView={Views.MONTH}
        view={currentView}
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        onView={(view) => setCurrentView(view)}
        selectable
        onSelectSlot={handleSelectSlot}
        style={{ height: '80vh' }}
        eventPropGetter={eventStyleGetter}
        formats={{
          timeGutterFormat: (date: Date) => formatTime(date),
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${formatTime(start)} – ${formatTime(end)}`,
        }}
        min={new Date(2025, 0, 1, 10, 0)}
        max={new Date(2025, 0, 1, 19, 0)}
      />

      {/* Time Picker Modal */}
      {showTimeModal && selectedSlot && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {rescheduleMode
                    ? 'Reschedule Appointment'
                    : `Select Trainer & Time – ${selectedSlot.toLocaleDateString()}`}
                </h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>

              <div className="modal-body">
                {/* Trainer Dropdown */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Select Trainer</label>
                  {loadingTrainers ? (
                    <div className="text-muted small">Loading trainers…</div>
                  ) : (
                    <Select<TrainerOption, false>
                      options={trainers.map((t) => ({
                        value: t.id,
                        label: (
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={t.profile_image_url || '/default-avatar.png'}
                              alt={t.full_name || t.email}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />
                            <span>{t.full_name || t.email}</span>
                          </div>
                        ),
                        data: t,
                      }))}
                      value={
                        selectedTrainer
                          ? {
                              value: selectedTrainer.id,
                              label: (
                                <div className="d-flex align-items-center gap-2">
                                  <img
                                    src={
                                      selectedTrainer.profile_image_url ||
                                      '/default-avatar.png'
                                    }
                                    alt={
                                      selectedTrainer.full_name ||
                                      selectedTrainer.email
                                    }
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                    }}
                                  />
                                  <span>
                                    {selectedTrainer.full_name ||
                                      selectedTrainer.email}
                                  </span>
                                </div>
                              ),
                              data: selectedTrainer,
                            }
                          : null
                      }
                      onChange={(option) => setSelectedTrainer(option?.data ?? null)}
                      placeholder="Choose a trainer…"
                      classNamePrefix="custom-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          background:
                            'linear-gradient(234deg, #fdfcff, #e6e9f5, #ffffff)',
                          borderRadius: '0.5rem',
                          padding: '2px',
                        }),
                        menu: (base) => ({
                          ...base,
                          background:
                            'linear-gradient(234deg, #fdfcff, #e6e9f5, #ffffff)',
                        }),
                      }}
                    />
                  )}
                </div>

                {/* Time Buttons */}
                <div className="d-flex flex-wrap gap-2">
                  {Array.from({ length: 9 }, (_, i) => {
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


/*

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
  const [currentDate, setCurrentDate] = useState(new Date()); // ✅ controls pagination

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

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        defaultView={Views.MONTH}
        view={currentView}
        date={currentDate}                     // ✅ controlled date
        onNavigate={(date) => setCurrentDate(date)} // ✅ pagination
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
        min={new Date(2025, 0, 1, 10, 0)}
        max={new Date(2025, 0, 1, 19, 0)}
      />

    
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
                  min={new Date()}
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
                  {Array.from({ length: 9 }, (_, i) => {
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



*/