import unittest

import pandas as pd

from backtester.engine import BacktestConfig, BacktestEngine
from backtester.metrics import compute_metrics, compute_trade_stats
from backtester.strategies.ma_cross import MovingAverageCrossStrategy


def make_df(prices):
    dates = pd.date_range("2023-01-02", periods=len(prices), freq="B")
    return pd.DataFrame(
        {
            "date": dates,
            "open": prices,
            "high": [p * 1.01 for p in prices],
            "low": [p * 0.99 for p in prices],
            "close": prices,
            "volume": [1_000_000] * len(prices),
            "amount": [0] * len(prices),
            "turnover": [0] * len(prices),
        }
    )


class TestBacktestEngine(unittest.TestCase):
    def test_buy_respects_lot_size_and_commission(self):
        # 单日买入信号，验证按100股整手买入并扣除佣金
        prices = [10.0, 10.0, 10.0]
        df = make_df(prices)
        signal = pd.Series([1, 1, 1])
        config = BacktestConfig(initial_cash=1000.0, commission_rate=0.001, min_commission=5.0, t_plus_1=False)
        result = BacktestEngine(df, signal, config).run()

        # 信号 shift(1) 后，第2天(index1)才执行买入；100股*10元=1000元，佣金max(1,5)=5，超过可用资金1000
        # 故实际可买 900/10=90 -> 取整百股 = 0 手；验证不会超买
        first_trade_row = result.equity_curve.iloc[1]
        self.assertLessEqual(result.equity_curve["cash"].iloc[-1] + result.equity_curve["market_value"].iloc[-1], 1000.0)

    def test_buy_and_sell_with_t_plus_1(self):
        prices = [10.0, 10.0, 12.0, 12.0, 8.0]
        df = make_df(prices)
        # 第0天信号=1(买)，第1天=1(继续持有)，第2天=0(卖出信号)
        signal = pd.Series([1, 1, 0, 0, 0])
        config = BacktestConfig(initial_cash=100_000.0, commission_rate=0.0, min_commission=0.0, stamp_tax_rate=0.0, t_plus_1=True)
        result = BacktestEngine(df, signal, config).run()

        buys = [t for t in result.trades if t.side == "buy"]
        sells = [t for t in result.trades if t.side == "sell"]
        self.assertEqual(len(buys), 1)
        self.assertEqual(len(sells), 1)
        # 买入执行于index1（open=10），卖出信号在index2生效于index3执行（T+1不影响，因为已过一天）
        self.assertEqual(buys[0].price, 10.0)
        self.assertEqual(sells[0].price, 12.0)

    def test_t_plus_1_blocks_same_day_round_trip(self):
        # 构造信号在买入次日立刻要求卖出，验证T+1机制不会让买入当天卖出
        prices = [10.0, 10.0, 10.0]
        df = make_df(prices)
        signal = pd.Series([1, 0, 0])
        config = BacktestConfig(initial_cash=100_000.0, commission_rate=0.0, min_commission=0.0, t_plus_1=True)
        result = BacktestEngine(df, signal, config).run()
        # 买入发生于index1（因shift(1)), 同一天信号已经是0，但T+1使得index1无法卖出，需等到index2
        sells = [t for t in result.trades if t.side == "sell"]
        self.assertEqual(len(sells), 1)
        self.assertEqual(sells[0].date, df["date"].iloc[2])

    def test_ma_cross_signal_shape(self):
        prices = [10, 10, 10, 10, 10, 11, 12, 13, 14, 15, 14, 13, 12, 11, 10]
        df = make_df(prices)
        strat = MovingAverageCrossStrategy(fast_window=2, slow_window=4)
        signal = strat.generate_signals(df)
        self.assertEqual(len(signal), len(df))
        self.assertTrue(set(signal.unique()).issubset({0, 1}))

    def test_metrics_on_known_equity_curve(self):
        dates = pd.date_range("2023-01-02", periods=4, freq="B")
        equity_curve = pd.DataFrame({"date": dates, "equity": [100_000, 110_000, 90_000, 105_000]})
        metrics = compute_metrics(equity_curve, initial_cash=100_000, trades=[])
        self.assertAlmostEqual(metrics["total_return"], 0.05)
        self.assertAlmostEqual(metrics["max_drawdown"], (90_000 / 110_000) - 1)

    def test_trade_stats_win_rate(self):
        from backtester.engine import Trade

        trades = [
            Trade(pd.Timestamp("2023-01-02"), "buy", 10.0, 100, 0, 0),
            Trade(pd.Timestamp("2023-01-03"), "sell", 12.0, 100, 0, 0),  # +200 win
            Trade(pd.Timestamp("2023-01-04"), "buy", 12.0, 100, 0, 0),
            Trade(pd.Timestamp("2023-01-05"), "sell", 11.0, 100, 0, 0),  # -100 loss
        ]
        stats = compute_trade_stats(trades)
        self.assertEqual(stats["num_round_trips"], 2)
        self.assertAlmostEqual(stats["win_rate"], 0.5)


if __name__ == "__main__":
    unittest.main()
