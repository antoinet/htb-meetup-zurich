
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/invite-user.mts
async function getXsrfToken() {
  const htb_session = Netlify.env.get("HTB_SESSION");
  const url = "https://enterprise.hackthebox.com/api/v1/connections/status";
  const response = await fetch(url, {
    headers: {
      "Cookie": `hack_the_box_enterprise_platform_session=${htb_session};`
    }
  });
  const cookies = response.headers.getSetCookie();
  const xsrf_cookie = cookies.find((cookie) => cookie.startsWith("XSRF-TOKEN="));
  const xsrf_token = decodeURIComponent(xsrf_cookie?.split(";")[0].split("=")[1] ?? "");
  return xsrf_token;
}
async function inviteUser(email) {
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
        { email, role: "Guest" }
      ],
      license: null
    })
  });
  const payload = await response.json();
  if (payload.data.length > 0 && payload.data[0].errors) {
    throw new Error(payload.data[0].errors[0]);
  }
}
var invite_user_default = async (req, context) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    const payload = await req.json();
    console.log(`Sending invitation for ${payload.email}`);
    await inviteUser(payload.email);
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
    JSON.stringify({ message: "Success" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
export {
  invite_user_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvaW52aXRlLXVzZXIubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7IENvbnRleHQgfSBmcm9tIFwiQG5ldGxpZnkvZnVuY3Rpb25zXCI7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRYc3JmVG9rZW4oKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIGNvbnN0IGh0Yl9zZXNzaW9uID0gTmV0bGlmeS5lbnYuZ2V0KFwiSFRCX1NFU1NJT05cIik7XHJcbiAgICBjb25zdCB1cmwgPSBcImh0dHBzOi8vZW50ZXJwcmlzZS5oYWNrdGhlYm94LmNvbS9hcGkvdjEvY29ubmVjdGlvbnMvc3RhdHVzXCI7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgXCJDb29raWVcIjogYGhhY2tfdGhlX2JveF9lbnRlcnByaXNlX3BsYXRmb3JtX3Nlc3Npb249JHtodGJfc2Vzc2lvbn07YFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY29uc3QgY29va2llcyA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0U2V0Q29va2llKCk7XHJcbiAgICBjb25zdCB4c3JmX2Nvb2tpZSA9IGNvb2tpZXMuZmluZChjb29raWUgPT4gY29va2llLnN0YXJ0c1dpdGgoXCJYU1JGLVRPS0VOPVwiKSk7XHJcbiAgICBjb25zdCB4c3JmX3Rva2VuID0gZGVjb2RlVVJJQ29tcG9uZW50KHhzcmZfY29va2llPy5zcGxpdChcIjtcIilbMF0uc3BsaXQoXCI9XCIpWzFdID8/IFwiXCIpO1xyXG4gICAgcmV0dXJuIHhzcmZfdG9rZW47XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGludml0ZVVzZXIoZW1haWw6IHN0cmluZykge1xyXG4gICAgY29uc3QgaHRiX3Nlc3Npb24gPSBOZXRsaWZ5LmVudi5nZXQoXCJIVEJfU0VTU0lPTlwiKTtcclxuICAgIGNvbnN0IHhzcmZfdG9rZW4gPSBhd2FpdCBnZXRYc3JmVG9rZW4oKTtcclxuICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly9lbnRlcnByaXNlLmhhY2t0aGVib3guY29tL2FwaS92MS91c2VyLW1hbmFnZW1lbnQvaW52aXRlXCI7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgICAgICAgIFwiQ29va2llXCI6IGBoYWNrX3RoZV9ib3hfZW50ZXJwcmlzZV9wbGF0Zm9ybV9zZXNzaW9uPSR7aHRiX3Nlc3Npb259O2AsXHJcbiAgICAgICAgICAgICAgICBcIlgtWHNyZi1Ub2tlblwiOiB4c3JmX3Rva2VuLFxyXG4gICAgICAgICAgICAgICAgXCJPcmlnaW5cIjogXCJodHRwczovL2VudGVycHJpc2UuaGFja3RoZWJveC5jb21cIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IFxyXG4gICAgICAgICAgICAgICAgdXNlcnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7IGVtYWlsOiBlbWFpbCwgcm9sZTogXCJHdWVzdFwiIH1cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBsaWNlbnNlOiBudWxsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgaWYgKHBheWxvYWQuZGF0YS5sZW5ndGggPiAwICYmIHBheWxvYWQuZGF0YVswXS5lcnJvcnMpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocGF5bG9hZC5kYXRhWzBdLmVycm9yc1swXSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChyZXE6IFJlcXVlc3QsIGNvbnRleHQ6IENvbnRleHQpID0+IHtcclxuICAgIGlmIChyZXEubWV0aG9kICE9PSBcIlBPU1RcIikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXHJcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiTWV0aG9kIG5vdCBhbGxvd2VkXCIgfSksXHJcbiAgICAgICAgICAgIHsgc3RhdHVzOiA0MDUsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZXEuanNvbigpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBTZW5kaW5nIGludml0YXRpb24gZm9yICR7cGF5bG9hZC5lbWFpbH1gKTtcclxuICAgICAgICBhd2FpdCBpbnZpdGVVc2VyKHBheWxvYWQuZW1haWwpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcHJvY2Vzc2luZyByZXF1ZXN0OlwiLCBlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShcclxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgZXJyb3I6IFwiSW50ZXJuYWwgZXJyb3JcIixcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIHsgc3RhdHVzOiA1MDAsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxyXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogXCJTdWNjZXNzXCIgfSksIFxyXG4gICAgICAgIHsgc3RhdHVzOiAyMDAsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCJ9IH1cclxuICAgICk7XHJcbn0iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBRUEsZUFBZSxlQUFnQztBQUMzQyxRQUFNLGNBQWMsUUFBUSxJQUFJLElBQUksYUFBYTtBQUNqRCxRQUFNLE1BQU07QUFDWixRQUFNLFdBQVcsTUFBTSxNQUFNLEtBQUs7QUFBQSxJQUM5QixTQUFTO0FBQUEsTUFDTCxVQUFVLDRDQUE0QyxXQUFXO0FBQUEsSUFDckU7QUFBQSxFQUNKLENBQUM7QUFDRCxRQUFNLFVBQVUsU0FBUyxRQUFRLGFBQWE7QUFDOUMsUUFBTSxjQUFjLFFBQVEsS0FBSyxZQUFVLE9BQU8sV0FBVyxhQUFhLENBQUM7QUFDM0UsUUFBTSxhQUFhLG1CQUFtQixhQUFhLE1BQU0sR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRTtBQUNwRixTQUFPO0FBQ1g7QUFFQSxlQUFlLFdBQVcsT0FBZTtBQUNyQyxRQUFNLGNBQWMsUUFBUSxJQUFJLElBQUksYUFBYTtBQUNqRCxRQUFNLGFBQWEsTUFBTSxhQUFhO0FBQ3RDLFFBQU0sTUFBTTtBQUNaLFFBQU0sV0FBVyxNQUFNLE1BQU0sS0FBSztBQUFBLElBQzFCLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxNQUNMLGdCQUFnQjtBQUFBLE1BQ2hCLFVBQVUsNENBQTRDLFdBQVc7QUFBQSxNQUNqRSxnQkFBZ0I7QUFBQSxNQUNoQixVQUFVO0FBQUEsSUFDZDtBQUFBLElBQ0EsTUFBTSxLQUFLLFVBQVU7QUFBQSxNQUNqQixPQUFPO0FBQUEsUUFDSCxFQUFFLE9BQWMsTUFBTSxRQUFRO0FBQUEsTUFDbEM7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNiLENBQUM7QUFBQSxFQUNMLENBQUM7QUFDTCxRQUFNLFVBQVUsTUFBTSxTQUFTLEtBQUs7QUFDcEMsTUFBSSxRQUFRLEtBQUssU0FBUyxLQUFLLFFBQVEsS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUNuRCxVQUFNLElBQUksTUFBTSxRQUFRLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQUEsRUFDN0M7QUFDSjtBQUVBLElBQU8sc0JBQVEsT0FBTyxLQUFjLFlBQXFCO0FBQ3JELE1BQUksSUFBSSxXQUFXLFFBQVE7QUFDdkIsV0FBTyxJQUFJO0FBQUEsTUFDUCxLQUFLLFVBQVUsRUFBRSxPQUFPLHFCQUFxQixDQUFDO0FBQUEsTUFDOUMsRUFBRSxRQUFRLEtBQUssU0FBUyxFQUFFLGdCQUFnQixtQkFBbUIsRUFBRTtBQUFBLElBQ25FO0FBQUEsRUFDSjtBQUVBLE1BQUk7QUFDQSxVQUFNLFVBQVUsTUFBTSxJQUFJLEtBQUs7QUFDL0IsWUFBUSxJQUFJLDBCQUEwQixRQUFRLEtBQUssRUFBRTtBQUNyRCxVQUFNLFdBQVcsUUFBUSxLQUFLO0FBQUEsRUFDbEMsU0FBUyxPQUFPO0FBQ1osWUFBUSxNQUFNLDZCQUE2QixLQUFLO0FBQ2hELFdBQU8sSUFBSTtBQUFBLE1BQ1AsS0FBSyxVQUFVO0FBQUEsUUFDWCxPQUFPO0FBQUEsUUFDUCxTQUFTLGlCQUFpQixRQUFRLE1BQU0sVUFBVTtBQUFBLE1BQ3RELENBQUM7QUFBQSxNQUNELEVBQUUsUUFBUSxLQUFLLFNBQVMsRUFBRSxnQkFBZ0IsbUJBQW1CLEVBQUU7QUFBQSxJQUNuRTtBQUFBLEVBQ0o7QUFFQSxTQUFPLElBQUk7QUFBQSxJQUNQLEtBQUssVUFBVSxFQUFFLFNBQVMsVUFBVSxDQUFDO0FBQUEsSUFDckMsRUFBRSxRQUFRLEtBQUssU0FBUyxFQUFFLGdCQUFnQixtQkFBa0IsRUFBRTtBQUFBLEVBQ2xFO0FBQ0o7IiwKICAibmFtZXMiOiBbXQp9Cg==
