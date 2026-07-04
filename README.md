# A股策略回测系统

一个轻量级的中国A股策略回测工具：拉取历史行情（本地缓存）、编写/运行策略、模拟A股交易规则（T+1、整手、佣金、印花税、滑点），并生成可视化报告。

## 安装

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 快速开始

```bash
# 查看可用策略
python -m backtester list-strategies

# 运行均线交叉策略回测，并生成HTML报告
python -m backtester run \
  --symbol 600519 \
  --strategy ma_cross \
  --param fast_window=5 --param slow_window=20 \
  --start 2022-01-01 --end 2023-12-31 \
  --cash 100000 \
  --report report.html
```

`--symbol` 使用6位A股代码（如贵州茅台 `600519`）。首次运行会通过 [akshare](https://github.com/akfamily/akshare) 拉取行情并缓存到 `data_cache/`，之后同区间的回测会直接读缓存；加 `--refresh` 可强制重新拉取。

## 项目结构

```
backtester/
  data.py          # 历史行情获取与本地缓存
  engine.py        # 回测引擎（T+1、整手、佣金、印花税、滑点）
  metrics.py       # 绩效指标（收益率、回撤、夏普比率、胜率）
  report.py        # 净值曲线图与HTML报告
  cli.py           # 命令行入口
  strategies/
    base.py        # 策略基类
    ma_cross.py     # 均线交叉策略示例
    rsi.py          # RSI 均值回归策略示例
tests/             # 单元测试（合成数据，不依赖网络）
```

## 编写自己的策略

继承 `backtester.strategies.base.Strategy`，实现 `generate_signals(df) -> pd.Series`，返回每日目标仓位（`1`=持仓，`0`=空仓）：

```python
from backtester.strategies.base import Strategy

class MyStrategy(Strategy):
    name = "my_strategy"

    def generate_signals(self, df):
        ...  # 基于 df["open"/"high"/"low"/"close"/"volume"] 计算信号
```

在 `backtester/strategies/__init__.py` 的 `STRATEGY_REGISTRY` 中注册后，即可通过 `--strategy my_strategy` 调用。

## 回测规则说明

- 信号在 T 日收盘生成，实际在 T+1 日**开盘价**成交，避免未来函数。
- 默认开启 T+1（当日买入的股份，下一交易日起才可卖出），可用 `--no-t1` 关闭。
- 按 100 股整手买入，佣金双向收取（默认万2.5，最低5元），印花税仅卖出收取（默认万5）。
- 当前仅支持单只股票、满仓/空仓二元仓位；如需多标的或仓位比例控制，需扩展 `engine.py`。

## 运行测试

```bash
python -m unittest discover -s tests
```
