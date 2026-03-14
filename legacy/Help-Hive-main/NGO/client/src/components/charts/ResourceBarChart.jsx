import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const ResourceBarChart = ({ data }) => (
  <div className="border border-black/5 bg-white rounded-2xl p-6 shadow-sm">
    <h3 className="mb-6 font-bold text-lg text-text-primary uppercase tracking-wider">Resource Usage</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
            }} 
          />
          <Bar dataKey="quantity" fill="#b9d2d2" radius={[6, 6, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default ResourceBarChart;
