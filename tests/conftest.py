"""
tests/conftest.py
-----------------
Pytest auto-imports this BEFORE collecting any test modules, so it's the
right place to set env vars that have to be in place before numpy /
torch / faiss / Accelerate ever load.

Why this file exists: under pytest on macOS, CLIP's forward pass
segfaults inside torch.nn.functional.layer_norm because PyTorch and
FAISS are sharing one process's OpenMP/BLAS thread pools and stomping
on each other. Running the same code under `uvicorn api:app --reload`
doesn't hit this because uvicorn forks a child worker with a clean
environment. Pinning every threading backend to 1 thread sidesteps
the conflict cleanly. Throughput cost is irrelevant for a test run.
"""

import os

# Must be set BEFORE the first import of numpy / torch / faiss anywhere
# in this Python process. Conftest is the earliest hook pytest gives us.
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("VECLIB_MAXIMUM_THREADS", "1")  # Apple Accelerate
os.environ.setdefault("NUMEXPR_NUM_THREADS", "1")

# Also pin torch's own intra-op thread count from inside the process.
import torch  # noqa: E402

torch.set_num_threads(1)
