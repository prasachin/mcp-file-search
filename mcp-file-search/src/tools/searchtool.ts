import fs from "fs";
import path from "path";

export type ToolInput = {
  filepath: string;
  keyword: string;
  case_sensitive?: boolean;
  max_results?: number;
  regex?: boolean;
};

export type Tool = {
  name: string;
  description: string;
  inputSchema: any;
  exec: (input: ToolInput) => Promise<any>;
};

export function createSearchTool(): Tool {
  return {
    name: "search_file",
    description:
      "Search for a keyword or regex in a file, returns all matching occurrences with line and position info",
    inputSchema: {
      type: "object",
      properties: {
        filepath: { type: "string" },
        keyword: { type: "string" },
        case_sensitive: { type: "boolean" },
        max_results: { type: "number" },
        regex: { type: "boolean" },
      },
      required: ["filepath", "keyword"],
    },
    exec: async (input) => {
      const {
        filepath,
        keyword,
        case_sensitive = false,
        max_results = 100,
        regex = false,
      } = input;

      const absPath = path.isAbsolute(filepath)
        ? filepath
        : path.join(process.cwd(), filepath);

      if (!fs.existsSync(absPath)) {
        throw new Error(`File not found: ${absPath}`);
      }

      const data = await fs.promises.readFile(absPath, "utf8");
      const lines = data.split(/\r?\n/);
      const results: {
        line: number;
        start: number;
        end: number;
        text: string;
      }[] = [];

      const flags = case_sensitive ? "g" : "gi";
      const re = regex
        ? new RegExp(keyword, flags)
        : new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let match;
        while ((match = re.exec(line)) !== null) {
          results.push({
            line: i + 1,
            start: match.index + 1,
            end: match.index + match[0].length,
            text: line.substring(0, 1000),
          });
          if (results.length >= max_results) break;
        }
        if (results.length >= max_results) break;
      }

      console.log(`Found ${results.length} matches for "${keyword}"`);
      return { matches: results, total_matches: results.length };
    },
  };
}
