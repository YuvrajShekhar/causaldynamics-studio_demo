import { useEffect, useState } from "react";
import ConfigForm from "./components/ConfigForm.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import { generateSystem, getPresets, getSystems } from "./api.js";

const DEFAULT_PARAMS = {
  system_name: "Lorenz",
  num_nodes: 5,
  num_timesteps: 300,
  node_dim: 3,
  graph: "scale-free",
  scm_confounders: false,
  standardize: false,
  noise: 0.1,
  seed: 0,
  time_lag: null,
  time_lag_edge_probability: 0.1,
};

export default function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [systems, setSystems] = useState(["random", "Lorenz"]);
  const [presets, setPresets] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSystems()
      .then((r) => setSystems(r.systems))
      .catch(() => {});
    getPresets()
      .then((r) => setPresets(r.presets))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await generateSystem(params);
      setResult(r);
    } catch (err) {
      setError(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>CausalDynamics Studio</h1>
        <p>
          A form-and-visualization layer over kausable's open-source{" "}
          <code>causaldynamics</code> package - configure a causal system, run it, and see the
          graph and trajectories without hand-editing <code>config.yaml</code> or digging through{" "}
          <code>output/&lt;timestamp&gt;/</code>.
        </p>
      </div>

      <div className="layout">
        <ConfigForm
          params={params}
          setParams={setParams}
          systems={systems}
          presets={presets}
          onSubmit={handleSubmit}
          loading={loading}
        />
        <ResultsPanel result={result} loading={loading} error={error} />
      </div>

      <footer className="note">
        Proof of concept built against the real, public{" "}
        <a href="https://github.com/kausable/CausalDynamics" target="_blank" rel="noreferrer">
          kausable/CausalDynamics
        </a>{" "}
        package - every run here calls <code>causaldynamics.creator.create()</code> directly, the
        same function the project's own CLI uses.
      </footer>
    </div>
  );
}
