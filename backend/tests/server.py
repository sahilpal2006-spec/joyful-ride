"""Compatibility import for older scripts that used ``tests.server``."""

try:
    from ..server import *  # noqa: F403
except ImportError:
    # Also support ``uvicorn tests.server:app`` when the working directory is
    # the backend folder, where ``server`` is importable as a top-level module.
    from server import *  # noqa: F403
