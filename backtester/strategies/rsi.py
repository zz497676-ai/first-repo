import pandas as pd

from .base import Strategy


def _rsi(close: pd.Series, window: int) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(window).mean()
    avg_loss = loss.rolling(window).mean()
    rs = avg_gain / avg_loss.replace(0, float("nan"))
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50)


class RSIReversionStrategy(Strategy):
    """RSI 超卖买入、超买卖出的均值回归策略。"""

    name = "rsi"

    def __init__(self, window: int = 14, buy_threshold: float = 30, sell_threshold: float = 70):
        self.window = window
        self.buy_threshold = buy_threshold
        self.sell_threshold = sell_threshold

    def generate_signals(self, df: pd.DataFrame) -> pd.Series:
        rsi = _rsi(df["close"], self.window)
        signal = pd.Series(0, index=df.index)
        holding = 0
        for i in range(len(df)):
            if holding == 0 and rsi.iloc[i] < self.buy_threshold:
                holding = 1
            elif holding == 1 and rsi.iloc[i] > self.sell_threshold:
                holding = 0
            signal.iloc[i] = holding
        return signal
