
// components/admin/calendar/CalendarComponent.tsx
'use client';

import { useState } from 'react';
import {
  Calendar,
  momentLocalizer,
  SlotInfo,
  Views,
  View,
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
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlot(new Date(slotInfo.start));
    if (currentView === 'month') {
      setShowSlotModal(true);
    }
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
      
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        defaultView={Views.MONTH}
        view={currentView}
        onView={(view) => setCurrentView(view)}
        selectable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        popup
        style={{ height: '80vh' }}
        step={currentView === 'week' ? 30 : undefined}
        timeslots={currentView === 'week' ? 2 : undefined}
        min={currentView === 'week' ? new Date(new Date().setHours(10, 0, 0)) : undefined}
        max={currentView === 'week' ? new Date(new Date().setHours(19, 0, 0)) : undefined}
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
                <p><strong>Date:</strong> {selectedEvent.start.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedEvent.start.toLocaleTimeString()} – {selectedEvent.end.toLocaleTimeString()}</p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary btn-sm" onClick={handleCloseModals}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slot Modal */}
      {showSlotModal && selectedSlot && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule Appointment</h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <p><strong>Date Selected:</strong> {selectedSlot.toLocaleDateString()}</p>
                <p>This date is available. Would you like to select a time?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success btn-sm" onClick={() => {
                  setShowSlotModal(false);
                  setShowTimeModal(true);
                }}>Select a Time</button>
                <button className="btn btn-secondary btn-sm" onClick={handleCloseModals}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Picker Modal */}
      {showTimeModal && selectedSlot && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Time – {selectedSlot.toLocaleDateString()}</h5>
                <button className="btn-close" onClick={handleCloseModals}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-wrap gap-2">
                  {Array.from({ length: 10 }, (_, i) => {
                    const hour = 10 + i;
                    const timeString = new Date(0, 0, 0, hour).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    });
                    return (
                      <button key={hour} className="btn btn-outline-primary btn-sm">
                        {timeString}
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