# GDTF Types

## How to use
### Install
```sh
npm i -D gdtf-types
```
### Use
```ts
import type { document as GDTFDocument, Model } from 'gdtf-types';
```
Can be used for a GDTF `description.xml` parsed as follows (using [`fast-xml-parser`](https://www.npmjs.com/package/fast-xml-parser)):
```ts
const description = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ''
}).parse(descriptionXML) as GDTFDocument;
```

## How to build
1. Download `gdtf.xsd` from [here](https://raw.githubusercontent.com/mvrdevelopment/spec/main/gdtf.xsd)
1. Run `npx http-server` in the directory where `gdtf.xsd` is located
1. Edit that file and add the following attributes to the `xs:schema` tag: `targetNamespace="urn:gdtf"   elementFormDefault="qualified" attributeFormDefault="unqualified" version="1.0.0"`
1. Run `npx cxsd http://127.0.0.1:8082/gdtf.xsd`
1. The generated `gdtf.d.ts` file will be located in the `xmlns` folder. You will also need the `xml-primitives.d.ts` file from the same folder.

> [!IMPORTANT]  
> Before rebuilding, delete the `cache` and the `xmlns` folders.