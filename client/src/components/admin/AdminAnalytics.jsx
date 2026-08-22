import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, Award, TrendingUp, Download, Calendar } from 'lucide-react';
import api from '../../lib/api';

export default function AdminAnalytics() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/analytics?range=${range}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const downloadCSV = () => {
    if (!data) return;
    const csvContent = [
      ['Metric', 'Value'],
      ['Gross Merchandise Value (GMV)', `INR ${data.gmv}`],
      ['Take-Rate Platform Revenue (10%)', `INR ${data.takeRate}`],
      ['Daily Active Users (DAU)', data.dau],
      ['Monthly Active Users (MAU)', data.mau],
      ['User Churn Rate', `${data.churnRate.toFixed(2)}%`],
      ['Gig Hiring Conversion Rate', `${data.conversionRate.toFixed(2)}%`],
      ['Average Time-to-Hire (Days)', `${data.avgTimeToHireDays.toFixed(1)}`],
      ['Total Applications', data.funnel.applications],
      ['Total Hires', data.funnel.hires],
      ['Total Completions', data.funnel.completions]
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `microgig_analytics_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading platform analytics...</p>
      </div>
    );
  }

  const COLORS = ['#000000', '#2563EB', '#10B981'];

  const funnelData = [
    { name: 'Applications', value: data.funnel.applications },
    { name: 'Hires', value: data.funnel.hires },
    { name: 'Completions', value: data.funnel.completions }
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-gray-200 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">Business & Marketplace Health</h2>
          <p className="text-xs text-gray-500 mt-1 font-semibold">Real-time indicators of transactions, conversion pipelines, and user activity.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-wider text-gray-700 outline-none cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-wider px-4.5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Volume (GMV)</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1 leading-none">₹{data.gmv.toLocaleString()}</h3>
            <span className="text-[10px] text-gray-500 font-semibold block mt-2">Value of all contracts</span>
          </div>
          <div className="w-12 h-12 bg-black/5 text-black rounded-2xl flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Commission Revenue</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1 leading-none">₹{data.takeRate.toLocaleString()}</h3>
            <span className="text-[10px] text-emerald-600 font-bold block mt-2">10% Platform Take-Rate</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Platform Active Users</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1 leading-none">{data.mau} MAU</h3>
            <span className="text-[10px] text-blue-600 font-bold block mt-2">{data.dau} Active Today (DAU)</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Marketplace Churn</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1 leading-none">{data.churnRate.toFixed(1)}%</h3>
            <span className="text-[10px] text-gray-500 font-semibold block mt-2">30-day user inactivity rate</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hire Conversion Rate</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1 leading-none">{data.conversionRate.toFixed(1)}%</h3>
          <p className="text-xs text-gray-500 mt-2 font-semibold">Percentage of job listings that secure a hired specialist.</p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Average Time-to-Hire</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1 leading-none">{data.avgTimeToHireDays.toFixed(1)} Days</h3>
          <p className="text-xs text-gray-500 mt-2 font-semibold">Average duration from initial post timestamp to final hire confirmation.</p>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion pipeline Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-3xl shadow-sm text-left">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Marketplace Funnel Analysis</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="value" name="Total Actions" fill="#000000" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel distribution chart */}
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm text-left">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Pipeline Breakdown</h4>
          <div className="h-72 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={funnelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around text-center mt-4">
              {funnelData.map((entry, index) => (
                <div key={entry.name}>
                  <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS[index] }} />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{entry.name}</p>
                  <p className="text-xs font-extrabold text-gray-900 mt-0.5">{entry.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
