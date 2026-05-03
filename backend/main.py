import os
import smtplib
from email.message import EmailMessage
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Portfolio Backend")

# Allow requests from the frontend (adjust in production if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str

@app.post("/api/contact")
async def send_contact_email(form: ContactForm):
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 465))
    sender_email = os.getenv("EMAIL_ADDRESS")
    sender_password = os.getenv("EMAIL_APP_PASSWORD")
    receiver_email = os.getenv("RECEIVER_EMAIL", sender_email)

    if not sender_email or not sender_password:
        print("\n" + "="*50)
        print("MOCK EMAIL (Credentials missing in .env)")
        print(f"From: {form.email}")
        print(f"Name: {form.name}")
        print(f"Message:\n{form.message}")
        print("="*50 + "\n")
        return {"message": "Email logged successfully! (Update .env to send real emails)"}

    # Format the email
    msg = EmailMessage()
    msg.set_content(f"New message from your portfolio!\n\nName: {form.name}\nEmail: {form.email}\n\nMessage:\n{form.message}")
    msg["Subject"] = f"Portfolio Contact: {form.name}"
    msg["From"] = sender_email
    msg["To"] = receiver_email

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
                server.login(sender_email, sender_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)
        return {"message": "Email sent successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
