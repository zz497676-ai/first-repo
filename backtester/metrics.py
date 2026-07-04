"""回测绩效指标计算。"""

import numpy as np
import pandas as pd


def compute_metrics(
    equity_curve: pd.DataFrame,
    initial_cash: float,
    trades: list = None,
    periods_per_year: int = 252,
) -> dict:
    equity = equity_curve["equity"]
    returns = equity.pct_change().fillna(0)

    total_return = equity.iloc[-1] / initial_cash - 1
    n_days = len(equity)
    years = n_days / periods_per_year if n_days > 0 else 0
    annual_return = (1 + total_return) ** (1 / years) - 1 if years > 0 else 0.0

    cummax = equity.cummax()
    drawdown = equity / cummax - 1
    max_drawdown = drawdown.min()

    ann_vol = returns.std() * np.sqrt(periods_per_year)
    sharpe_ratio = (returns.mean() * periods_per_year) / ann_vol if ann_vol > 0 else 0.0

    return {
        "total_return": float(total_return),
        "annual_return": float(annual_return),
        "max_drawdown": float(max_drawdown),
        "annual_volatility": float(ann_vol),
        "sharpe_ratio": float(sharpe_ratio),
        "num_trades": len(trades) if trades else 0,
        "final_equity": float(equity.iloc[-1]),
    }


def compute_trade_stats(trades: list) -> dict:
    """按买入-卖出配对计算完整交易回合的盈亏与胜率（仅适用于多空二元仓位）。"""
    round_trip_pnls = []
    open_buy = None
    for t in trades:
        if t.side == "buy":
            open_buy = t
        elif t.side == "sell" and open_buy is not None:
            pnl = (t.price - open_buy.price) * t.shares - open_buy.commission - t.commission - t.stamp_tax
            round_trip_pnls.append(pnl)
            open_buy = None

    if not round_trip_pnls:
        return {"win_rate": 0.0, "avg_pnl": 0.0, "num_round_trips": 0}

    wins = [p for p in round_trip_pnls if p > 0]
    return {
        "win_rate": len(wins) / len(round_trip_pnls),
        "avg_pnl": float(np.mean(round_trip_pnls)),
        "num_round_trips": len(round_trip_pnls),
    }
