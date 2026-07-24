import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Calendar } from 'lucide-react';

const Timetable = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6];

  const [timetableData, setTimetableData] = useState([
    { day: 'Monday', period: 1, subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', room: 'LH-301' },
    { day: 'Monday', period: 2, subjectCode: 'CS8601', subjectName: 'Mobile Computing', room: 'LH-301' },
    { day: 'Tuesday', period: 1, subjectCode: 'CS8611', subjectName: 'Mini Project Lab', room: 'CS-Lab 2' },
    { day: 'Wednesday', period: 3, subjectCode: 'CS8691', subjectName: 'Artificial Intelligence', room: 'LH-301' }
  ]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await API.get('/timetable?department=CSE&year=3');
        if (res.data && res.data.length > 0) setTimetableData(res.data);
      } catch (err) {
        console.log('Using local timetable grid');
      }
    };
    fetchTimetable();
  }, []);

  const getSlot = (day, period) => {
    return timetableData.find(t => t.day === day && t.period === period);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar color="#2563eb" /> Weekly Lecture Timetable
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Class Schedule Grid for III Year Computer Science & Engineering (Section A)</p>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-primary)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>DAY / PERIOD</th>
              {periods.map(p => (
                <th key={p} style={{ padding: '0.75rem', textAlign: 'center' }}>Period {p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 800, background: 'var(--bg-primary)', textAlign: 'center' }}>{day}</td>
                {periods.map(p => {
                  const slot = getSlot(day, p);
                  return (
                    <td key={p} style={{ padding: '0.75rem', textAlign: 'center', verticalAlign: 'middle' }}>
                      {slot ? (
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.5rem' }}>
                          <div style={{ fontWeight: 700, color: '#1d4ed8' }}>{slot.subjectCode}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{slot.room}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timetable;
