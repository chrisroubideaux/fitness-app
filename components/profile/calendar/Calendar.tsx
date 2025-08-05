// Calendar component
'use client';

import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
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
  const [showModal, setShowModal] = useState(false);

  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };
  
  return (
    <div className="calendar-container p-3">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '80vh' }}
        onSelectEvent={handleSelectEvent}
        popup
      />

      {/* Modal using Bootstrap 5 markup */}
      {showModal && selectedEvent && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedEvent.title}</h5>
                <button type="button" className="btn-close" onClick={handleClose}></button>
              </div>
              <div className="modal-body">
                <p><strong>Date:</strong> {selectedEvent.start.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedEvent.start.toLocaleTimeString()} – {selectedEvent.end.toLocaleTimeString()}</p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={() => alert('Cancel logic TBD')}>Cancel</button>
                <button className="btn btn-secondary" onClick={() => alert('Reschedule logic TBD')}>Reschedule</button>
                <button className="btn btn-primary" onClick={handleClose}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
