// app/appointments-test/page.tsx
// app/appointments-test/page.tsx
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAppointments } from '@/store/slices/appointmentsSlice';
import BookAppointmentTest from './BookAppointmentTest';

export default function AppointmentsTestPage() {
  const dispatch = useAppDispatch();
  const { list: appointments, loading, error } = useAppSelector(
    (state) => state.appointments
  );
  const { token } = useAppSelector((state) => state.user);

  // ---------------------------------------------------------
  // 🔐 Sync Redux token → localStorage before any API request
  // ---------------------------------------------------------
  useEffect(() => {
    if (token) {
      const existing = localStorage.getItem('authToken');
      if (!existing || existing !== token) {
        localStorage.setItem('authToken', token);
        console.log('🔑 Synced token from Redux → localStorage');
      }
      dispatch(fetchAppointments());
    } else {
      // If Redux lost the token, try recovering from localStorage
      const stored = localStorage.getItem('authToken');
      if (stored) {
        localStorage.setItem('authToken', stored);
        console.log('♻️ Rehydrated token from localStorage');
        dispatch(fetchAppointments());
      }
    }
  }, [dispatch, token]);

  // ---------------------------------------------------------
  // 🧩 Render UI
  // ---------------------------------------------------------
  return (
    <div className="container py-5">
      <h2 className="mb-4">🧭 Appointments Redux Test</h2>

      {!token && (
        <div className="alert alert-warning">
          ⚠️ No token found — please log in first.
        </div>
      )}

      <BookAppointmentTest />

      {loading && <p>Loading your appointments...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && appointments.length > 0 && (
        <div className="list-group shadow-sm mt-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="list-group-item">
              <h5 className="mb-1">{appt.title}</h5>
              <p className="small mb-1 text-muted">
                {appt.start_time_display} → {appt.end_time_display}
              </p>
              <span className="badge bg-info text-dark">{appt.event_type}</span>
              <span className="badge bg-secondary ms-2">{appt.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}





{/*
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAppointments } from '@/store/slices/appointmentsSlice';

export default function AppointmentsTestPage() {
  const dispatch = useAppDispatch();
  const { list: appointments, loading, error } = useAppSelector(
    (state) => state.appointments
  );
  const { token } = useAppSelector((state) => state.user);

  // 🔹 Trigger fetch on mount
  useEffect(() => {
    if (token) {
      console.log('🔹 Fetching appointments...');
      dispatch(fetchAppointments());
    } else {
      console.warn('⚠️ No auth token found');
    }
  }, [dispatch, token]);

  // 🔹 Render UI
  return (
    <div className="container py-5">
      <h2 className="mb-4">🧭 Appointments Redux Test</h2>

      {!token ? (
        <div className="alert alert-warning">
          No token found — please log in first.
        </div>
      ) : loading ? (
        <p>Loading your appointments...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : appointments.length > 0 ? (
        <div className="list-group shadow-sm">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <h5 className="mb-1">{appt.title}</h5>
                <p className="mb-0 text-muted small">
                  {appt.start_time_display} → {appt.end_time_display}
                </p>
                <span className="badge bg-info mt-1">{appt.event_type}</span>
              </div>
              <span
                className={`badge ${
                  appt.status === 'approved'
                    ? 'bg-success'
                    : appt.status === 'declined'
                    ? 'bg-danger'
                    : 'bg-secondary'
                }`}
              >
                {appt.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">No appointments found.</p>
      )}
    </div>
  );
}

*/}
