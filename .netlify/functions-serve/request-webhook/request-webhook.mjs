
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/request-webhook.mts
var request_webhook_default = async (req, context) => {
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
    const email = payload.data.fields.find((f) => f.type === "INPUT_EMAIL").value;
    const request = payload.data.fields.find((f) => f.type === "MULTIPLE_CHOICE").value[0];
    const response = await fetch(webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Automation-Webhook-Token": webhook_secret
      },
      body: JSON.stringify({ email, request })
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
    JSON.stringify({ message: "Success" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
export {
  request_webhook_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvcmVxdWVzdC13ZWJob29rLm10cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHR5cGUgeyBDb250ZXh0IH0gZnJvbSBcIkBuZXRsaWZ5L2Z1bmN0aW9uc1wiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChyZXE6IFJlcXVlc3QsIGNvbnRleHQ6IENvbnRleHQpID0+IHtcclxuICAgIGNvbnN0IHdlYmhvb2tfdXJsID0gTmV0bGlmeS5lbnYuZ2V0KFwiV0VCSE9PS19VUkxcIik7XHJcbiAgICBjb25zdCB3ZWJob29rX3NlY3JldCA9IE5ldGxpZnkuZW52LmdldChcIldFQkhPT0tfU0VDUkVUXCIpO1xyXG5cclxuICAgIGlmIChyZXEubWV0aG9kICE9PSBcIlBPU1RcIikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXHJcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiTWV0aG9kIG5vdCBhbGxvd2VkXCIgfSksXHJcbiAgICAgICAgICAgIHsgc3RhdHVzOiA0MDUsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZXEuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IGVtYWlsID0gcGF5bG9hZC5kYXRhLmZpZWxkcy5maW5kKChmOiBhbnkpID0+IGYudHlwZSA9PT0gXCJJTlBVVF9FTUFJTFwiKS52YWx1ZTtcclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gcGF5bG9hZC5kYXRhLmZpZWxkcy5maW5kKChmOiBhbnkpID0+IGYudHlwZSA9PT0gXCJNVUxUSVBMRV9DSE9JQ0VcIikudmFsdWVbMF07XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2god2ViaG9va191cmwsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICAgICAgICBcIlgtQXV0b21hdGlvbi1XZWJob29rLVRva2VuXCI6IHdlYmhvb2tfc2VjcmV0XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgZW1haWwsIHJlcXVlc3R9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcHJvY2Vzc2luZyByZXF1ZXN0OlwiLCBlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShcclxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgZXJyb3I6IFwiSW50ZXJuYWwgZXJyb3JcIixcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIHsgc3RhdHVzOiA1MDAsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxyXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogXCJTdWNjZXNzXCIgfSksIFxyXG4gICAgICAgIHsgc3RhdHVzOiAyMDAsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCJ9IH1cclxuICAgICk7XHJcbn0iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBR0EsSUFBTywwQkFBUSxPQUFPLEtBQWMsWUFBcUI7QUFDckQsUUFBTSxjQUFjLFFBQVEsSUFBSSxJQUFJLGFBQWE7QUFDakQsUUFBTSxpQkFBaUIsUUFBUSxJQUFJLElBQUksZ0JBQWdCO0FBRXZELE1BQUksSUFBSSxXQUFXLFFBQVE7QUFDdkIsV0FBTyxJQUFJO0FBQUEsTUFDUCxLQUFLLFVBQVUsRUFBRSxPQUFPLHFCQUFxQixDQUFDO0FBQUEsTUFDOUMsRUFBRSxRQUFRLEtBQUssU0FBUyxFQUFFLGdCQUFnQixtQkFBbUIsRUFBRTtBQUFBLElBQ25FO0FBQUEsRUFDSjtBQUVBLE1BQUk7QUFDQSxVQUFNLFVBQVUsTUFBTSxJQUFJLEtBQUs7QUFDL0IsVUFBTSxRQUFRLFFBQVEsS0FBSyxPQUFPLEtBQUssQ0FBQyxNQUFXLEVBQUUsU0FBUyxhQUFhLEVBQUU7QUFDN0UsVUFBTSxVQUFVLFFBQVEsS0FBSyxPQUFPLEtBQUssQ0FBQyxNQUFXLEVBQUUsU0FBUyxpQkFBaUIsRUFBRSxNQUFNLENBQUM7QUFFMUYsVUFBTSxXQUFXLE1BQU0sTUFBTSxhQUFhO0FBQUEsTUFDdEMsUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsUUFDaEIsOEJBQThCO0FBQUEsTUFDbEM7QUFBQSxNQUNBLE1BQU0sS0FBSyxVQUFVLEVBQUUsT0FBTyxRQUFPLENBQUM7QUFBQSxJQUMxQyxDQUFDO0FBQUEsRUFDTCxTQUFTLE9BQU87QUFDWixZQUFRLE1BQU0sNkJBQTZCLEtBQUs7QUFDaEQsV0FBTyxJQUFJO0FBQUEsTUFDUCxLQUFLLFVBQVU7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLFNBQVMsaUJBQWlCLFFBQVEsTUFBTSxVQUFVO0FBQUEsTUFDdEQsQ0FBQztBQUFBLE1BQ0QsRUFBRSxRQUFRLEtBQUssU0FBUyxFQUFFLGdCQUFnQixtQkFBbUIsRUFBRTtBQUFBLElBQ25FO0FBQUEsRUFDSjtBQUVBLFNBQU8sSUFBSTtBQUFBLElBQ1AsS0FBSyxVQUFVLEVBQUUsU0FBUyxVQUFVLENBQUM7QUFBQSxJQUNyQyxFQUFFLFFBQVEsS0FBSyxTQUFTLEVBQUUsZ0JBQWdCLG1CQUFrQixFQUFFO0FBQUEsRUFDbEU7QUFDSjsiLAogICJuYW1lcyI6IFtdCn0K
