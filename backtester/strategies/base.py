from abc import ABC, abstractmethod

import pandas as pd


class Strategy(ABC):
    """策略基类：输入日线行情，输出每日目标仓位信号（1=持仓，0=空仓）。"""

    name: str = "base"

    @abstractmethod
    def generate_signals(self, df: pd.DataFrame) -> pd.Series:
        """df 需包含 open/high/low/close/volume 列，index 与 df 对齐。"""
        raise NotImplementedError
