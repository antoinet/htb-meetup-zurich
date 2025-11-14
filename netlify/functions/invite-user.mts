import type { Context } from "@netlify/functions";

async function getXsrfToken(): Promise<string> {
    const htb_session = Netlify.env.get("HTB_SESSION");
    const url = "https://enterprise.hackthebox.com/api/v1/connections/status";
    const response = await fetch(url, {
        headers: {
            "Cookie": `hack_the_box_enterprise_platform_session=${htb_session};`
        }
    });
    const cookies = response.headers.getSetCookie();
    const xsrf_cookie = cookies.find(cookie => cookie.startsWith("XSRF-TOKEN="));
    const xsrf_token = decodeURIComponent(xsrf_cookie?.split(";")[0].split("=")[1] ?? "");
    return xsrf_token;
}

async function inviteUser(email: string) {
    const htb_session = Netlify.env.get("HTB_SESSION");
    const xsrf_token = await getXsrfToken();
    const url = "https://enterprise.hackthebox.com/api/v1/user-management/invite";
    const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `hack_the_box_enterprise_platform_session=${htb_session};`,
                "X-Xsrf-Token": xsrf_token,
                "Origin": "https://enterprise.hackthebox.com"
            },
            body: JSON.stringify({ 
                users: [
                    { email: email, role: "Guest" }
                ],
                license: null
            })
        });
    const payload = await response.json();
    if (payload.data.length > 0 && payload.data[0].errors) {
        throw new Error(payload.data[0].errors[0]);
    }
}

export default async (req: Request, context: Context) => {
    if (req.method !== "POST") {
        console.error("Method not allowed");
        return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { status: 405, headers: { "Content-Type": "application/json" } }
        );
    }

    const my_secret = req.headers.get("x-my-secret");
    if (my_secret !== Netlify.env.get("MY_SECRET")) {
        console.error("Missing or wrong x-my-secret header value");
        return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const payload = await req.json();
        await inviteUser(payload.email);
        console.log(`Sent invitation for ${payload.email}`);
        return new Response(
            JSON.stringify({ message: "Success" }), 
            { status: 200, headers: { "Content-Type": "application/json"} }
        );
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
}