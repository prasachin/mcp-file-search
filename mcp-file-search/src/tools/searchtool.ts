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
      "Search for a keyword or regex in a file, returns matching lines with context",
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

      console.log("Reading file from:", absPath);

      if (!fs.existsSync(absPath)) {
        throw new Error(`File not found: ${absPath}`);
      }

      const data = await fs.promises.readFile(absPath, "utf8");
      const lines = data.split(/\r?\n/);
      const results: { line: number; text: string }[] = [];

      let matcher: (s: string) => boolean;
      if (regex) {
        const flags = case_sensitive ? "" : "i";
        const re = new RegExp(keyword, flags);
        matcher = (s) => re.test(s);
      } else {
        if (case_sensitive) matcher = (s) => s.includes(keyword);
        else {
          const low = keyword.toLowerCase();
          matcher = (s) => s.toLowerCase().includes(low);
        }
      }

      for (let i = 0; i < lines.length; i++) {
        if (matcher(lines[i])) {
          results.push({ line: i + 1, text: lines[i].substring(0, 1000) });
          if (results.length >= max_results) break;
        }
      }

      console.log(`Found ${results.length} matches for "${keyword}"`);
      return { matches: results, total_matches: results.length };
    },
  };
}
