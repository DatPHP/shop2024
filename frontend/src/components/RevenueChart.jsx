import React, { useState, useEffect } from 'react';
import axios from '../axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function RevenueChart() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/orders/revenue-analytics?filter=${filter}`);
        // Format data for chart
        const formattedData = response.data.map(item => ({
          name: item.date || `${item.hour}:00`,
          revenue: parseFloat(item.total)
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  return (
    <div className="block p-6 bg-white border border-gray-200 shadow-xl rounded-lg shadowdark:border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900">Revenue Analytics</h5>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('day')}
            className={`px-4 py-2 rounded ${filter === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Day
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded ${filter === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Week
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-4 py-2 rounded ${filter === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Month
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading chart...</p>
      ) : (
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
