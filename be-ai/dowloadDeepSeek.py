from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model_name = "deepseek-ai/deepseek-mistral-7b"

# Tải model và tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16, device_map="auto")

# Lưu model local
model.save_pretrained("./deepseek-model")
tokenizer.save_pretrained("./deepseek-model")
