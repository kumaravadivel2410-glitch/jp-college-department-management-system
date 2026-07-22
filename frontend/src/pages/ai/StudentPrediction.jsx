import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { Brain, Search, Filter, AlertTriangle, CheckCircle, Award } from 'lucide-react';

const StudentPrediction = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/ai/predict/student');
      if (res.data.success) {
        setPredictions(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const filtered = predictions.filter(p => {
    const matchesSearch = (p.studentName && p.studentName.toLowerCase().includes(search.toLowerCase())) ||
                          (p.registerNo && p.registerNo.toLowerCase().includes(search.toLowerCase())) ||
                          (p.department && p.department.toLowerCase().includes(search.toLowerCase()));
    const matchesRisk = riskFilter === 'All' || p.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" /> Student Performance & Pass Probability Predictor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Machine Learning forecasted GPA, Pass Probability, and Academic Risk Levels.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="card-glass p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, reg no, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-600 dark:text-slate-300">Risk Level:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Register No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Predicted GPA</th>
                <th className="p-3">Pass Probability</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">AI Recommendations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    Computing Machine Learning Predictions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No predictions found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p._id || p.registerNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{p.registerNo}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{p.studentName}</td>
                    <td className="p-3">{p.department} ({p.year || 'III Year'})</td>
                    <td className="p-3 font-bold text-amber-600 dark:text-amber-400">{p.predictedGPA} / 10</td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{p.passProbability}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase ${
                        p.riskLevel === 'Critical' ? 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300' :
                        p.riskLevel === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        p.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}>
                        {p.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-600 dark:text-slate-300">
                      {Array.isArray(p.recommendedActions) ? p.recommendedActions.join('; ') : 'None'}
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

export default StudentPrediction;
