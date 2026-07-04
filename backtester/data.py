"""A股历史行情获取与本地缓存。"""

from pathlib import Path

import pandas as pd

CACHE_DIR = Path(__file__).resolve().parent.parent / "data_cache"

COLUMN_MAP = {
    "日期": "date",
    "开盘": "open",
    "收盘": "close",
    "最高": "high",
    "最低": "low",
    "成交量": "volume",
    "成交额": "amount",
    "换手率": "turnover",
}


def _cache_path(symbol: str, adjust: str) -> Path:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return CACHE_DIR / f"{symbol}_{adjust or 'none'}.csv"


def fetch_stock_history(
    symbol: str,
    start_date: str,
    end_date: str,
    adjust: str = "qfq",
    use_cache: bool = True,
    refresh: bool = False,
) -> pd.DataFrame:
    """获取A股日线历史行情（默认前复权），优先读取本地缓存。

    symbol: 6位股票代码，如 "600519"
    adjust: "qfq"（前复权）、"hfq"（后复权）或 ""（不复权）
    """
    start_ts = pd.Timestamp(start_date)
    end_ts = pd.Timestamp(end_date)
    path = _cache_path(symbol, adjust)

    df = None
    if use_cache and not refresh and path.exists():
        cached = pd.read_csv(path, parse_dates=["date"])
        if not cached.empty and cached["date"].min() <= start_ts and cached["date"].max() >= end_ts:
            df = cached

    if df is None:
        import akshare as ak

        raw = ak.stock_zh_a_hist(
            symbol=symbol,
            period="daily",
            start_date=start_ts.strftime("%Y%m%d"),
            end_date=end_ts.strftime("%Y%m%d"),
            adjust=adjust,
        )
        if raw.empty:
            raise ValueError(f"未获取到股票 {symbol} 的行情数据，请检查代码或日期范围。")
        raw = raw.rename(columns=COLUMN_MAP)
        df = raw[["date", "open", "high", "low", "close", "volume", "amount", "turnover"]].copy()
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date").reset_index(drop=True)
        if use_cache:
            df.to_csv(path, index=False)

    mask = (df["date"] >= start_ts) & (df["date"] <= end_ts)
    return df.loc[mask].reset_index(drop=True)
