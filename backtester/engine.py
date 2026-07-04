"""回测引擎：模拟A股交易规则（T+1、整手、佣金、印花税、滑点）。"""

from dataclasses import dataclass, field

import pandas as pd


@dataclass
class BacktestConfig:
    initial_cash: float = 100_000.0
    commission_rate: float = 0.00025  # 佣金费率，买卖双向收取
    min_commission: float = 5.0  # 每笔最低佣金（元）
    stamp_tax_rate: float = 0.0005  # 印花税率，仅卖出收取
    slippage: float = 0.0  # 单边滑点比例
    lot_size: int = 100  # A股最小交易单位：1手=100股
    t_plus_1: bool = True  # T+1：当日买入的股份，下一交易日起才可卖出


@dataclass
class Trade:
    date: pd.Timestamp
    side: str  # "buy" | "sell"
    price: float
    shares: int
    commission: float
    stamp_tax: float


@dataclass
class BacktestResult:
    equity_curve: pd.DataFrame
    trades: list = field(default_factory=list)
    config: BacktestConfig = None


class BacktestEngine:
    """单只股票、满仓/空仓二元仓位的日线回测引擎。

    信号在 T 日收盘生成，实际在 T+1 日开盘价成交，避免未来函数。
    """

    def __init__(self, df: pd.DataFrame, signal: pd.Series, config: BacktestConfig = None):
        self.df = df.reset_index(drop=True)
        self.signal = signal.reset_index(drop=True)
        self.config = config or BacktestConfig()

    def run(self) -> BacktestResult:
        cfg = self.config
        cash = cfg.initial_cash
        shares = 0
        buyable_from = None  # T+1 下可卖出的最早下标
        trades: list[Trade] = []
        equity = []

        exec_signal = self.signal.shift(1).fillna(0).astype(int)

        for i, row in self.df.iterrows():
            target = exec_signal.iloc[i]
            date = row["date"]

            if target == 1 and shares == 0 and cash > 0:
                buy_price = row["open"] * (1 + cfg.slippage)
                max_shares = int(cash // (buy_price * cfg.lot_size)) * cfg.lot_size
                if max_shares > 0:
                    cost = max_shares * buy_price
                    commission = max(cost * cfg.commission_rate, cfg.min_commission)
                    if cost + commission <= cash:
                        cash -= cost + commission
                        shares = max_shares
                        buyable_from = i + 1 if cfg.t_plus_1 else i
                        trades.append(Trade(date, "buy", buy_price, shares, commission, 0.0))

            elif target == 0 and shares > 0 and (not cfg.t_plus_1 or i >= buyable_from):
                sell_price = row["open"] * (1 - cfg.slippage)
                proceeds = shares * sell_price
                commission = max(proceeds * cfg.commission_rate, cfg.min_commission)
                stamp_tax = proceeds * cfg.stamp_tax_rate
                cash += proceeds - commission - stamp_tax
                trades.append(Trade(date, "sell", sell_price, shares, commission, stamp_tax))
                shares = 0
                buyable_from = None

            market_value = shares * row["close"]
            equity.append(
                {
                    "date": date,
                    "cash": cash,
                    "shares": shares,
                    "market_value": market_value,
                    "equity": cash + market_value,
                }
            )

        equity_curve = pd.DataFrame(equity)
        return BacktestResult(equity_curve=equity_curve, trades=trades, config=cfg)
