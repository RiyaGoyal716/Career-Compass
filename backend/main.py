from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PyPDF2 import PdfReader
import openai
import os
import io
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set Groq API credentials
openai.api_key = os.getenv("OPENAI_API_KEY")
openai.api_base = "https://api.groq.com/openai/v1" # type: ignore

@app.post("/analyze")
async def analyze_fit(resume: UploadFile = File(...), job_description: str = Form(...)):
    try:
        contents = await resume.read()
        pdf = PdfReader(io.BytesIO(contents))
        resume_text = ""
        for page in pdf.pages:
            resume_text += page.extract_text() or ""

        if not resume_text.strip():
            return JSONResponse(status_code=400, content={"error": "❌ Failed to extract text from the PDF."})

        prompt = f"""
        Given this resume:

        {resume_text}

        and this job description:

        {job_description}

        How well does the candidate match the role?
        Be detailed and mention any gaps or improvements needed.
        """

        response = openai.ChatCompletion.create( # type: ignore
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": prompt}]
        )

        return {"result": response.choices[0].message["content"]}

    except Exception as e:
        print("❌ Backend Error:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})
