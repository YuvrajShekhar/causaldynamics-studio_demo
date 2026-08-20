from typing import Optional

from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    system_name: str = Field("random", description="'random', 'Lorenz', 'Rossler', etc.")
    num_nodes: int = Field(5, ge=2, le=15)
    num_timesteps: int = Field(300, ge=20, le=1000)
    node_dim: int = Field(3, ge=1, le=6)
    graph: str = Field("scale-free", pattern="^(scale-free|all_uniform)$")
    scm_confounders: bool = False
    standardize: bool = False
    noise: float = Field(0.1, ge=0.0, le=2.0)
    seed: Optional[int] = 0
    time_lag: Optional[int] = Field(None, ge=0, le=20)
    time_lag_edge_probability: float = Field(0.1, ge=0.0, le=1.0)


class GenerateResponse(BaseModel):
    run_id: str
    elapsed_seconds: float
    params: dict
    num_timesteps: int
    num_nodes: int
    node_dim: int
    time_series: list
    scm_graph_png: Optional[str] = None
    trajectories_png: Optional[str] = None
