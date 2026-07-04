import pandas as pd

from .base import Strategy


class MovingAverageCrossStrategy(Strategy):
    """快线上穿慢线做多，下穿平仓的均线交叉策略。"""

    name = "ma_cross"

    def __init__(self, fast_window: int = 5, slow_window: int = 20):
        if fast_window >= slow_window:
            raise ValueError("fast_window 必须小于 slow_window")
        self.fast_window = fast_window
        self.slow_window = slow_window

    def generate_signals(self, df: pd.DataFrame) -> pd.Series:
        fast_ma = df["close"].rolling(self.fast_window).mean()
        slow_ma = df["close"].rolling(self.slow_window).mean()
        signal = (fast_ma > slow_ma).astype(int)
        signal[fast_ma.isna() | slow_ma.isna()] = 0
        return signal
