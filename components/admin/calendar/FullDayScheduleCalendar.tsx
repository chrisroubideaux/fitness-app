// components/admin/calendar/FullDayScheduleCalendar.tsx
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
    title: 'Yoga with Lena',
    start: new Date(new Date().setHours(10, 0)),
    end: new Date(new Date().setHours(11, 0)),
    description: 'Morning stretch and mobility.',
  },
  {
    title: 'Strength Training',
    start: new Date(new Date().setHours(13, 0)),
    end: new Date(new Date().setHours(14, 30)),
    description: 'Focus on legs and core.',
  },
];

export default function FullDayScheduleCalendar() {
  const [events] = useState<EventType[]>(initialEvents);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSelectSlot = (slot: SlotInfo) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
  };

  return (
    <div className="box p-3 shadow-sm rounded" style={{ background: 'linear-gradient(145deg, #f8f9ff, #eef1fc)' }}>
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
      />

      {showModal && selectedSlot && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Selected Time Slot</h5>
                <button className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Start:</strong> {new Date(selectedSlot.start).toLocaleTimeString()}</p>
                <p><strong>End:</strong> {new Date(selectedSlot.end).toLocaleTimeString()}</p>
                <p>You can add logic to confirm or create an event here.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={() => alert('Booking logic TBD')}>Confirm</button>
                <button className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
