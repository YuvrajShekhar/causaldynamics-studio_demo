import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#38bdf8", "#f472b6", "#a3e635", "#fbbf24", "#c084fc", "#fb7185", "#2dd4bf"];

// time_series has shape [time][node][dim]. We plot dim 0 of every node so the
// chart stays readable regardless of node_dim, and it's interactive
// (hoverable/zoomable) unlike the static matplotlib PNG from the same run.
export default function TrajectoryChart({ timeSeries, numNodes }) {
  if (!timeSeries || timeSeries.length === 0) return null;

  const data = timeSeries.map((step, t) => {
    const point = { t };
    for (let n = 0; n < numNodes; n++) {
      point[`node ${n}`] = step[n] ? step[n][0] : null;
    }
    return point;
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262c36" />
          <XAxis dataKey="t" stroke="#9aa4b2" tick={{ fontSize: 11 }} />
          <YAxis stroke="#9aa4b2" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#161b22", border: "1px solid #262c36", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {Array.from({ length: numNodes }).map((_, n) => (
            <Line
              key={n}
              type="monotone"
              dataKey={`node ${n}`}
              stroke={COLORS[n % COLORS.length]}
              dot={false}
              strokeWidth={1.6}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="chart-caption">
        Dimension 0 of every node's trajectory, rendered interactively from the raw simulation
        output (same data the static PNG on the left is built from).
      </p>
    </div>
  );
}
