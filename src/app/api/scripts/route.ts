import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Cleanup threshold (1 hour in milliseconds)
const MAX_AGE_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { code, extension } = await req.json();

    if (!code || !extension) {
      return NextResponse.json({ error: "Missing code or extension" }, { status: 400 });
    }

    // Define the temp_scripts directory relative to the brain backend, or locally if that doesn't exist
    let baseDir = path.join(process.cwd(), "../brain-and-muscle/temp_scripts");
    
    // In case the frontend isn't deployed strictly adjacent to backend, fallback to local temp:
    if (!fs.existsSync(path.join(process.cwd(), "../brain-and-muscle"))) {
      baseDir = path.join(process.cwd(), "temp_scripts");
    }

    // Ensure the directory exists
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Perform cleanup of old files in the directory
    try {
      const files = fs.readdirSync(baseDir);
      const now = Date.now();
      for (const file of files) {
        const filePath = path.join(baseDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > MAX_AGE_MS) {
          fs.unlinkSync(filePath);
          console.log(`[cleanup] Deleted old temp script: ${file}`);
        }
      }
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    }

    // Generate a unique filename
    const uniqueId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const fileName = `${uniqueId}.${extension}`;
    const filePath = path.join(baseDir, fileName);

    fs.writeFileSync(filePath, code, "utf-8");

    // Return the absolute path as required by Brain API
    return NextResponse.json({
      success: true,
      scriptPath: filePath, // Absolute path format to inject directly into DeployRequest
      message: "Script saved successfully. Temporary files are auto-cleaned after 1 hour."
    });
  } catch (error: any) {
    console.error("Failed to save script:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
