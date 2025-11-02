import express from "express";
import bodyParser from "body-parser";
import { registerEndpoints } from "./mcp-protocol";
import { createSearchTool } from "./tools/searchtool";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

registerEndpoints(app, {
  tools: [createSearchTool()],
});

app.get("/", (req, res) => {
  res.send("MCP File Search Server is running! Try POST /execute/search_file");
});

app.listen(PORT, () => {
  console.log(`MCP file-search server listening on ${PORT}`);
  console.log(`Tools: search_file`);
});
