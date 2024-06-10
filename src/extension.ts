import * as vscode from "vscode";
import { HugReportsPanel } from "./panels/HelloWorldPanel";
import Module = require("module");
import { ModuleType, PackageDictionary, PackageType, extractModules, extractNames } from "./parser";
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

let lineNumbersName: PackageDictionary = {};

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
  tab: string;
  button: string;
  modules: PackageType[];
}

type AddData = additionalData;

function updateImports(document: vscode.TextDocument) {
  lineNumbersName = extractNames(document);
  lineNumbers = Object.keys(lineNumbersName).map(Number);
  if (lineNumbers.length === 0) {
    hasImport = false;
  } else {
    hasImport = true;
  }
}

/*

function getPackages(document: vscode.TextDocument, lineNumber: number) {
  updateImports(document);
  let linePackages = lineNumbersName[lineNumber];
  console.log(linePackages);
  let packagesList: string[] = [];
  linePackages.map((packaged) => packagesList.push(packaged.packageName));
  const uniquePackages = packagesList.filter((item, index, array) => array.indexOf(item) === index);
  console.log(uniquePackages);
  return uniquePackages;
}

*/

function getModules(document: vscode.TextDocument, lineNumber: number) {
  console.log("line number: " + lineNumber);
  const linePackages = lineNumbersName[lineNumber];
  console.log(linePackages);
  try {
    linePackages.forEach((packageType) => {
      const packageAliases = packageType.aliases;
      let allModuleInstances: ModuleType[] = [];
      packageAliases.forEach((alias) => {
        allModuleInstances = allModuleInstances.concat(
          extractModules(document, alias, packageType.modules, packageAliases)
        );
        //console.log(allModuleInstances);
      });
      packageType.modules = packageType.modules.concat(allModuleInstances);
      const isUniqueModule = (module: ModuleType, index: number, self: ModuleType[]) => {
        return (
          self.findIndex(
            (m) => m.identifier === module.identifier && m.searchModules === module.searchModules
          ) === index
        );
      };

      packageType.modules = packageType.modules.filter(isUniqueModule);
    });
    console.log("got here");
    console.log(linePackages);
    return linePackages;
  } catch (error) {
    console.error("Error getting modules: ", error);
    return linePackages;
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Create the show hello world command
  let dummydata: AddData = {
    userid: "Pranav",
    linetext: "",
    tab: "",
    button: "",
    modules: [],
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
    updateImports(document);

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

      updateImports(document);

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

      updateImports(document);

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
      HugReportsPanel.render(context.extensionUri, dummydata);
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

      let document = activeEditor.document;
      updateImports(document);
      dummydata.modules = getModules(document, args.lineNumber - 1);
    }
    if (!activeEditor) {
      if (args) {
        console.log("No active editor");
        const document = await vscode.workspace.openTextDocument(args.uri);
        dummydata.linetext = document.lineAt(args.lineNumber - 1).text;
        console.log("dummy " + dummydata.linetext);
        updateImports(document);
        dummydata.modules = getModules(document, args.lineNumber - 1);
      }
    }
    dummydata.tab = "form";
    dummydata.button = "form";
    console.log("dummy data");
    console.log(dummydata);
    HugReportsPanel.render(context.extensionUri, dummydata);
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
          }
        }
        let document = activeEditor.document;
        updateImports(document);
        dummydata.modules = getModules(document, args.lineNumber - 1);
      }
      if (!activeEditor) {
        if (args) {
          console.log("No active editor");
          const document = await vscode.workspace.openTextDocument(args.uri);
          dummydata.linetext = document.lineAt(args.lineNumber - 1).text;
          updateImports(document);
          dummydata.modules = getModules(document, args.lineNumber - 1);
        }
      }
      dummydata.tab = "recently thanked";
      dummydata.button = "dashboard";
      console.log("dummy data");
      console.log(dummydata);
      HugReportsPanel.render(context.extensionUri, dummydata);
    }
  );

  const sayThanksCommand = vscode.commands.registerCommand(
    "hug-reports.sayThanks",
    async (args) => {
      const lineNumber: number = args.lineNumber;
      if (activeEditor) {
        activeLine = activeEditor.document.lineAt(args.lineNumber - 1).text;
        dummydata.linetext = activeLine;

        let document = activeEditor.document;
        updateImports(document);
        dummydata.modules = getModules(document, args.lineNumber - 1);

        dummydata.modules.forEach(async (packageType) => {
          const data = {
            lineNumber: lineNumber,
            packageName: packageType.packageName,
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
