import os
import requests
import json
from dotenv import load_dotenv

# load environment variables
load_dotenv()
webhook_url = os.getenv("WEBHOOK_URL")
webhook_secret = os.getenv("WEBHOOK_SECRET")

def create_response(status_code, data=None):
    """Create a properly formatted response"""
    response = {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        }
    }
    if data:
        response["headers"]["Content-Type"] = "application/json"
        response["body"] = json.dumps(data)
    return response


def create_issue(email, request):
    headers = {
        "Content-Type": "application/json",
        "X-Automation-Webhook-Token": webhook_secret
    }
    data = {
        "email": email,
        "request": request
    }
    requests.post(webhook_url, headers=headers, json=data)


def handler(event, context):
    try:
        body = json.loads(event.get("body", {}))
        fields = body.get("data", {}).get("fields", [])
        fields = body["data"]["fields"]
        for field in fields:
            if field["key"] is "question_DzMB7b":
                email = field["value"]
            if field["key"] is "question_lrvB65":
                request = field["value"][0]
        #create_issue(email, request)
        return create_response(200, {"email": email, "request": request})
    except Exception as e:
        return create_response(500, {
            "success": False,
            "error": f"Internal error: {str(e)}"
        })
