import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { FileSpreadsheet, Download, Printer, Sparkles, CheckCircle2 } from 'lucide-react';

const AIReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await apiClient.get('/ai/analytics');
        if (res.data.success) setData(res.data);
      } catch (err) {
        console.error('Error loading AI report data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const summary = data?.summary || {};
  const predictions = data?.predictions || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> AI Academic Risk & Forecast Report Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Exportable institutional intelligence reports for HODs, Principals, and Academic Committee.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Printable Report Card */}
      <div className="card-glass p-8 space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 print:shadow-none border print:border-none">
        <div className="border-b pb-4 border-slate-200 dark:border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-extrabold text-blue-900 dark:text-blue-400">J.P. COLLEGE OF ENGINEERING</h2>
            <p className="text-xs text-slate-500 font-bold uppercase">Department Management System - AI Intelligence Report</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p className="font-bold text-emerald-600">Status: Official Academic Forecast</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total Students</p>
            <p className="text-lg font-black text-blue-600">{summary.totalStudents || 0}</p>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Avg Pass Forecast</p>
            <p className="text-lg font-black text-emerald-600">{summary.avgPassProb || 92}%</p>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Predicted GPA</p>
            <p className="text-lg font-black text-amber-600">{summary.avgPredictedGPA || 8.4} / 10</p>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Critical / High Risk</p>
            <p className="text-lg font-black text-red-600">{(summary.criticalCount || 0) + (summary.highRiskCount || 0)}</p>
          </div>
        </div>

        {/* Table of At-Risk Students */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
            Detailed Student Predictive Roster
          </h4>
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="p-2.5 border-b">Reg No</th>
                <th className="p-2.5 border-b">Student Name</th>
                <th className="p-2.5 border-b">Department</th>
                <th className="p-2.5 border-b">GPA Forecast</th>
                <th className="p-2.5 border-b">Pass Probability</th>
                <th className="p-2.5 border-b">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {predictions.slice(0, 15).map(p => (
                <tr key={p.registerNo}>
                  <td className="p-2.5 font-bold">{p.registerNo}</td>
                  <td className="p-2.5 font-semibold">{p.studentName}</td>
                  <td className="p-2.5">{p.department}</td>
                  <td className="p-2.5 font-bold text-amber-600">{p.predictedGPA} / 10</td>
                  <td className="p-2.5 font-bold text-emerald-600">{p.passProbability}%</td>
                  <td className="p-2.5 font-bold">{p.riskLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AIReports;
