import { Express } from "express";
import { Tool } from "./tools/searchtool";

export function registerEndpoints(app: Express, opts: { tools: Tool[] }) {
  app.get("/tools", (req, res) => {
    const tools = opts.tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
    res.json({ tools });
  });

  app.post("/execute/:tool", async (req, res) => {
    const toolName = req.params.tool;
    const tool = opts.tools.find((t) => t.name === toolName);
    if (!tool) return res.status(404).json({ error: "tool not found" });
    try {
      const result = await tool.exec(req.body);
      res.json({ result });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });
}
