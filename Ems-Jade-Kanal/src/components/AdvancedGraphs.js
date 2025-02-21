import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { ChartLine, Star, Beaker } from 'lucide-react';

const AdvancedGraphs = ({ data, parameterInfo }) => {
  const [selectedParameters, setSelectedParameters] = useState(['nitrat', 'phosphat', 'ph']);
  const [showTrends, setShowTrends] = useState(false);

  const processedData = useMemo(() => {
    let filteredData = [...data];

    if (showTrends) {
      const window = 3;
      filteredData = filteredData.map((item, index, array) => {
        const trends = {};
        selectedParameters.forEach(param => {
          const values = array
            .slice(Math.max(0, index - window), index + 1)
            .map(d => d[param])
            .filter(v => v !== null);
          trends[`${param}_trend`] = values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : null;
        });
        return { ...item, ...trends };
      });
    }

    return filteredData;
  }, [data, showTrends, selectedParameters]);

  const renderMainChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="date" stroke="#333" />
        <YAxis stroke="#333" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            borderRadius: '8px',
            border: '1px solid #ddd',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          formatter={(value, name) => [
            value?.toFixed(2) || 'N/A',
            parameterInfo[name]?.label || name
          ]}
        />
        <Legend />
        {selectedParameters.map((param, index) => (
          <React.Fragment key={param}>
            <Line
              type="monotone"
              dataKey={param}
              name={parameterInfo[param].label}
              stroke={`hsl(${index * 40}, 70%, 50%)`}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 8 }}
            />
            {showTrends && (
              <Line
                type="monotone"
                dataKey={`${param}_trend`}
                name={`${parameterInfo[param].label} Trend`}
                stroke={`hsl(${index * 40}, 70%, 50%)`}
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
              />
            )}
          </React.Fragment>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderTemperatureChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="date" stroke="#333" />
        <YAxis stroke="#333" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="temperature"
          name="Temperature"
          stroke="#ff7300"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="prevDayTemp"
          name="Previous Day"
          stroke="#ffc658"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderNutrientsChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="date" stroke="#333" />
        <YAxis stroke="#333" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="ammonium" name="Ammonium" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="nitrat" name="Nitrate" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="nitrit" name="Nitrite" stroke="#ffc658" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="phosphat" name="Phosphate" stroke="#ff7300" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );

  const calculateStats = (param) => {
    const values = data
      .map(item => item[param])
      .filter(v => v !== null);
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length
    };
  };

  return (
    <div className="space-y-8">
      {/* Main Chart Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <ChartLine className="w-5 h-5 text-blue-600" />
              Parameter Selection
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(parameterInfo).map(([key, info]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedParameters(prev =>
                      prev.includes(key)
                        ? prev.filter(p => p !== key)
                        : [...prev, key]
                    );
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedParameters.includes(key)
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                  }`}
                >
                  {info.label}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTrends(prev => !prev)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              showTrends
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent'
            }`}
          >
            <ChartLine className="w-4 h-4" />
            {showTrends ? 'Hide' : 'Show'} Trends
          </motion.button>
        </div>
        {renderMainChart()}
      </div>

      {/* Featured Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-500" />
            Temperature Trends
          </h3>
          {renderTemperatureChart()}
        </div>

        {/* Nutrients Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Beaker className="w-5 h-5 text-green-500" />
            Nutrient Levels
          </h3>
          {renderNutrientsChart()}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {selectedParameters.map(param => {
          const stats = calculateStats(param);
          return (
            <motion.div
              key={param}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <h3 className="font-medium text-gray-700 mb-2">{parameterInfo[param].label} Statistics</h3>
              <div className="space-y-1 text-sm">
                <p>Maximum: {stats.max.toFixed(2)} {parameterInfo[param].unit}</p>
                <p>Minimum: {stats.min.toFixed(2)} {parameterInfo[param].unit}</p>
                <p>Average: {stats.avg.toFixed(2)} {parameterInfo[param].unit}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedGraphs;