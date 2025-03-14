import sys
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_path = "./deepseek-model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path, torch_dtype=torch.float16, device_map="auto")

user_input = sys.argv[1]

inputs = tokenizer(user_input, return_tensors="pt").to("cuda")
output = model.generate(**inputs, max_new_tokens=100)
response = tokenizer.decode(output[0], skip_special_tokens=True)

print(response)
