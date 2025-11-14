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
