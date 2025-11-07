
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/add-seat.mts
async function findUser(email) {
  const htb_session = Netlify.env.get("HTB_SESSION");
  const url = `https://enterprise.hackthebox.com/api/v1/user-management/users?per_page=5&page=1&keyword=${email}&is_keyword_compressed=0`;
  const response = await fetch(url, {
    headers: {
      "Cookie": `hack_the_box_enterprise_platform_session=${htb_session};`,
      "Referer": "https://enterprise.hackthebox.com/manage-users?s=asdf"
    }
  });
  const body = await response.json();
  const userid = body.data.find((f) => f.email === email).id;
  return userid;
}
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
async function addSeat(userid) {
  const htb_session = Netlify.env.get("HTB_SESSION");
  const xsrf_token = await getXsrfToken();
  const url = `https://enterprise.hackthebox.com/api/v1/user-management/users/${userid}/licenses/sync`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `hack_the_box_enterprise_platform_session=${htb_session};`,
      "X-Xsrf-Token": xsrf_token,
      "Origin": "https://enterprise.hackthebox.com"
    },
    body: JSON.stringify({
      user_id: userid,
      assigned_licenses: [
        {
          id: 7425,
          channels: [16266],
          expires_at: null
        }
      ],
      removed_licenses: []
    })
  });
}
var add_seat_default = async (req, context) => {
  const htb_session = Netlify.env.get("HTB_SESSION");
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    const payload = await req.json();
    const userid = await findUser(payload.email);
    console.log(`Adding seat for ${payload.email} (userid: ${userid})`);
    await addSeat(userid);
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
  add_seat_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvYWRkLXNlYXQubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7IENvbnRleHQgfSBmcm9tIFwiQG5ldGxpZnkvZnVuY3Rpb25zXCI7XHJcblxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmluZFVzZXIoZW1haWw6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICBjb25zdCBodGJfc2Vzc2lvbiA9IE5ldGxpZnkuZW52LmdldChcIkhUQl9TRVNTSU9OXCIpO1xyXG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZW50ZXJwcmlzZS5oYWNrdGhlYm94LmNvbS9hcGkvdjEvdXNlci1tYW5hZ2VtZW50L3VzZXJzP3Blcl9wYWdlPTUmcGFnZT0xJmtleXdvcmQ9JHtlbWFpbH0maXNfa2V5d29yZF9jb21wcmVzc2VkPTBgO1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgIFwiQ29va2llXCI6IGBoYWNrX3RoZV9ib3hfZW50ZXJwcmlzZV9wbGF0Zm9ybV9zZXNzaW9uPSR7aHRiX3Nlc3Npb259O2AsXHJcbiAgICAgICAgICAgIFwiUmVmZXJlclwiOiBcImh0dHBzOi8vZW50ZXJwcmlzZS5oYWNrdGhlYm94LmNvbS9tYW5hZ2UtdXNlcnM/cz1hc2RmXCJcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICBjb25zdCB1c2VyaWQgPSBib2R5LmRhdGEuZmluZCgoZjogYW55KSA9PiBmLmVtYWlsID09PSBlbWFpbCkuaWQ7XHJcbiAgICByZXR1cm4gdXNlcmlkO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRYc3JmVG9rZW4oKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIGNvbnN0IGh0Yl9zZXNzaW9uID0gTmV0bGlmeS5lbnYuZ2V0KFwiSFRCX1NFU1NJT05cIik7XHJcbiAgICBjb25zdCB1cmwgPSBcImh0dHBzOi8vZW50ZXJwcmlzZS5oYWNrdGhlYm94LmNvbS9hcGkvdjEvY29ubmVjdGlvbnMvc3RhdHVzXCI7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgXCJDb29raWVcIjogYGhhY2tfdGhlX2JveF9lbnRlcnByaXNlX3BsYXRmb3JtX3Nlc3Npb249JHtodGJfc2Vzc2lvbn07YFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgY29uc3QgY29va2llcyA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0U2V0Q29va2llKCk7XHJcbiAgICBjb25zdCB4c3JmX2Nvb2tpZSA9IGNvb2tpZXMuZmluZChjb29raWUgPT4gY29va2llLnN0YXJ0c1dpdGgoXCJYU1JGLVRPS0VOPVwiKSk7XHJcbiAgICBjb25zdCB4c3JmX3Rva2VuID0gZGVjb2RlVVJJQ29tcG9uZW50KHhzcmZfY29va2llPy5zcGxpdChcIjtcIilbMF0uc3BsaXQoXCI9XCIpWzFdID8/IFwiXCIpO1xyXG4gICAgcmV0dXJuIHhzcmZfdG9rZW47XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGFkZFNlYXQodXNlcmlkOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IGh0Yl9zZXNzaW9uID0gTmV0bGlmeS5lbnYuZ2V0KFwiSFRCX1NFU1NJT05cIik7XHJcbiAgICBjb25zdCB4c3JmX3Rva2VuID0gYXdhaXQgZ2V0WHNyZlRva2VuKCk7XHJcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9lbnRlcnByaXNlLmhhY2t0aGVib3guY29tL2FwaS92MS91c2VyLW1hbmFnZW1lbnQvdXNlcnMvJHt1c2VyaWR9L2xpY2Vuc2VzL3N5bmNgO1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICAgICAgICBcIkNvb2tpZVwiOiBgaGFja190aGVfYm94X2VudGVycHJpc2VfcGxhdGZvcm1fc2Vzc2lvbj0ke2h0Yl9zZXNzaW9ufTtgLFxyXG4gICAgICAgICAgICAgICAgXCJYLVhzcmYtVG9rZW5cIjogeHNyZl90b2tlbixcclxuICAgICAgICAgICAgICAgIFwiT3JpZ2luXCI6IFwiaHR0cHM6Ly9lbnRlcnByaXNlLmhhY2t0aGVib3guY29tXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBcclxuICAgICAgICAgICAgICAgIHVzZXJfaWQ6IHVzZXJpZCxcclxuICAgICAgICAgICAgICAgIGFzc2lnbmVkX2xpY2Vuc2VzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogNzQyNSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbHM6IFsgMTYyNjYgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJlc19hdDogbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICByZW1vdmVkX2xpY2Vuc2VzOiBbXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3luYyAocmVxOiBSZXF1ZXN0LCBjb250ZXh0OiBDb250ZXh0KSA9PiB7XHJcbiAgICBjb25zdCBodGJfc2Vzc2lvbiA9IE5ldGxpZnkuZW52LmdldChcIkhUQl9TRVNTSU9OXCIpO1xyXG5cclxuICAgIGlmIChyZXEubWV0aG9kICE9PSBcIlBPU1RcIikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXHJcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiTWV0aG9kIG5vdCBhbGxvd2VkXCIgfSksXHJcbiAgICAgICAgICAgIHsgc3RhdHVzOiA0MDUsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZXEuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IHVzZXJpZCA9IGF3YWl0IGZpbmRVc2VyKHBheWxvYWQuZW1haWwpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBBZGRpbmcgc2VhdCBmb3IgJHtwYXlsb2FkLmVtYWlsfSAodXNlcmlkOiAke3VzZXJpZH0pYCk7XHJcbiAgICAgICAgYXdhaXQgYWRkU2VhdCh1c2VyaWQpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcHJvY2Vzc2luZyByZXF1ZXN0OlwiLCBlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShcclxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgZXJyb3I6IFwiSW50ZXJuYWwgZXJyb3JcIixcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIHsgc3RhdHVzOiA1MDAsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxyXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogXCJTdWNjZXNzXCIgfSksIFxyXG4gICAgICAgIHsgc3RhdHVzOiAyMDAsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCJ9IH1cclxuICAgICk7XHJcbn0iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBR0EsZUFBZSxTQUFTLE9BQWdDO0FBQ3BELFFBQU0sY0FBYyxRQUFRLElBQUksSUFBSSxhQUFhO0FBQ2pELFFBQU0sTUFBTSw0RkFBNEYsS0FBSztBQUM3RyxRQUFNLFdBQVcsTUFBTSxNQUFNLEtBQUs7QUFBQSxJQUM5QixTQUFTO0FBQUEsTUFDTCxVQUFVLDRDQUE0QyxXQUFXO0FBQUEsTUFDakUsV0FBVztBQUFBLElBQ2Y7QUFBQSxFQUNKLENBQUM7QUFDRCxRQUFNLE9BQU8sTUFBTSxTQUFTLEtBQUs7QUFDakMsUUFBTSxTQUFTLEtBQUssS0FBSyxLQUFLLENBQUMsTUFBVyxFQUFFLFVBQVUsS0FBSyxFQUFFO0FBQzdELFNBQU87QUFDWDtBQUVBLGVBQWUsZUFBZ0M7QUFDM0MsUUFBTSxjQUFjLFFBQVEsSUFBSSxJQUFJLGFBQWE7QUFDakQsUUFBTSxNQUFNO0FBQ1osUUFBTSxXQUFXLE1BQU0sTUFBTSxLQUFLO0FBQUEsSUFDOUIsU0FBUztBQUFBLE1BQ0wsVUFBVSw0Q0FBNEMsV0FBVztBQUFBLElBQ3JFO0FBQUEsRUFDSixDQUFDO0FBQ0QsUUFBTSxVQUFVLFNBQVMsUUFBUSxhQUFhO0FBQzlDLFFBQU0sY0FBYyxRQUFRLEtBQUssWUFBVSxPQUFPLFdBQVcsYUFBYSxDQUFDO0FBQzNFLFFBQU0sYUFBYSxtQkFBbUIsYUFBYSxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUU7QUFDcEYsU0FBTztBQUNYO0FBRUEsZUFBZSxRQUFRLFFBQWdCO0FBQ25DLFFBQU0sY0FBYyxRQUFRLElBQUksSUFBSSxhQUFhO0FBQ2pELFFBQU0sYUFBYSxNQUFNLGFBQWE7QUFDdEMsUUFBTSxNQUFNLGtFQUFrRSxNQUFNO0FBQ3BGLFFBQU0sV0FBVyxNQUFNLE1BQU0sS0FBSztBQUFBLElBQzFCLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxNQUNMLGdCQUFnQjtBQUFBLE1BQ2hCLFVBQVUsNENBQTRDLFdBQVc7QUFBQSxNQUNqRSxnQkFBZ0I7QUFBQSxNQUNoQixVQUFVO0FBQUEsSUFDZDtBQUFBLElBQ0EsTUFBTSxLQUFLLFVBQVU7QUFBQSxNQUNqQixTQUFTO0FBQUEsTUFDVCxtQkFBbUI7QUFBQSxRQUNmO0FBQUEsVUFDSSxJQUFJO0FBQUEsVUFDSixVQUFVLENBQUUsS0FBTTtBQUFBLFVBQ2xCLFlBQVk7QUFBQSxRQUNoQjtBQUFBLE1BQ0o7QUFBQSxNQUNBLGtCQUFrQixDQUFDO0FBQUEsSUFDdkIsQ0FBQztBQUFBLEVBQ0wsQ0FBQztBQUNUO0FBRUEsSUFBTyxtQkFBUSxPQUFPLEtBQWMsWUFBcUI7QUFDckQsUUFBTSxjQUFjLFFBQVEsSUFBSSxJQUFJLGFBQWE7QUFFakQsTUFBSSxJQUFJLFdBQVcsUUFBUTtBQUN2QixXQUFPLElBQUk7QUFBQSxNQUNQLEtBQUssVUFBVSxFQUFFLE9BQU8scUJBQXFCLENBQUM7QUFBQSxNQUM5QyxFQUFFLFFBQVEsS0FBSyxTQUFTLEVBQUUsZ0JBQWdCLG1CQUFtQixFQUFFO0FBQUEsSUFDbkU7QUFBQSxFQUNKO0FBRUEsTUFBSTtBQUNBLFVBQU0sVUFBVSxNQUFNLElBQUksS0FBSztBQUMvQixVQUFNLFNBQVMsTUFBTSxTQUFTLFFBQVEsS0FBSztBQUMzQyxZQUFRLElBQUksbUJBQW1CLFFBQVEsS0FBSyxhQUFhLE1BQU0sR0FBRztBQUNsRSxVQUFNLFFBQVEsTUFBTTtBQUFBLEVBQ3hCLFNBQVMsT0FBTztBQUNaLFlBQVEsTUFBTSw2QkFBNkIsS0FBSztBQUNoRCxXQUFPLElBQUk7QUFBQSxNQUNQLEtBQUssVUFBVTtBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsU0FBUyxpQkFBaUIsUUFBUSxNQUFNLFVBQVU7QUFBQSxNQUN0RCxDQUFDO0FBQUEsTUFDRCxFQUFFLFFBQVEsS0FBSyxTQUFTLEVBQUUsZ0JBQWdCLG1CQUFtQixFQUFFO0FBQUEsSUFDbkU7QUFBQSxFQUNKO0FBRUEsU0FBTyxJQUFJO0FBQUEsSUFDUCxLQUFLLFVBQVUsRUFBRSxTQUFTLFVBQVUsQ0FBQztBQUFBLElBQ3JDLEVBQUUsUUFBUSxLQUFLLFNBQVMsRUFBRSxnQkFBZ0IsbUJBQWtCLEVBQUU7QUFBQSxFQUNsRTtBQUNKOyIsCiAgIm5hbWVzIjogW10KfQo=
