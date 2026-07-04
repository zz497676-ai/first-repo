# M1 Max 本地大模型指南（32GB 统一内存）

32GB 统一内存的 M1 Max 是玩本地大模型很不错的机器——统一内存架构下 GPU 能直接吃满这 32GB，比很多游戏本的独显还舒服。

## 先搭好环境

- **Ollama**——最省心，一条命令拉模型：

  ```bash
  brew install ollama
  ollama run qwen2.5:14b
  ```

- **LM Studio**——图形界面，适合不想敲命令行，还能看 token/s、显存占用。
- **MLX**（Apple 自家框架）——针对 Apple Silicon 优化过，同样参数量下比 llama.cpp/Ollama 快不少，推荐进阶折腾。`mlx-lm` 可以直接 pip 装。

## 模型怎么选（32GB 的甜蜜区间）

- **7B-14B 模型**：随便跑，速度快（Qwen2.5、Llama3.1、Mistral 这些），Q4 量化后几个 G，回复流畅
- **30B 左右**：Q4 量化能跑，但速度会明显变慢，适合不追求实时对话的场景
- **70B**：理论能塞进去（Q4 大概 40GB 左右，可能会用到 swap），但基本卡成 PPT，不建议日常用

国产模型里 Qwen2.5 系列在 M1 Max 上口碑很好，中文能力强，推荐先试它。

## 玩点花的

- 本地跑一个"角色扮演/嵌套人格"聊天机器人，配上 TTS（比如本地的 Coqui 或者调用系统语音合成）做成语音助手
- 接入 Home Assistant 做本地离线的智能家居语音控制，不用担心隐私上传云端
- Stable Diffusion（用 `diffusers` + MPS 后端）本地跑图像生成，32GB 内存生成 1024x1024 完全没问题
- 搭个本地 RAG 知识库，把自己的笔记/论文喂进去，用 Ollama + LangChain/LlamaIndex 做个"私人知识助手"
- 多模型接力/辩论：写个脚本让两个本地小模型互相"辩论"一个话题，挺好玩的 demo

## 搞点有用的

- **代码助手**：本地跑 Qwen2.5-Coder 或者 DeepSeek-Coder，配合 Continue.dev 插件接入 VS Code，写代码时本地补全，不联网不花钱
- **文档/邮件总结机器人**：批量处理 PDF、会议记录，本地跑省得数据外泄
- **微调（Fine-tune）**：用 MLX 的 LoRA 微调工具，在自己的数据上微调一个 7B 模型做垂直领域助手，32GB 内存做 LoRA 微调完全够用
- **API 网关**：用 Ollama 起个本地 OpenAI 兼容接口，所有第三方支持 OpenAI API 的工具（比如一些效率软件插件）都能白嫖本地模型，不花钱还快
