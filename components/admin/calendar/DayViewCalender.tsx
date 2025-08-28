
// components/admin/calendar/DayViewCalendar.tsx
'use client';

import { useState } from 'react';
import {
  Calendar,
  momentLocalizer,
  SlotInfo,
  Views,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

type EventType = {
  title: string;
  start: Date;
  end: Date;
  description?: string;
};

const localizer = momentLocalizer(moment);

const sampleEvents: EventType[] = [
  {
    title: 'One-on-One with Lena',
    start: new Date(new Date().setHours(11, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0)),
    description: 'Fitness check-in and form correction',
  },
  {
    title: 'HIIT Group Workout',
    start: new Date(new Date().setHours(14, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0)),
    description: 'High intensity interval training',
  },
];

export default function DayViewCalendar() {
  const [events] = useState<EventType[]>(sampleEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);

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
    <div className="box p-3 shadow-sm rounded" style={{ background: 'linear-gradient(145deg, #f8f9ff, #eef1fc)' }}>
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
      />

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedEvent.title}</h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <p><strong>Time:</strong> {selectedEvent.start.toLocaleTimeString()} – {selectedEvent.end.toLocaleTimeString()}</p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={handleCloseModals}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty Slot Modal */}
      {showSlotModal && selectedSlot && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Available Time Slot</h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <p><strong>Time:</strong> {new Date(selectedSlot.start).toLocaleTimeString()} – {new Date(selectedSlot.end).toLocaleTimeString()}</p>
                <p>You can add logic to book this time slot.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success btn-sm" onClick={() => alert('Booking logic TBD')}>Book</button>
                <button className="btn btn-secondary btn-sm" onClick={handleCloseModals}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
