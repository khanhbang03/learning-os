import io
import json
import os
import uuid
from typing import Dict, List

import io
import json
import os
import uuid
from typing import Dict, List

import numpy as np
import openai
import PyPDF2
import chromadb
from chromadb.config import Settings
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY in environment")

openai.api_key = OPENAI_API_KEY
EMBEDDING_MODEL = "text-embedding-3-small"
CHAT_MODEL = "gpt-4o-mini"

chroma_client = chromadb.Client(
    Settings(chroma_db_impl="duckdb+parquet", persist_directory="./chroma_db")
)
collection = chroma_client.get_or_create_collection(
    name="learning_os_documents",
    metadata={"project": "learning_os_demo"},
)

app = FastAPI(title="Learning OS Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

documents: Dict[str, Dict] = {}


class UploadResponse(BaseModel):
    document_id: str
    summary: str
    quiz: List[str]
    flashcards: List[str]
    study_plan: str


class ChatRequest(BaseModel):
    document_id: str
    question: str


class ChatResponse(BaseModel):
    answer: str


@app.get("/status")
def status():
    return {"status": "ok", "documents": len(documents)}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n".join(pages)


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 150) -> List[str]:
    text = text.replace("\n", " ")
    words = text.split(" ")
    chunks = []
    i = 0
    while i < len(words):
        chunk = words[i : i + chunk_size]
        chunks.append(" ".join(chunk).strip())
        i += chunk_size - overlap
    return [chunk for chunk in chunks if chunk]


def create_embeddings(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    response = openai.Embedding.create(model=EMBEDDING_MODEL, input=texts)
    return [item["embedding"] for item in response["data"]]


def cosine_similarity(a: List[float], b: List[float]) -> float:
    a_np = np.asarray(a, dtype=np.float32)
    b_np = np.asarray(b, dtype=np.float32)
    denom = np.linalg.norm(a_np) * np.linalg.norm(b_np)
    if denom == 0:
        return 0.0
    return float(np.dot(a_np, b_np) / denom)


def rank_relevant_chunks(query: str, chunks: List[str], embeddings: List[List[float]], top_k: int = 3) -> List[str]:
    query_embedding = create_embeddings([query])[0]
    scores = [cosine_similarity(query_embedding, chunk_emb) for chunk_emb in embeddings]
    ranked = sorted(zip(scores, chunks), key=lambda pair: pair[0], reverse=True)
    return [chunk for _, chunk in ranked[:top_k]]


def parse_json_response(raw_text: str) -> Dict:
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        sections = {"summary": "", "quiz": [], "flashcards": [], "study_plan": ""}
        current = None
        for line in raw_text.splitlines():
            line = line.strip()
            if line.lower().startswith("summary"):
                current = "summary"
                continue
            if line.lower().startswith("quiz"):
                current = "quiz"
                continue
            if line.lower().startswith("flashcards"):
                current = "flashcards"
                continue
            if line.lower().startswith("study plan"):
                current = "study_plan"
                continue
            if not line:
                continue
            if current == "summary":
                sections["summary"] += (line + " ")
            elif current in {"quiz", "flashcards"}:
                sections[current].append(line)
            elif current == "study_plan":
                sections["study_plan"] += (line + " ")
        sections["summary"] = sections["summary"].strip()
        sections["study_plan"] = sections["study_plan"].strip()
        return sections


def generate_learning_content(text: str) -> Dict:
    prompt = (
        "Bạn là một AI Learning OS chuyên viên trợ giúp học tập. Dựa trên nội dung tài liệu, hãy tạo ra một phản hồi JSON hợp lệ với các trường:\n"
        "summary: Tóm tắt ngắn gọn những ý chính, ưu tiên phần cốt lõi và từ khoá quan trọng.\n"
        "quiz: Một danh sách 3 câu hỏi kiểm tra hiểu biết với 4 lựa chọn, nhưng chỉ trả về câu hỏi.\n"
        "flashcards: Một danh sách 5 flashcard ngắn, mỗi flashcard chỉ là một câu ngắn gọn.\n"
        "study_plan: Kế hoạch học tập 1 ngày với thời lượng, mục tiêu, và bước thực hành cụ thể.\n"
        "Trả lời chỉ bằng JSON, không có giải thích bổ sung.\n\n"
        f"Nội dung tài liệu:\n{text[:4000]}"
    )
    response = openai.ChatCompletion.create(
        model=CHAT_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "Bạn là một trợ lý học tập thân thiện, cá nhân hóa, phù hợp với người học đại học hoặc người mới bắt đầu. "
                    "Giúp họ hiểu nhanh, ghi nhớ lâu và xây dựng lộ trình ôn tập."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.25,
    )
    raw_answer = response["choices"][0]["message"]["content"].strip()
    return parse_json_response(raw_answer)


@app.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận file PDF hoặc TXT.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="File trống.")

    if file.filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(contents)
    else:
        text = contents.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Không trích xuất được nội dung từ file.")

    chunks = chunk_text(text)
    embeddings = create_embeddings(chunks)
    document_id = str(uuid.uuid4())
    chunk_ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]

    collection.add(
        ids=chunk_ids,
        documents=chunks,
        metadatas=[{"document_id": document_id, "source": file.filename} for _ in chunks],
        embeddings=embeddings,
    )
    chroma_client.persist()

    documents[document_id] = {
        "source": file.filename,
        "chunks": chunks,
        "chunk_ids": chunk_ids,
    }

    content = generate_learning_content(text)
    return UploadResponse(document_id=document_id, **content)


@app.post("/chat", response_model=ChatResponse)
async def chat_document(request: ChatRequest):
    stored = documents.get(request.document_id)
    if not stored:
        raise HTTPException(status_code=404, detail="Document ID không tìm thấy.")

    query_result = collection.query(
        query_texts=[request.question],
        n_results=3,
        where={"document_id": request.document_id},
        include=["documents", "metadatas"],
    )
    relevant_chunks = query_result["documents"][0] if query_result["documents"] else []
    if not relevant_chunks:
        raise HTTPException(status_code=404, detail="Không tìm thấy đoạn nội dung phù hợp.")

    context = "\n\n---\n\n".join(relevant_chunks)
    prompt = (
        "Bạn là một AI Tutor dành cho sinh viên và người đi làm muốn học nhanh. "
        "Dựa trên đoạn trích sau và câu hỏi, giải thích rõ ràng, thân thiện, dễ hiểu và kèm ví dụ khi cần.\n\n"
        f"Đoạn trích:\n{context}\n\n"
        f"Câu hỏi: {request.question}\n\n"
        "Hãy trả lời bằng tiếng Việt, trọng tâm vào nội dung vừa tìm được, và giữ câu trả lời ngắn gọn nhưng đủ ý."
    )

    response = openai.ChatCompletion.create(
        model=CHAT_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "Bạn là một AI Tutor thông minh, năng động, và luôn giải thích theo phong cách học đường: cụ thể, trực quan, dễ nhớ."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.35,
    )
    answer = response["choices"][0]["message"]["content"].strip()
    return ChatResponse(answer=answer)
