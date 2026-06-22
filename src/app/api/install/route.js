export async function GET() {
  try {
    const { execSync } = require("child_process");
    const result = execSync("npm uninstall leaflet react-leaflet && npm install @vis.gl/react-google-maps", { encoding: "utf8" });
    return new Response(JSON.stringify({ success: true, output: result }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
