export default function ConfigForm({ params, setParams, systems, presets, onSubmit, loading }) {
  const update = (key, value) => setParams((p) => ({ ...p, [key]: value }));

  const applyPreset = (preset) => {
    setParams((p) => ({ ...p, ...preset.params }));
  };

  return (
    <div className="panel">
      <h2>Presets</h2>
      <div className="presets">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="preset-btn"
            onClick={() => applyPreset(preset)}
          >
            <strong>{preset.label}</strong>
            <span>{preset.description}</span>
          </button>
        ))}
      </div>

      <h2>System configuration</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="field">
          <label>System</label>
          <select
            value={params.system_name}
            onChange={(e) => update("system_name", e.target.value)}
          >
            {systems.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="row-2">
          <div className="field">
            <label>Nodes</label>
            <input
              type="number"
              min={2}
              max={15}
              value={params.num_nodes}
              onChange={(e) => update("num_nodes", Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Node dimension</label>
            <input
              type="number"
              min={1}
              max={6}
              value={params.node_dim}
              onChange={(e) => update("node_dim", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="field">
          <label>Timesteps</label>
          <input
            type="number"
            min={20}
            max={1000}
            value={params.num_timesteps}
            onChange={(e) => update("num_timesteps", Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label>Graph type</label>
          <select value={params.graph} onChange={(e) => update("graph", e.target.value)}>
            <option value="scale-free">scale-free</option>
            <option value="all_uniform">all_uniform</option>
          </select>
        </div>

        <div className="checkbox-row">
          <input
            type="checkbox"
            id="confounders"
            checked={params.scm_confounders}
            onChange={(e) => update("scm_confounders", e.target.checked)}
          />
          <label htmlFor="confounders" style={{ margin: 0 }}>
            Allow confounders
          </label>
        </div>

        <div className="row-2">
          <div className="field">
            <label>Noise</label>
            <input
              type="number"
              step="0.05"
              min={0}
              max={2}
              value={params.noise}
              onChange={(e) => update("noise", Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Seed</label>
            <input
              type="number"
              value={params.seed}
              onChange={(e) => update("seed", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="row-2">
          <div className="field">
            <label>Time lag (optional)</label>
            <input
              type="number"
              min={0}
              max={20}
              value={params.time_lag ?? ""}
              placeholder="none"
              onChange={(e) =>
                update("time_lag", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </div>
          <div className="field">
            <label>Lag edge probability</label>
            <input
              type="number"
              step="0.05"
              min={0}
              max={1}
              value={params.time_lag_edge_probability}
              onChange={(e) => update("time_lag_edge_probability", Number(e.target.value))}
            />
          </div>
        </div>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? "Simulating..." : "Generate system"}
        </button>
      </form>
    </div>
  );
}
