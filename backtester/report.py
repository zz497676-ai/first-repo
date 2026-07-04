"""可视化报告：净值曲线、回撤图与HTML汇总报告。"""

import base64
from io import BytesIO

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

for _font in ("Noto Sans CJK SC", "WenQuanYi Zen Hei", "PingFang SC", "SimHei", "Microsoft YaHei"):
    if _font in {f.name for f in matplotlib.font_manager.fontManager.ttflist}:
        matplotlib.rcParams["font.sans-serif"] = [_font]
        break
matplotlib.rcParams["axes.unicode_minus"] = False


def _buy_and_hold_equity(df: pd.DataFrame, initial_cash: float) -> pd.Series:
    shares = initial_cash // df["open"].iloc[0]
    cash_left = initial_cash - shares * df["open"].iloc[0]
    return shares * df["close"] + cash_left


def plot_equity_curve(
    equity_curve: pd.DataFrame, df: pd.DataFrame, initial_cash: float, title: str = ""
) -> plt.Figure:
    bh_equity = _buy_and_hold_equity(df, initial_cash)
    fig, (ax1, ax2) = plt.subplots(
        2, 1, figsize=(10, 8), sharex=True, gridspec_kw={"height_ratios": [3, 1]}
    )

    ax1.plot(equity_curve["date"], equity_curve["equity"], label="策略净值", color="#d62728")
    ax1.plot(equity_curve["date"], bh_equity, label="买入持有基准", color="#7f7f7f", linestyle="--")
    ax1.set_ylabel("账户权益 (元)")
    ax1.set_title(title or "策略回测净值曲线")
    ax1.legend()
    ax1.grid(alpha=0.3)

    drawdown = equity_curve["equity"] / equity_curve["equity"].cummax() - 1
    ax2.fill_between(equity_curve["date"], drawdown * 100, 0, color="#d62728", alpha=0.3)
    ax2.set_ylabel("回撤 (%)")
    ax2.set_xlabel("日期")
    ax2.grid(alpha=0.3)

    fig.tight_layout()
    return fig


def _fig_to_base64(fig: plt.Figure) -> str:
    buf = BytesIO()
    fig.savefig(buf, format="png", dpi=120)
    plt.close(fig)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def generate_html_report(
    equity_curve: pd.DataFrame,
    df: pd.DataFrame,
    initial_cash: float,
    metrics: dict,
    trade_stats: dict,
    symbol: str,
    strategy_name: str,
    output_path: str,
) -> str:
    fig = plot_equity_curve(equity_curve, df, initial_cash, title=f"{symbol} - {strategy_name}")
    img_b64 = _fig_to_base64(fig)

    def fmt_pct(x):
        return f"{x * 100:.2f}%"

    rows = [
        ("总收益率", fmt_pct(metrics["total_return"])),
        ("年化收益率", fmt_pct(metrics["annual_return"])),
        ("最大回撤", fmt_pct(metrics["max_drawdown"])),
        ("年化波动率", fmt_pct(metrics["annual_volatility"])),
        ("夏普比率", f"{metrics['sharpe_ratio']:.2f}"),
        ("交易笔数", str(metrics["num_trades"])),
        ("完整交易回合数", str(trade_stats["num_round_trips"])),
        ("胜率", fmt_pct(trade_stats["win_rate"])),
        ("期末权益", f"{metrics['final_equity']:.2f} 元"),
    ]
    rows_html = "\n".join(f"<tr><td>{k}</td><td>{v}</td></tr>" for k, v in rows)

    html = f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>{symbol} 回测报告</title>
<style>
body {{ font-family: -apple-system, "Microsoft YaHei", sans-serif; margin: 2rem; color: #222; }}
table {{ border-collapse: collapse; margin-top: 1rem; }}
td, th {{ border: 1px solid #ddd; padding: 6px 14px; text-align: left; }}
img {{ max-width: 100%; margin-top: 1rem; }}
</style>
</head>
<body>
<h1>{symbol} 回测报告 - {strategy_name}</h1>
<img src="data:image/png;base64,{img_b64}" alt="净值曲线">
<h2>绩效指标</h2>
<table>{rows_html}</table>
</body>
</html>
"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)
    return output_path
