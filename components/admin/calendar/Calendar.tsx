// components/admin/calendar/CalendarComponent.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  momentLocalizer,
  SlotInfo,
  Views,
  View,
  DateRange,
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
  userName?: string;
};

type ApiEvent = {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status?: string;
  userName?: string;
};

const localizer = momentLocalizer(moment);

type Props = {
  token: string | null; // Admin token
};

export default function AdminCalendarComponent({ token }: Props) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [showRescheduleCalendar, setShowRescheduleCalendar] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  // Loading states
  const [loadingRespond, setLoadingRespond] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingReschedule, setLoadingReschedule] = useState(false);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // ---------------------
  // Fetch events for visible range
  // ---------------------
  const fetchEvents = async (start: Date, end: Date) => {
    if (!token) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/admin/all-events?start=${start.toISOString()}&end=${end.toISOString()}`,
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
        userName: e.userName,
      }));

      setEvents(mapped);
    } catch (err) {
      toast.error('❌ Failed to load events.');
      console.error(err);
    }
  };

  // Initial load → current month
  useEffect(() => {
    if (!token) return;
    const start = moment().startOf('month').toDate();
    const end = moment().endOf('month').toDate();
    fetchEvents(start, end);
  }, [token]);

  // ---------------------
  // Approve / Decline
  // ---------------------
  const handleRespond = async (eventId: string, action: 'approve' | 'decline') => {
    if (!token) return;
    setLoadingRespond(true);

    try {
      const res = await fetch(`http://localhost:5000/api/appointments/admin/respond/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error(`Respond failed: ${res.status}`);
      const { event }: { event: ApiEvent } = await res.json();

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: event.status } : e))
      );

      toast.success(`✅ Appointment ${action}d. User notified by email.`);
      setShowEventModal(false);
    } catch (err) {
      toast.error(`❌ Failed to ${action} appointment.`);
      console.error(err);
    } finally {
      setLoadingRespond(false);
    }
  };

  // ---------------------
  // Cancel
  // ---------------------
  const handleCancelEvent = async (eventId: string) => {
    if (!token) return;
    setLoadingCancel(true);

    try {
      const res = await fetch(`http://localhost:5000/api/appointments/admin/delete/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Cancel failed: ${res.status}`);

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setShowEventModal(false);

      toast.info('ℹ️ Appointment canceled. User notified by email.');
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

      toast.success('✅ Appointment rescheduled. User notified by email.');
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
    setSelectedSlot(new Date(slotInfo.start));
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
        onView={(view) => setCurrentView(view)}
        onRangeChange={(range: DateRange | Date[] | { start: Date; end: Date }) => {
          if (Array.isArray(range)) {
            fetchEvents(range[0], range[range.length - 1]);
          } else if ('start' in range && 'end' in range) {
            fetchEvents(range.start, range.end);
          }
        }}
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
        // ✅ Limit visible time range to 10 AM – 7 PM
        min={new Date(2025, 0, 1, 10, 0)}
        max={new Date(2025, 0, 1, 19, 0)}
      />

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedEvent.title}</h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>User:</strong> {selectedEvent.userName ?? 'Unknown'}
                </p>
                <p>
                  <strong>Date:</strong> {selectedEvent.start.toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong>{' '}
                  {formatTime(selectedEvent.start)} – {formatTime(selectedEvent.end)}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
                <p>
                  <strong>Status:</strong> {selectedEvent.status}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success btn-sm"
                  disabled={loadingRespond}
                  onClick={() => handleRespond(selectedEvent.id, 'approve')}
                >
                  {loadingRespond ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    'Approve'
                  )}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={loadingRespond}
                  onClick={() => handleRespond(selectedEvent.id, 'decline')}
                >
                  {loadingRespond ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    'Decline'
                  )}
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
                <button
                  className="btn btn-dark btn-sm"
                  disabled={loadingCancel}
                  onClick={() => handleCancelEvent(selectedEvent.id)}
                >
                  {loadingCancel ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    'Cancel'
                  )}
                </button>
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

      {/* Reschedule Calendar Modal */}
      {showRescheduleCalendar && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
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

      {/* Time Picker Modal */}
      {showTimeModal && selectedSlot && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {rescheduleMode
                    ? 'Reschedule Appointment'
                    : `Select Time – ${selectedSlot.toLocaleDateString()}`}
                </h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-wrap gap-2">
                  {Array.from({ length: 9 }, (_, i) => {
                    const hour = 10 + i; // 10 AM to 6 PM
                    const timeString = formatTime(new Date(0, 0, 0, hour));
                    return (
                      <button
                        key={hour}
                        className="btn btn-outline-primary btn-sm"
                        disabled={loadingReschedule}
                        onClick={() => handleReschedule(selectedSlot, hour)}
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
              <div className="modal-footer">
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
    </div>
  );
}
