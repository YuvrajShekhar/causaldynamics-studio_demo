import TrajectoryChart from "./TrajectoryChart.jsx";

export default function ResultsPanel({ result, loading, error }) {
  if (error) {
    return (
      <div className="panel">
        <div className="error-box">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel">
        <div className="results-empty">Running causaldynamics.creator.create()...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="panel">
        <div className="results-empty">
          Pick a preset or set your own parameters, then generate a system to see it here.
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>Run {result.run_id}</h2>
      <div className="meta-row">
        <span>
          <b>{result.num_nodes}</b> nodes
        </span>
        <span>
          <b>{result.num_timesteps}</b> timesteps
        </span>
        <span>
          <b>{result.node_dim}</b> dims/node
        </span>
        <span>
          <b>{result.params.system_name}</b> system
        </span>
        <span>
          generated in <b>{result.elapsed_seconds}s</b>
        </span>
      </div>

      <div className="plots-grid">
        {result.scm_graph_png && (
          <img src={`data:image/png;base64,${result.scm_graph_png}`} alt="SCM graph" />
        )}
        {result.trajectories_png && (
          <img src={`data:image/png;base64,${result.trajectories_png}`} alt="Trajectories" />
        )}
      </div>

      <TrajectoryChart timeSeries={result.time_series} numNodes={result.num_nodes} />
    </div>
  );
}
