from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import uvicorn
import numpy as np
import os
import gc
from contextlib import asynccontextmanager

modelBase = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    # モデルのロード
    # model_name = 'sentence-transformers/stsb-xlm-r-multilingual'
    print("Loading the model...")

    model_name = 'Snowflake/snowflake-arctic-embed-l-v2.0'
    # If you do not set device to cpu, memory leak will happen.
    # Maybe, FastAPI creates multiple thread and model will be copied on each threads.
    modelBase["text"] = SentenceTransformer(model_name, device="cpu")
    yield
    # Clean up the ML models and release the resources
    print("Clearing the model...")
    modelBase.clear()

app = FastAPI(lifespan=lifespan)


class TextInput(BaseModel):
    text: str

class CosineInput(BaseModel):
    text1: str
    text2: str

@app.post("/vectorize")
async def vectorize_text(input_data: TextInput):
    # 入力テキストを取得
    text = input_data.text
    tokenizer = modelBase["text"].tokenizer

    # 最大トークン数
    max_length = modelBase["text"].max_seq_length

    # テキストをトークン化してトークン数を確認
    tokenized = tokenizer(text, truncation=False, return_tensors="pt")
    # トークン数を取得
    num_tokens = len(tokenized['input_ids'][0]) 

    print(f"Number of tokens: {num_tokens} max_length: {max_length}")

    if num_tokens > max_length:
        raise HTTPException(status_code=404, detail="The number of tokens exceeds the maximum length.")

    # ベクトル化
    embeddings = modelBase["text"].encode([text])

    print(f"Embeddings shape: {embeddings.shape}")
    
    # embeddingsはサイズ (1, embedding_dim) の2次元配列
    vector = embeddings[0].tolist()  # Pythonのリスト形式に変換
    gc.collect()
    return {"vector": vector}

@app.post("/cosine_similarity")
async def cosine_similarity(input_data: CosineInput):
    # 2つのテキストそれぞれをエンコード
    embeddings = modelBase["text"].encode([input_data.text1, input_data.text2])
    vec1, vec2 = embeddings[0], embeddings[1]

    # コサイン類似度計算
    # cos_sim = (vec1 ⋅ vec2) / (||vec1|| * ||vec2||)
    cos_sim = float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))

    return {"cosine_similarity": cos_sim}


if __name__ == "__main__":
    # uvicornコマンドで以下のようにサーバー起動可能
    # uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    uvicorn.run(app, host="0.0.0.0", port=8000)