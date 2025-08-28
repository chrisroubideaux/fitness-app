///


'use client';

import { useState } from 'react';

export default function NewMessageTab() {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 🚧 You’ll add backend submission logic here later
    setSuccess(true);

    // Clear form after 2 seconds
    setTimeout(() => {
      setRecipient('');
      setSubject('');
      setMessage('');
      setSuccess(false);
    }, 2000);
  };

  return (
    <div className="new-message-wrapper">
      <h6 className="mb-3">Compose New Message</h6>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Recipient</label>
          <select
            className="form-select form-select-sm"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="admin">Admin Team</option>
            <option value="coach">Coach Lena</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Subject</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter a subject"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea
            className="form-control form-control-sm"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            required
          />
        </div>

        <button type="submit" className="btn btn-sm btn-success">
          Send Message
        </button>

        {success && (
          <div className="alert alert-success mt-3 p-2" role="alert">
            ✅ Message sent successfully!
          </div>
        )}
      </form>
    </div>
  );
}
