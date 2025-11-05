import type { Context } from "@netlify/functions";


export default async (req: Request, context: Context) => {
    const webhook_url = Netlify.env.get("WEBHOOK_URL");
    const webhook_secret = Netlify.env.get("WEBHOOK_SECRET");

    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { status: 405, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const payload = await req.json();
        const email = payload.data.fields.find((f: any) => f.type === "INPUT_EMAIL").value;
        const request = payload.data.fields.find((f: any) => f.type === "MULTIPLE_CHOICE").value[0];

        const response = await fetch(webhook_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Automation-Webhook-Token": webhook_secret
            },
            body: JSON.stringify({ email, request})
        });
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response(
            JSON.stringify({
                error: "Internal error",
                message: error instanceof Error ? error.message : "Unknown error"
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ message: "Request submitted" }), 
        { status: 200, headers: { "Content-Type": "application/json"} }
    );
}