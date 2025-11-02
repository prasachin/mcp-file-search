import { createSearchTool } from "./tools/searchtool";

const tools = [createSearchTool()];

function sendMessage(msg: any) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

async function handleMessage(line: string) {
  try {
    const msg = JSON.parse(line.trim());

    if (msg.method === "initialize") {
      sendMessage({
        jsonrpc: "2.0",
        id: msg.id,
        result: {
          serverInfo: {
            name: "mcp-file-search",
            version: "1.0.0",
          },
          capabilities: {},
        },
      });
      return;
    }
    if (msg.method === "tools/list") {
      sendMessage({
        jsonrpc: "2.0",
        id: msg.id,
        result: {
          tools: tools.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
          })),
        },
      });
      return;
    }
    if (msg.method === "tools/call") {
      const { name, arguments: args } = msg.params;
      const tool = tools.find((t) => t.name === name);

      if (!tool) {
        sendMessage({
          jsonrpc: "2.0",
          id: msg.id,
          error: { code: -32601, message: "Tool not found" },
        });
        return;
      }

      try {
        const result = await tool.exec(args);
        sendMessage({
          jsonrpc: "2.0",
          id: msg.id,
          result: {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          },
        });
      } catch (err: any) {
        sendMessage({
          jsonrpc: "2.0",
          id: msg.id,
          error: { code: -32000, message: err.message },
        });
      }
      return;
    }
    sendMessage({
      jsonrpc: "2.0",
      id: msg.id,
      error: { code: -32601, message: "Unknown method" },
    });
  } catch (err) {
    console.error("Invalid message received:", err);
  }
}
let buffer = "";
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";
  for (const line of lines) {
    if (line.trim()) handleMessage(line);
  }
});
console.error("MCP STDIO Server ready");
