import * as vscode from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");

let globalState: vscode.Memento;
let id: string | undefined;
let currentColorTheme: string | undefined;
let lineNumbers: number[] = [];
let lineDecorations: vscode.DecorationOptions[];
let activeLine: string | undefined;

const lightDecoration: vscode.TextEditorDecorationType =
  vscode.window.createTextEditorDecorationType({
    gutterIconPath: vscode.Uri.file(path.join(__dirname, "../images/light.png")),
    gutterIconSize: "contain",
  });

const darkDecoration: vscode.TextEditorDecorationType =
  vscode.window.createTextEditorDecorationType({
    gutterIconPath: vscode.Uri.file(path.join(__dirname, "../images/dark.png")),
    gutterIconSize: "contain",
  });

let hasImport: boolean = false;

const uri =
  "mongodb+srv://olivia:MA1T5GaLPzIPphQy@researchcluster.zvvxxis.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export function activate(context: vscode.ExtensionContext) {
  // Create the show hello world command
  const dummydata = {
    userid: "Pranav",
    linetext: "",
  };

  globalState = context.globalState;

  if (globalState.get("id")) {
    // id already exists in local storage
    id = globalState.get("id");
    console.log("ID exists: " + id);
  } else {
    setUserId();
    console.log("New ID: " + id);
  }

  detectColorTheme();
  // Listen for changes in the color theme
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("workbench.colorTheme")) {
      // Color theme has changed
      detectColorTheme();
      if (currentColorTheme === "light") {
        vscode.window.activeTextEditor?.setDecorations(darkDecoration, []);
        vscode.window.activeTextEditor?.setDecorations(lightDecoration, lineDecorations);
      } else {
        vscode.window.activeTextEditor?.setDecorations(lightDecoration, []);
        vscode.window.activeTextEditor?.setDecorations(darkDecoration, lineDecorations);
      }
    }
  });

  // Start - gutter icon
  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const { document } = activeEditor;

    let lineNumbers = extractNames(document);

    // Add decorations to matching lines
    lineDecorations = lineNumbers.map((lineNumber) => ({
      range: new vscode.Range(lineNumber, 0, lineNumber, 0),
    }));
    if (currentColorTheme === "light") {
      activeEditor.setDecorations(lightDecoration, lineDecorations);
    } else {
      activeEditor.setDecorations(darkDecoration, lineDecorations);
    }
  }

  vscode.workspace.onDidChangeTextDocument((event) => {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && event.document === activeEditor.document) {
      const { document } = activeEditor;

      activeEditor.setDecorations(lightDecoration, []);
      activeEditor.setDecorations(darkDecoration, []);

      let lineNumbers: number[] = extractNames(document);

      // Add decorations to matching lines
      lineDecorations = lineNumbers.map((lineNumber) => ({
        range: new vscode.Range(lineNumber, 0, lineNumber, 0),
      }));
      if (currentColorTheme === "light") {
        activeEditor.setDecorations(lightDecoration, lineDecorations);
      } else {
        activeEditor.setDecorations(darkDecoration, lineDecorations);
      }
    }
  });
  // End

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    activeEditor = editor;

    if (editor) {
      const { document } = editor;

      editor.setDecorations(lightDecoration, []);
      editor.setDecorations(darkDecoration, []);

      let lineNumbers: number[] = extractNames(document);

      // Add decorations to matching lines
      lineDecorations = lineNumbers.map((lineNumber) => ({
        range: new vscode.Range(lineNumber, 0, lineNumber, 0),
      }));
      if (currentColorTheme === "light") {
        editor.setDecorations(lightDecoration, lineDecorations);
      } else {
        editor.setDecorations(darkDecoration, lineDecorations);
      }
    }
  });

  if (activeEditor) {
    vscode.commands.executeCommand("setContext", "hug-reports.hasImport", hasImport);
  }
  vscode.workspace.onDidChangeTextDocument((event) => {
    vscode.commands.executeCommand("setContext", "hug-reports.hasImport", hasImport);
  });

  const showHelloWorldCommand = vscode.commands.registerCommand(
    "hug-reports.showHelloWorld",
    () => {
      HelloWorldPanel.render(context.extensionUri, dummydata);
    }
  );

  const sayMoreCommand = vscode.commands.registerCommand("hug-reports.sayMore", async (args) => {
    if (activeEditor) {
      if (args) {
        if (args.lineNumber) {
          console.log("Line number: " + args.lineNumber);
          dummydata.linetext = activeEditor.document.lineAt(args.lineNumber - 1).text;
          console.log("dummy " + dummydata.linetext);
        }
      }
    }
    if (!activeEditor) {
      if (args) {
        console.log("No active editor");
        const document = await vscode.workspace.openTextDocument(args.uri);
        dummydata.linetext = document.lineAt(args.lineNumber - 1).text;
        console.log("dummy " + dummydata.linetext);
      }
    }
    HelloWorldPanel.render(context.extensionUri, dummydata);
  });

  const sayThanksCommand = vscode.commands.registerCommand(
    "hug-reports.sayThanks",
    async (args) => {
      const lineNumber: number = args.lineNumber;
      if (activeEditor) {
        activeLine = activeEditor.document.lineAt(args.lineNumber - 1).text;
        dummydata.linetext = activeLine;
        const data = {
          lineNumber,
          activeLine,
          timestamp: new Date(),
          userId: id,
        };
        await saveResponseToMongoDB(data);
        const additionalMessage =
          "Your thanks has been sent! If you feel inspired to share more, don't hesitate to send a note to the contributors. Your words of encouragement can make a world of difference and let them know just how much their efforts are valued.";
        const sayMore = "Say More";
        vscode.window
          .showInformationMessage(additionalMessage, { modal: true }, { title: sayMore })
          .then((selectedAction) => {
            if (selectedAction && selectedAction.title === sayMore) {
              vscode.commands.executeCommand(`hug-reports.sayMore`);
            }
          });
      }
    }
  );

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);
  context.subscriptions.push(sayThanksCommand);
  context.subscriptions.push(sayMoreCommand);
}

export function deactivate() {
  lightDecoration.dispose();
  darkDecoration.dispose();
}

function extractNames(document: vscode.TextDocument) {
  lineNumbers = [];
  let match: RegExpExecArray | null;
  let namesSet: Set<string> = new Set();

  if (document.languageId === "python") {
    const pyImportRegex = /^(\s*(?:from\s+[\w\.]+)?\s*import\s+[\w\*\, ]+(?:\s+as\s+[\w]+)?)\b/gm;
    while ((match = pyImportRegex.exec(document.getText()))) {
      lineNumbers.push(document.positionAt(match.index).line);

      const importStatement = match[1].trim();
      const statements = importStatement
        .split(/^(?:import|from)\s+/)[1]
        .split(/\s*,\s*/)
        .map((item) => item.trim());
      statements.forEach((item) => {
        const namesSplitByAs = item.split(/\s+as\s+/);
        if (namesSplitByAs.length === 1) {
          const name = namesSplitByAs[0];
          if (name.includes("import")) {
            namesSet.add(name.split(/\s+import\s+/)[1]);
          } else {
            namesSet.add(name);
          }
        } else {
          namesSet.add(namesSplitByAs[1]);
        }
      });
    }
  } else if (document.languageId === "javascript" || document.languageId == "typescript") {
    const jsImportRegex = /^import\s+.*\s+from\s+['"](.*)['"]/gm;
    while ((match = jsImportRegex.exec(document.getText()))) {
      const fromSplit = match[0].split(/\s+from\s+/);
      if (
        fromSplit[1].trim().startsWith('"./') ||
        fromSplit[1].trim().startsWith('"/') ||
        fromSplit[1].trim().startsWith("'./") ||
        fromSplit[1].trim().startsWith("'/")
      ) {
        continue;
      }
      lineNumbers.push(document.positionAt(match.index).line);
      const statements = fromSplit[0]
        .split(/\s*import\s+/)[1]
        .split(/\s*,\s*/)
        .map((item) => item.trim());
      statements.forEach((item) => {
        if (/\s+as\s+/.test(item) || item.includes("{") || item.includes("}")) {
          const asSplit = item.split(/\s+as\s+/);
          const name = asSplit.length > 1 ? asSplit[1] : item;
          const bracketSplit = name.split(/\s*\{\s*/);
          const bracketName = bracketSplit.length > 1 ? bracketSplit[1] : bracketSplit[0];
          namesSet.add(bracketName.split(/\s*\}\s*/)[0]);
        } else {
          namesSet.add(item);
        }
      });
    }

    const jsRequireRegex =
      /(const|let)\s+\{?\s*([\w,\s]+)\s*\}?\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)[^;]*;/g;
    while ((match = jsRequireRegex.exec(document.getText()))) {
      if (match[3].trim().startsWith("./") || match[3].trim().startsWith("/")) {
        continue;
      }
      lineNumbers.push(document.positionAt(match.index).line);
      if (match[2].includes(",")) {
        const splitNames = match[2].replace(/\s/g, "").split(",");
        splitNames.forEach((name) => namesSet.add(name));
      } else {
        namesSet.add(match[2].trim());
      }
    }
  }

  let names: string[] = Array.from(namesSet);

  if (names.length > 0) {
    const funcPattern = new RegExp(
      `\\b(?:${names.map((name) => `(?:(?:${name})\\.\\w+|${name})`).join("|")})\\(`
    );

    for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
      const line = document.lineAt(lineNumber).text;
      const isMatching = funcPattern.test(line);
      if (isMatching) {
        lineNumbers.push(lineNumber);
      } else {
        const attrPattern = new RegExp(
          `\\b(?:${names.map((name) => `(?:(?:${name})\\.\\w+)`).join("|")})`
        );
        if (attrPattern.test(line)) {
          lineNumbers.push(lineNumber);
        }
      }
    }
  }

  if (lineNumbers.length === 0) {
    hasImport = false;
  } else {
    hasImport = true;
  }

  return lineNumbers;
}

function detectColorTheme() {
  currentColorTheme = vscode.workspace.getConfiguration("workbench").get("colorTheme");

  if (currentColorTheme?.includes("Light")) {
    currentColorTheme = "light";
  } else {
    currentColorTheme = "dark";
  }
}

async function createUserMongoDB() {
  let insertedId: string | undefined;

  try {
    await client.connect();

    const database = client.db("gratitude");
    const collection = database.collection("users");

    const result = await collection.insertOne({ timestamp: new Date() });

    if (result.insertedId) {
      console.log("User saved to MongoDB: " + result.insertedId);
      insertedId = result.insertedId.toString();
    }
  } catch (error) {
    console.error("Error saving user to MongoDB: ", error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }

  return insertedId;
}

async function setUserId() {
  try {
    id = await createUserMongoDB();
    globalState.update("id", id);
  } catch (error) {
    console.error("Error saving user to MongoDB:", error);
  }
}

async function saveResponseToMongoDB(response: any) {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const database = client.db("gratitude");
    const collection = database.collection("responses");

    await collection.insertOne(response);
    console.log("Response saved to MongoDB: " + response);
  } catch (error) {
    console.error("Error saving response to MongoDB: ", error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
