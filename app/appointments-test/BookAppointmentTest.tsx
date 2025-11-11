// app/appointments-test/BookAppointmentTest.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAppointments } from '@/store/slices/appointmentsSlice';

interface Trainer {
  id: string;
  full_name?: string;
  email?: string;
  profile_image_url?: string;
}

export default function BookTrainerSimpleTest() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.user);

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // -------------------------------------------------
  // ✅ Fetch trainers once Redux token is available
  // -------------------------------------------------
  useEffect(() => {
    if (!token) return; // Wait until token is loaded from redux-persist

    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/admins', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Trainer[] = await res.json();
        setTrainers(data);
      } catch (err) {
        console.error('❌ Failed to fetch trainers', err);
        setMessage('❌ Could not load trainers.');
      }
    })();
  }, [token]);

  // -------------------------------------------------
  // ✅ Submit new booking
  // -------------------------------------------------
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMessage('❌ Please log in first.');
      return;
    }
    if (!selectedTrainer || !date || !time) {
      setMessage('⚠️ Please fill all fields.');
      return;
    }

    setLoading(true);
    setMessage(null);

    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    try {
      const res = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Workout with Trainer',
          description: 'Session with trainer',
          event_type: 'workout',
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          admin_id: selectedTrainer,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Appointment booked successfully!');
        dispatch(fetchAppointments());
      } else {
        setMessage(`❌ ${data.error || data.message || 'Booking failed'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Network error.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // ✅ Render
  // -------------------------------------------------
  return (
    <div className="card p-4 shadow-sm mt-4">
      <h4 className="mb-3">🧪 Book Trainer Test</h4>

      {!token && (
        <div className="alert alert-warning">⚠️ Please log in first.</div>
      )}

      <form onSubmit={handleBook}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Trainer</label>
          <select
            className="form-select"
            value={selectedTrainer}
            onChange={(e) => setSelectedTrainer(e.target.value)}
            required
          >
            <option value="">Select a trainer...</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name || t.email}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Time</label>
          <input
            type="time"
            className="form-control"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading || !token}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>

      {message && (
        <div
          className={`alert mt-3 ${
            message.startsWith('✅') ? 'alert-success' : 'alert-danger'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}



{/*
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAppointments } from '@/store/slices/appointmentsSlice';

interface Trainer {
  id: string;
  full_name?: string;
  email?: string;
  profile_image_url?: string;
}

export default function BookTrainerSimpleTest() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.user);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 🔹 Fetch trainers once
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/admins', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: Trainer[] = await res.json();
        setTrainers(data);
      } catch (err) {
        console.error('❌ Failed to fetch trainers', err);
      }
    })();
  }, [token]);

  // 🔹 Submit
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage('❌ Please log in first.');
      return;
    }
    if (!selectedTrainer || !date || !time) {
      setMessage('⚠️ Please fill all fields.');
      return;
    }

    setLoading(true);
    setMessage(null);

    // Combine date & time into ISO
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    try {
      const res = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Workout with Trainer`,
          description: `Session with trainer`,
          event_type: 'workout',
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          admin_id: selectedTrainer, // 🔹 match backend naming
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Appointment booked successfully!');
        dispatch(fetchAppointments());
      } else {
        setMessage(`❌ ${data.error || data.message || 'Booking failed'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 shadow-sm mt-4">
      <h4 className="mb-3">🧪 Book Trainer Test</h4>
      <form onSubmit={handleBook}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Trainer</label>
          <select
            className="form-select"
            value={selectedTrainer}
            onChange={(e) => setSelectedTrainer(e.target.value)}
            required
          >
            <option value="">Select a trainer...</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name || t.email}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Time</label>
          <input
            type="time"
            className="form-control"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>

      {message && (
        <div
          className={`alert mt-3 ${
            message.startsWith('✅') ? 'alert-success' : 'alert-danger'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

/*/}
