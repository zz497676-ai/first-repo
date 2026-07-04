"""命令行入口：拉取数据、运行回测、生成报告。"""

import argparse
from datetime import date

from .data import fetch_stock_history
from .engine import BacktestConfig, BacktestEngine
from .metrics import compute_metrics, compute_trade_stats
from .report import generate_html_report
from .strategies import STRATEGY_REGISTRY


def build_strategy(name: str, params: dict):
    if name not in STRATEGY_REGISTRY:
        raise ValueError(f"未知策略: {name}，可选: {list(STRATEGY_REGISTRY)}")
    return STRATEGY_REGISTRY[name](**params)


def parse_params(param_list) -> dict:
    params = {}
    for item in param_list or []:
        key, _, value = item.partition("=")
        try:
            value = float(value) if "." in value else int(value)
        except ValueError:
            pass
        params[key] = value
    return params


def cmd_run(args):
    df = fetch_stock_history(args.symbol, args.start, args.end, adjust=args.adjust, refresh=args.refresh)
    strategy = build_strategy(args.strategy, parse_params(args.param))
    signal = strategy.generate_signals(df)

    config = BacktestConfig(
        initial_cash=args.cash,
        commission_rate=args.commission,
        stamp_tax_rate=args.stamp_tax,
        slippage=args.slippage,
        t_plus_1=not args.no_t1,
    )
    result = BacktestEngine(df, signal, config).run()

    metrics = compute_metrics(result.equity_curve, config.initial_cash, result.trades)
    trade_stats = compute_trade_stats(result.trades)

    print(f"股票代码: {args.symbol}  策略: {args.strategy}  区间: {args.start} ~ {args.end}")
    print(f"  总收益率:     {metrics['total_return']:.2%}")
    print(f"  年化收益率:   {metrics['annual_return']:.2%}")
    print(f"  最大回撤:     {metrics['max_drawdown']:.2%}")
    print(f"  年化波动率:   {metrics['annual_volatility']:.2%}")
    print(f"  夏普比率:     {metrics['sharpe_ratio']:.2f}")
    print(f"  交易笔数:     {metrics['num_trades']}")
    print(f"  完整回合数:   {trade_stats['num_round_trips']}")
    print(f"  胜率:         {trade_stats['win_rate']:.2%}")
    print(f"  期末权益:     {metrics['final_equity']:.2f} 元")

    if args.report:
        path = generate_html_report(
            result.equity_curve, df, config.initial_cash, metrics, trade_stats,
            args.symbol, args.strategy, args.report,
        )
        print(f"报告已生成: {path}")


def cmd_list_strategies(args):
    for name, cls in STRATEGY_REGISTRY.items():
        print(f"{name}: {cls.__doc__ or cls.__name__}")


def main():
    parser = argparse.ArgumentParser(description="A股策略回测工具")
    sub = parser.add_subparsers(dest="command", required=True)

    run_p = sub.add_parser("run", help="运行回测")
    run_p.add_argument("--symbol", required=True, help="股票代码，如 600519")
    run_p.add_argument("--strategy", required=True, help="策略名称，见 list-strategies")
    run_p.add_argument("--start", required=True, help="开始日期 YYYY-MM-DD")
    run_p.add_argument("--end", default=date.today().isoformat(), help="结束日期 YYYY-MM-DD，默认今天")
    run_p.add_argument("--cash", type=float, default=100_000.0, help="初始资金")
    run_p.add_argument("--commission", type=float, default=0.00025, help="佣金费率（双向）")
    run_p.add_argument("--stamp-tax", dest="stamp_tax", type=float, default=0.0005, help="印花税率（仅卖出）")
    run_p.add_argument("--slippage", type=float, default=0.0, help="滑点比例")
    run_p.add_argument("--adjust", default="qfq", choices=["qfq", "hfq", ""], help="复权方式")
    run_p.add_argument("--no-t1", action="store_true", help="关闭T+1限制（默认开启）")
    run_p.add_argument("--param", action="append", help="策略参数 key=value，可重复")
    run_p.add_argument("--report", help="生成HTML报告的输出路径")
    run_p.add_argument("--refresh", action="store_true", help="强制刷新缓存数据")
    run_p.set_defaults(func=cmd_run)

    list_p = sub.add_parser("list-strategies", help="列出可用策略")
    list_p.set_defaults(func=cmd_list_strategies)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
