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

interface PackageDictionary {
  lineNumber: number;
  name: string;
  nickName: string | null;
  moduleName: string | null;
  moduleNickName: string | null;
}

type packageDict = PackageDictionary[];

let lineNumbersName: packageDict = [];

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

interface additionalData {
  userid: string;
  linetext: string;
  packages: string[];
  tab: string;
  button: string;
  modules: object;
}

type AddData = additionalData;

export function activate(context: vscode.ExtensionContext) {
  // Create the show hello world command
  let dummydata: AddData = {
    userid: "Pranav",
    linetext: "",
    packages: [],
    tab: "",
    button: "",
    modules: {},
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

    extractNames(document);
    lineNumbersName.map((linePair) => lineNumbers.push(linePair.lineNumber));

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

      extractNames(document);
      lineNumbersName.map((linePair) => lineNumbers.push(linePair.lineNumber));

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

      extractNames(document);
      lineNumbers = [];
      lineNumbersName.map((linePair) => lineNumbers.push(linePair.lineNumber));

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

          extractNames(activeEditor.document);
          let lineArray = lineNumbersName.filter(
            (entry) => entry["lineNumber"] === args.lineNumber - 1
          );
          console.log(lineArray);
          let packagesList: string[] = [];
          lineArray.map((packaged) => packagesList.push(packaged.name));
          const uniquePackages = packagesList.filter((item, index, array) => array.indexOf(item) === index);
          dummydata.packages = uniquePackages;
          console.log(dummydata.packages);
        }
      }
      let allModules: { [key: string]: string[] } = {};
      let document = activeEditor.document;
      dummydata.packages.forEach((packagename) => {
        allModules[packagename] = extractModules(document, packagename);
      });
      dummydata.modules = allModules;
    }
    if (!activeEditor) {
      if (args) {
        console.log("No active editor");
        const document = await vscode.workspace.openTextDocument(args.uri);
        dummydata.linetext = document.lineAt(args.lineNumber - 1).text;
        console.log("dummy " + dummydata.linetext);

        extractNames(document);
        let lineArray = lineNumbersName.filter(
          (entry) => entry["lineNumber"] === args.lineNumber - 1
        );
        let packagesList: string[] = [];
        lineArray.map((packaged) => packagesList.push(packaged.name));
        const uniquePackages = packagesList.filter((item, index, array) => array.indexOf(item) === index);
        dummydata.packages = uniquePackages;

        const allModules: { [key: string]: string[] } = {};
        dummydata.packages.forEach((packagename) => {
          allModules[packagename] = extractModules(document, packagename);
        });
        dummydata.modules = allModules;
      }
    }
    dummydata.tab = "form";
    dummydata.button = "form";

    HelloWorldPanel.render(context.extensionUri, dummydata);
  });

  const openDashboardCommand = vscode.commands.registerCommand(
    "hug-reports.openDashboard",
    async (args) => {
      if (activeEditor) {
        if (args) {
          if (args.lineNumber) {
            console.log("Line number: " + args.lineNumber);
            dummydata.linetext = activeEditor.document.lineAt(args.lineNumber - 1).text;
            console.log("dummy " + dummydata.linetext);

            extractNames(activeEditor.document);
            let lineArray = lineNumbersName.filter(
              (entry) => entry["lineNumber"] === args.lineNumber - 1
            );
            let packagesList: string[] = [];
            lineArray.map((packaged) => packagesList.push(packaged.name));
            const uniquePackages = packagesList.filter((item, index, array) => array.indexOf(item) === index);
            dummydata.packages = uniquePackages;
          }
        }
        let allModules: { [key: string]: string[] } = {};
        let document = activeEditor.document;
        dummydata.packages.forEach((packagename) => {
          allModules[packagename] = extractModules(document, packagename);
        });
        dummydata.modules = allModules;
      }
      if (!activeEditor) {
        if (args) {
          console.log("No active editor");
          const document = await vscode.workspace.openTextDocument(args.uri);
          dummydata.linetext = document.lineAt(args.lineNumber - 1).text;
          console.log("dummy " + dummydata.linetext);

          extractNames(document);
          
          let lineArray = lineNumbersName.filter(
            (entry) => entry["lineNumber"] === args.lineNumber - 1
          );
          let packagesList: string[] = [];
          lineArray.map((packaged) => packagesList.push(packaged.name));
          const uniquePackages = packagesList.filter((item, index, array) => array.indexOf(item) === index);
          dummydata.packages = uniquePackages;

          let allModules: { [key: string]: string[] } = {};
          dummydata.packages.forEach((packagename) => {
            allModules[packagename] = extractModules(document, packagename);
          });
          dummydata.modules = allModules;
        }
      }
      dummydata.tab = "recently thanked";
      dummydata.button = "dashboard";
      HelloWorldPanel.render(context.extensionUri, dummydata);
    }
  );

  const sayThanksCommand = vscode.commands.registerCommand(
    "hug-reports.sayThanks",
    async (args) => {
      const lineNumber: number = args.lineNumber;
      if (activeEditor) {
        activeLine = activeEditor.document.lineAt(args.lineNumber - 1).text;
        dummydata.linetext = activeLine;

        extractNames(activeEditor.document);
        
        let lineArray = lineNumbersName.filter(
          (entry) => entry["lineNumber"] === args.lineNumber - 1
        );
        lineArray.map((packaged) => dummydata.packages.push(packaged.name));

        let allModules: { [key: string]: string[] } = {};
        let document = activeEditor.document;
        dummydata.packages.forEach((packagename) => {
          allModules[packagename] = extractModules(document, packagename);
        });
        dummydata.modules = allModules;

        dummydata.packages.forEach(async (packagename) => {
          const data = {
            lineNumber,
            packagename,
            timestamp: new Date(),
            userId: id,
          };

          await saveResponseToMongoDB(data);
        });

        const additionalMessage =
          "Your thanks has been sent! If you feel inspired to share more, don't hesitate to send a note to the contributors. Your words of encouragement can make a world of difference and let them know just how much their efforts are valued.";
        const sayMore = "Say More";
        vscode.window
          .showInformationMessage(additionalMessage, { modal: true }, { title: sayMore })
          .then((selectedAction) => {
            if (selectedAction && selectedAction.title === sayMore) {
              vscode.commands.executeCommand(`hug-reports.sayMore`);
              console.log("saying more");
            }
          });
      }
    }
  );

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);
  context.subscriptions.push(sayThanksCommand);
  context.subscriptions.push(sayMoreCommand);
  context.subscriptions.push(openDashboardCommand);
}

export function deactivate() {
  lightDecoration.dispose();
  darkDecoration.dispose();
}

function extractNames(document: vscode.TextDocument) {
  let match: RegExpExecArray | null;

  if (document.languageId === "python") {
    //const pyImportRegex = /^(\s*(?:from\s+[\w\.]+)?\s*import\s+[\w\*\, ]+(?:\s+as\s+[\w]+)?)\b/gm;
    //const pyImportRegex = /^import\s*\S*|^from\s*\S*\s*import\s*\S*/gm;
    //const pyImportRegex = /^(\h*(?:from[^\S\r\n]+([\w]+|\.)[^\S\r\n]+)?import[^\S\r\n]+(([\w]+\b|\*)(?:[^\S\r\n]+as[^\S\r\n]+([\w]+\b|\*))?)+)/gm;
    const pyImportRegex =
      /^(\h*(?:from[^\S\r\n]+([\w.]+)[^\S\r\n]+)?import[^\S\r\n]+(([\w]+|\*)(?:[^\S\r\n]+as[^\S\r\n]+([\w]+))?)(?:,[^\S\r\n]+(([\w]+|\*)(?:[^\S\r\n]+as[^\S\r\n]+([\w]+))?))*)/gm;
    while ((match = pyImportRegex.exec(document.getText()))) {
      const lineNumber = document.positionAt(match.index).line;

      const importStatement = match[1].trim();
      const statements = importStatement.split(/^(?:import|from)\s+/).map((item) => item.trim());
      statements.forEach((item) => {
        let namesSplitByComma = item.split(/\s*,\s*/);
        const name = namesSplitByComma[0];
        if (name.includes("import")) {
          const packageName = name.split(/\s+import\s+/)[0];
          namesSplitByComma[0] = name.split(/\s+import\s+/)[1];
          namesSplitByComma.forEach((items) => {
            const nameSplitByAs = items.split(/\s+as\s+/);
            if (nameSplitByAs[0] === "*") {
              lineNumbersName.push({
                lineNumber: lineNumber,
                name: packageName,
                nickName: null,
                moduleName: null,
                moduleNickName: null,
              });
            } else {
              if (nameSplitByAs.length === 1) {
                lineNumbersName.push({
                  lineNumber: lineNumber,
                  name: packageName,
                  nickName: null,
                  moduleName: nameSplitByAs[0],
                  moduleNickName: null,
                });
              } else {
                lineNumbersName.push({
                  lineNumber: lineNumber,
                  name: packageName,
                  nickName: null,
                  moduleName: nameSplitByAs[0],
                  moduleNickName: nameSplitByAs[1],
                });
              }
            }
          });
        } else {
          namesSplitByComma.forEach((items) => {
            const nameSplitByAs = items.split(/\s+as\s+/);
            if (nameSplitByAs[0] === "") {
            } else {
              if (nameSplitByAs.length === 1) {
                lineNumbersName.push({
                  lineNumber: lineNumber,
                  name: nameSplitByAs[0],
                  nickName: null,
                  moduleName: null,
                  moduleNickName: null,
                });
              } else {
                lineNumbersName.push({
                  lineNumber: lineNumber,
                  name: nameSplitByAs[0],
                  nickName: nameSplitByAs[1],
                  moduleName: null,
                  moduleNickName: null,
                });
              }
            }
          });
        }
      });
    }
  } else if (document.languageId === "javascript" || document.languageId === "typescript") {
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
      const lineNumber = document.positionAt(match.index).line;
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
          lineNumbersName.push({
            lineNumber: lineNumber,
            name: bracketName.split(/\s*\}\s*/)[0],
            nickName: null,
            moduleName: null,
            moduleNickName: null,
          });
        } else {
          lineNumbersName.push({
            lineNumber: lineNumber,
            name: item,
            nickName: null,
            moduleName: null,
            moduleNickName: null,
          });
        }
      });
    }

    const jsRequireRegex =
      /(const|let)\s+\{?\s*([\w,\s]+)\s*\}?\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)[^;]*;/g;
    while ((match = jsRequireRegex.exec(document.getText()))) {
      if (match[3].trim().startsWith("./") || match[3].trim().startsWith("/")) {
        continue;
      }
      const lineNumber = document.positionAt(match.index).line;
      if (match[2].includes(",")) {
        const splitNames = match[2].replace(/\s/g, "").split(",");
        splitNames.forEach((name) =>
          lineNumbersName.push({
            lineNumber: lineNumber,
            name: name,
            nickName: null,
            moduleName: null,
            moduleNickName: null,
          })
        );
      } else {
        lineNumbersName.push({
          lineNumber: lineNumber,
          name: match[2].trim(),
          nickName: null,
          moduleName: null,
          moduleNickName: null,
        });
      }
    }
  }

  if (lineNumbersName.length === 0) {
    hasImport = false;
  } else {
    hasImport = true;
  }
}

function extractModules(document: vscode.TextDocument, packaged: string) {
  const text = document.getText();
  const pattern = new RegExp(packaged.concat("\\.\\w+[\\(\\.]"), "g");
  const matches: string[] = [];
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.length >= 1) {
      const modules = match[0].split(".")[1].split("(")[0];
      matches.push(modules);
    }
  }

  const parsedPackages = lineNumbersName.filter((obj) => obj.name === packaged);
  parsedPackages.forEach((element) => {
    if (element.nickName !== null) {
      const nickPattern = new RegExp(element.nickName.concat("\\.\\w+[\\(\\.]"), "g");
      while ((match = nickPattern.exec(text)) !== null) {
        if (match.length >= 1) {
          const modules = match[0].split(".")[1].split("(")[0];
          matches.push(modules);
        }
      }
    }

    if (element.moduleName !== null) {
      let modPattern;
      if (element.moduleNickName !== null) {
        modPattern = new RegExp(element.moduleNickName.concat("\\("), "g");
      } else {
        modPattern = new RegExp(element.moduleName.concat("\\("), "g");
      }

      while ((match = modPattern.exec(text)) !== null) {
        if (match.length >= 1) {
          matches.push(element.moduleName);
          break;
        }
      }
    }
  });

  const uniqueMatches = matches.filter((item, index, array) => array.indexOf(item) === index);

  return uniqueMatches;
}

function detectColorTheme() {
  currentColorTheme = vscode.workspace.getConfiguration("workbench").get("colorTheme");

  if (currentColorTheme?.includes("light") || currentColorTheme?.includes("Light")) {
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
