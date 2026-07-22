import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { CalendarCheck, AlertTriangle, UserX, ShieldAlert, CheckCircle2 } from 'lucide-react';

const AttendancePrediction = () => {
  const [atRiskList, setAtRiskList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendancePrediction = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/ai/predict/attendance');
      if (res.data.success) {
        setAtRiskList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching attendance risk:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendancePrediction();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 animate-pulse" /> Early Warning Attendance Alert System
          </div>
          <h1 className="text-xl font-extrabold">Attendance Shortage & Low Attendance Predictor</h1>
          <p className="text-xs text-slate-300 mt-1">
            Forecasts students at risk of failing mandatory 75% attendance threshold before end of semester.
          </p>
        </div>
        <div className="bg-red-500/20 border border-red-500/40 px-4 py-2 rounded-xl text-center">
          <p className="text-[10px] text-red-300 uppercase font-bold">At-Risk Students Count</p>
          <h2 className="text-2xl font-black text-red-400">{atRiskList.length}</h2>
        </div>
      </div>

      {/* List */}
      <div className="card-glass overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200">
          Students Forecasted Below 75% Attendance Threshold
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Register No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Current Attendance</th>
                <th className="p-3">Forecasted Status</th>
                <th className="p-3">Mandatory Remedial Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    Computing attendance forecast models...
                  </td>
                </tr>
              ) : atRiskList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-emerald-600 font-bold">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                    All students are above the 75% attendance requirement!
                  </td>
                </tr>
              ) : (
                atRiskList.map(item => (
                  <tr key={item._id || item.registerNo} className="hover:bg-red-50/50 dark:hover:bg-red-950/20">
                    <td className="p-3 font-bold text-red-600 dark:text-red-400">{item.registerNo}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{item.studentName}</td>
                    <td className="p-3">{item.department} ({item.year || 'III Year'})</td>
                    <td className="p-3 font-bold text-red-600 dark:text-red-400">{item.attendancePercentage || 70}%</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] font-bold rounded uppercase">
                        Shortage Alert (&lt;75%)
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-600 dark:text-slate-300">
                      {Array.isArray(item.recommendedActions) ? item.recommendedActions.join('; ') : 'Parent notification & counseling.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePrediction;
