"""
Thin service layer around kausable's own open-source `causaldynamics` package
(https://github.com/kausable/CausalDynamics).

We call their real `causaldynamics.creator.create(...)` function directly -
the exact same function their CLI (`python creator.py --config config.yaml`)
calls under the hood - so every run here is a genuine CausalDynamics run,
not a re-implementation or a mock.

What this layer adds on top of the CLI:
  - accepts parameters as a typed request instead of a hand-edited YAML file
  - returns the causal graph + trajectories as JSON so a UI can render them
    interactively, instead of only static PNGs buried in output/<timestamp>/
  - base64-encodes the SCM graph + trajectory plots so the same request also
    gets the "at a glance" plots kausable's researchers already know
"""

import base64
import logging
import shutil
import tempfile
import time
import uuid
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger("causaldynamics_studio")

# Systems that are safe presets against the current CausalDynamics API.
# "random" and "Lorenz" are the package's own defaults (see creator.create()
# and config.yaml). The others are common `dysts` flow names; if a name isn't
# recognized, the underlying library raises a clear error we pass through.
KNOWN_SYSTEMS = ["random", "Lorenz", "Rossler", "Aizawa", "Chen", "Duffing"]

PRESETS = [
    {
        "id": "quick-lorenz",
        "label": "Quick Lorenz system",
        "description": "Small, fast chaotic system - good first run (~seconds).",
        "params": {
            "system_name": "Lorenz",
            "num_nodes": 4,
            "num_timesteps": 200,
            "node_dim": 3,
            "graph": "scale-free",
            "scm_confounders": False,
            "noise": 0.1,
            "seed": 0,
        },
    },
    {
        "id": "confounded-random",
        "label": "Confounded random system",
        "description": "Larger random causal graph with confounders switched on.",
        "params": {
            "system_name": "random",
            "num_nodes": 8,
            "num_timesteps": 300,
            "node_dim": 3,
            "graph": "scale-free",
            "scm_confounders": True,
            "noise": 0.15,
            "seed": 7,
        },
    },
    {
        "id": "rossler-time-lag",
        "label": "Rossler with time lag",
        "description": "Adds lagged causal edges on top of a Rossler-driven system.",
        "params": {
            "system_name": "Rossler",
            "num_nodes": 5,
            "num_timesteps": 250,
            "node_dim": 3,
            "graph": "scale-free",
            "scm_confounders": False,
            "noise": 0.1,
            "seed": 3,
            "time_lag": 5,
            "time_lag_edge_probability": 0.1,
        },
    },
]


def _png_to_base64(path: Path) -> str | None:
    if not path.exists():
        return None
    return base64.b64encode(path.read_bytes()).decode("ascii")


def _to_native(value: Any) -> Any:
    """Recursively convert numpy/torch types to plain Python for JSON."""
    if isinstance(value, np.ndarray):
        return value.tolist()
    if hasattr(value, "detach"):  # torch.Tensor
        return value.detach().cpu().numpy().tolist()
    if isinstance(value, (np.floating,)):
        return float(value)
    if isinstance(value, (np.integer,)):
        return int(value)
    return value


def generate(params: dict) -> dict:
    """
    Run one CausalDynamics simulation via the real package and return
    a JSON-serializable summary: adjacency matrix, root nodes, node
    trajectories, and base64 plots.
    """
    # Imported lazily so the API can boot and report /health even before
    # the (large) causaldynamics/torch/jax stack has finished installing.
    from causaldynamics.creator import create

    run_id = uuid.uuid4().hex[:10]
    tmp_dir = Path(tempfile.mkdtemp(prefix=f"causaldynamics_{run_id}_"))

    make_trajectory_kwargs = {}
    if params.get("noise") is not None:
        make_trajectory_kwargs["noise"] = params["noise"]

    started = time.time()
    try:
        da = create(
            seed=params.get("seed"),
            num_nodes=params["num_nodes"],
            num_timesteps=params["num_timesteps"],
            node_dim=params["node_dim"],
            scm_confounders=params.get("scm_confounders", False),
            standardize=params.get("standardize", False),
            activations_names=params.get("activations_names"),
            graph=params.get("graph", "scale-free"),
            system_name=params.get("system_name", "random"),
            make_trajectory_kwargs=make_trajectory_kwargs,
            time_lag=params.get("time_lag"),
            time_lag_edge_probability=params.get("time_lag_edge_probability", 0.1),
            out_dir_base=str(tmp_dir),
            add_outdir_timestamp=False,
            plot=True,
            show_plot=False,
            save_plot=True,
            create_animation=False,
            save_data=False,
        )
        elapsed = round(time.time() - started, 2)

        plots_dir = tmp_dir / "plots"
        scm_png = _png_to_base64(plots_dir / "scm_graph.png")
        traj_png = _png_to_base64(plots_dir / "trajectories.png")

        # da has dims [time, node, dim] -> [time][node][dim]
        time_series = _to_native(da.values)

        return {
            "run_id": run_id,
            "elapsed_seconds": elapsed,
            "params": params,
            "num_timesteps": time_series and len(time_series),
            "num_nodes": params["num_nodes"],
            "node_dim": params["node_dim"],
            "time_series": time_series,
            "scm_graph_png": scm_png,
            "trajectories_png": traj_png,
        }
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
