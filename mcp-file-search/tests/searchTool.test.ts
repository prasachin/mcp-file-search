/// <reference types="mocha" />
import { expect } from "chai";
import { createSearchTool } from "../src/tools/searchtool";
import fs from "fs";

describe("search_file tool", () => {
  const t = createSearchTool();
  const tmpFile = "./tests/_sample.txt";

  before(() => {
    fs.writeFileSync(tmpFile, "hello world\nfoo bar\nHello Again\nregex 123\n");
  });

  after(() => {
    fs.unlinkSync(tmpFile);
  });

  it("finds case-insensitive matches", async () => {
    const res: any = await t.exec({ filepath: tmpFile, keyword: "hello" });
    expect(res.total_matches).to.equal(2);
  });
});
