// Vercel serverless function for settings management
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const filePath = path.join(process.cwd(), "api", "settings.json");

  // GET settings
  if (req.method === "GET") {
    try {
      const data = fs.readFileSync(filePath, "utf8");
      const settings = JSON.parse(data);
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Error reading settings:", error);
      // Return default settings if file doesn't exist
      const defaultSettings = {
        maintenance: false,
        title: "PixelArt Converter"
      };
      return res.status(200).json(defaultSettings);
    }
  }

  // POST update settings
  if (req.method === "POST") {
    try {
      const { maintenance, title, footerLinks, content } = req.body;
      
      // Validate input
      if (typeof maintenance !== 'boolean') {
        return res.status(400).json({ error: "Maintenance must be a boolean" });
      }
      
      if (typeof title !== 'string') {
        return res.status(400).json({ error: "Title must be a string" });
      }

      // Validate footerLinks if provided
      if (footerLinks && !Array.isArray(footerLinks)) {
        return res.status(400).json({ error: "FooterLinks must be an array" });
      }

      // Validate each footer link if provided
      if (footerLinks) {
        for (const link of footerLinks) {
          if (!link.id || !link.platform || !link.icon || !link.url) {
            return res.status(400).json({ error: "Each footer link must have id, platform, icon, and url" });
          }
          if (typeof link.id !== 'number' || typeof link.platform !== 'string' || typeof link.icon !== 'string' || typeof link.url !== 'string') {
            return res.status(400).json({ error: "Footer link fields must have correct types" });
          }
        }
      }

      const newSettings = { 
        maintenance: Boolean(maintenance), 
        title: String(title).trim() || "PixelArt Converter",
        footerLinks: Array.isArray(footerLinks) ? footerLinks : [],
        content: typeof content === 'string' ? content : ''
      };
      
      // Write to JSON file
      fs.writeFileSync(filePath, JSON.stringify(newSettings, null, 2));
      
      console.log("Settings updated:", newSettings);
      return res.status(200).json({ 
        message: "Settings updated successfully", 
        data: newSettings 
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      return res.status(500).json({ error: "Failed to save settings" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
