from .base import Strategy
from .ma_cross import MovingAverageCrossStrategy
from .rsi import RSIReversionStrategy

STRATEGY_REGISTRY = {
    MovingAverageCrossStrategy.name: MovingAverageCrossStrategy,
    RSIReversionStrategy.name: RSIReversionStrategy,
}

__all__ = [
    "Strategy",
    "MovingAverageCrossStrategy",
    "RSIReversionStrategy",
    "STRATEGY_REGISTRY",
]
