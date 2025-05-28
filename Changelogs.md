# Changelogs

## RemoteServer

Modification in [bitburner-filesync](node_modules/bitburner-filesync/src/index.js):

```diff
@@ -6,6 +6,7 @@
import { fileChangeEventToMsg, fileRemovalEventToMsg, requestFilenames, requestDefinitionFile } from "./networking/messageGenerators.js";
import { EventType } from "./eventTypes.js";
import { messageHandler } from "./networking/messageHandler.js";
+import * as fs from 'node:fs';

export async function start() {
    loadConfig();
@@ -19,8 +20,10 @@
    signal.on(EventType.ConnectionMade, () => {
        console.log("Connection made!");

-        if (config.get("definitionFile").update) {
+        if (!fs.existsSync(config.get("definitionFile").location) && config.get("definitionFile").update) {
            signal.emit(EventType.MessageSend, requestDefinitionFile());
        }

        if (config.get("pushAllOnConnection")) {
```

Modification in [NetscriptDefinitions.d.ts](NetscriptDefinitions.d.ts):

```diff
@@ -4547,14 +4547,14 @@
*    these color names from the selected theme: "hack" (green), "hp" (red), "money" (yellow), "int" (blue), "cha" (purple)
* @param text optional: text to add to the node (replaces the default A.1 or B5 seen on hover). Should be kept short to fit well.
*/
-  highlightPoint(x, y, color, text): void;
+  highlightPoint(x: number, y: number, color: string | null, text: string | null): void;

/**
    * Removes the highlight color and text from the specified node.
    * @param x the x coordinate to remove highlight from
    * @param y the y coordinate to remove highlight from
    */
-  clearPointHighlight(x, y): void;
+  clearPointHighlight(x: number, y: number): void;

/** Removes all highlights from the board. */
clearAllPointHighlights(): void;
```
