// do those steps from the readme programmatically
// 1. Download `gdtf.xsd` from [here](https://raw.githubusercontent.com/mvrdevelopment/spec/main/gdtf.xsd)
// 1. Run `npx http-server` in the directory where `gdtf.xsd` is located
// 1. Edit that file and add the following attributes to the `xs:schema` tag: `targetNamespace="urn:gdtf"   elementFormDefault="qualified" attributeFormDefault="unqualified" version="1.0.0"`
// 1. Run `npx cxsd http://127.0.0.1:8082/gdtf.xsd`
// 1. The generated `gdtf.d.ts` file will be located in the `xmlns` folder. You will also need the `xml-primitives.d.ts` file from the same folder.

import fs from 'fs';
import http from 'http';
import * as rimraf from 'rimraf';

const rawPath = "https://raw.githubusercontent.com/mvrdevelopment/spec/main/gdtf.xsd";

console.log("Downloading gdtf.xsd");
const xsd = await fetch(rawPath).then(res => res.text());

console.log("Editing gdtf.xsd");
const editedXsd = xsd.replace('<xs:schema', '<xs:schema targetNamespace="urn:gdtf" elementFormDefault="qualified" attributeFormDefault="unqualified" version="1.0.0"');

console.log("Starting http server");
const httpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(editedXsd);
});
await new Promise(resolve => httpServer.listen(8082, resolve));

console.log("Converting gdtf.xsd to gdtf.d.ts");
process.argv = ["node", "cxsd", "http://127.0.0.1:8082/gdtf.xsd"];
await import("cxsd/dist/cli.js");

console.log("Waiting for gdtf.d.ts to be generated");
while (!fs.existsSync("xmlns/gdtf.d.ts")) {
    await new Promise(resolve => setTimeout(resolve, 100));
}

console.log("Creating dist folder");
if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
}

console.log("Modifying gdtf.d.ts");
let gdtfDts = fs.readFileSync("xmlns/gdtf.d.ts", "utf-8");
// remove all export var lines
gdtfDts = gdtfDts.replace(/export var .*/g, "");
// remove // Source files:\n// [...] lines
gdtfDts = gdtfDts.replace(/\/\/ Source files:\n\/\/ .*?\n/g, "");
// remove consecutive empty lines
gdtfDts = gdtfDts.replace(/\n\n\n/g, "\n\n");
// change export interface document to export default interface GDTFDocument
gdtfDts = gdtfDts.replace(/export interface Document/g, "export default interface GDTFDocument");
// trim
gdtfDts = gdtfDts.trim();
// write modified file
fs.writeFileSync("xmlns/gdtf.d.ts", gdtfDts);

console.log("Modifying xml-primitives.d.ts");
let xmlPrimitivesDts = fs.readFileSync("xmlns/xml-primitives.d.ts", "utf-8");
// remove all export var lines
xmlPrimitivesDts = xmlPrimitivesDts.replace(/export var .*/g, "");
// remove export interface document extends BaseType {\n}
xmlPrimitivesDts = xmlPrimitivesDts.replace(/export interface document extends BaseType \{\n\}/g, "");
// remove consecutive empty lines
xmlPrimitivesDts = xmlPrimitivesDts.replace(/\n\n\n/g, "\n\n");
// remove Source files:\n// [...] lines
xmlPrimitivesDts = xmlPrimitivesDts.replace(/\/\/ Source files:\n\/\/ .*?\n/g, "");
// trim
xmlPrimitivesDts = xmlPrimitivesDts.trim();
// write modified file
fs.writeFileSync("xmlns/xml-primitives.d.ts", xmlPrimitivesDts);

console.log("Moving gdtf.d.ts and xml-primitives.d.ts to dist");
fs.renameSync("xmlns/gdtf.d.ts", "dist/gdtf.d.ts");
fs.renameSync("xmlns/xml-primitives.d.ts", "dist/xml-primitives.d.ts");

console.log("Cleaning up");
rimraf.sync("xmlns");
rimraf.sync("cache");

console.log("Done");
httpServer.close();