import os
import smtplib
import asyncio
from email.message import EmailMessage
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import httpx

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

    def _send_sync():
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10.0) as server:
                server.login(sender_email, sender_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_server, smtp_port, timeout=10.0) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)

    try:
        await asyncio.to_thread(_send_sync)
        return {"message": "Email sent successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@app.get("/api/stats/github")
async def get_github_stats():
    username = "anshulverma1321"
    headers = {}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"
    
    async with httpx.AsyncClient() as client:
        try:
            # Fetch profile
            profile_response = await client.get(f"https://api.github.com/users/{username}", headers=headers, timeout=10.0)
            profile_response.raise_for_status()
            profile_data = profile_response.json()
            
            # Fetch repos (to sum stars)
            repos_response = await client.get(f"https://api.github.com/users/{username}/repos?per_page=100", headers=headers, timeout=10.0)
            repos_response.raise_for_status()
            repos_data = repos_response.json()
            
            stars = sum(repo.get("stargazers_count", 0) for repo in repos_data) if isinstance(repos_data, list) else 13
            
            return {
                "public_repos": profile_data.get("public_repos", 28),
                "followers": profile_data.get("followers", 7),
                "stars": stars
            }
        except Exception as e:
            # Fallback values matching actual screenshot
            return {
                "public_repos": 28,
                "followers": 7,
                "stars": 13
            }

@app.get("/api/stats/leetcode")
async def get_leetcode_stats():
    username = "anshulverma_1"
    query = """
    query userProblemsSolved($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
    """
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://leetcode.com/graphql",
                json={"query": query, "variables": {"username": username}},
                headers={
                    "Content-Type": "application/json",
                    "Referer": "https://leetcode.com"
                },
                timeout=10.0
            )
            response.raise_for_status()
            res_data = response.json()
            
            matched_user = res_data.get("data", {}).get("matchedUser")
            if not matched_user:
                raise ValueError("User not found or query failed")
                
            ac_subs = matched_user.get("submitStats", {}).get("acSubmissionNum", [])
            
            stats = {}
            for item in ac_subs:
                diff = item.get("difficulty")
                count = item.get("count")
                if diff == "All":
                    stats["totalSolved"] = count
                elif diff == "Easy":
                    stats["easySolved"] = count
                elif diff == "Medium":
                    stats["mediumSolved"] = count
                elif diff == "Hard":
                    stats["hardSolved"] = count
                    
            return {
                "totalSolved": stats.get("totalSolved", 71),
                "easySolved": stats.get("easySolved", 43),
                "mediumSolved": stats.get("mediumSolved", 27),
                "hardSolved": stats.get("hardSolved", 1)
            }
        except Exception as e:
            return {
                "totalSolved": 71,
                "easySolved": 43,
                "mediumSolved": 27,
                "hardSolved": 1
            }
