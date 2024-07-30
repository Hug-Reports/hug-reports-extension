import * as vscode from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import Module = require("module");
import {
  ModuleType,
  PackageDictionary,
  PackageType,
  extractModules,
  extractNames,
} from "./parser/parser";
const path = require("path");
const globals = require("../globals");
const BACKEND = globals.BACKEND;

const blockedPythonModules = [
  "__future__",
  "__main__",
  "_thread",
  "_tkinter",
  "abc",
  "aifc",
  "argparse",
  "array",
  "ast",
  "asyncio",
  "atexit",
  "audioop",
  "base64",
  "bdb",
  "binascii",
  "bisect",
  "builtins",
  "bz2",
  "calendar",
  "cgi",
  "cgitb",
  "chunk",
  "cmath",
  "cmd",
  "code",
  "codecs",
  "codeop",
  "collections",
  "colorsys",
  "compileall",
  "concurrent",
  "configparser",
  "contextlib",
  "contextvars",
  "copy",
  "copyreg",
  "cProfile",
  "crypt",
  "csv",
  "ctypes",
  "curses",
  "dataclasses",
  "datetime",
  "dbm",
  "decimal",
  "difflib",
  "dis",
  "doctest",
  "email",
  "encodings",
  "ensurepip",
  "enum",
  "errno",
  "faulthandler",
  "fcntl",
  "filecmp",
  "fileinput",
  "fnmatch",
  "fractions",
  "ftplib",
  "functools",
  "gc",
  "getopt",
  "getpass",
  "gettext",
  "glob",
  "graphlib",
  "grp",
  "gzip",
  "hashlib",
  "heapq",
  "hmac",
  "html",
  "http",
  "idlelib",
  "imaplib",
  "imghdr",
  "importlib",
  "inspect",
  "io",
  "ipaddress",
  "itertools",
  "json",
  "keyword",
  "lib2to3",
  "linecache",
  "locale",
  "logging",
  "lzma",
  "mailbox",
  "mailcap",
  "marshal",
  "math",
  "mimetypes",
  "mmap",
  "modulefinder",
  "msilib",
  "msvcrt",
  "multiprocessing",
  "netrc",
  "nis",
  "nntplib",
  "numbers",
  "operator",
  "optparse",
  "os",
  "ossaudiodev",
  "pathlib",
  "pdb",
  "pickle",
  "pickletools",
  "pipes",
  "pkgutil",
  "platform",
  "plistlib",
  "poplib",
  "posix",
  "pprint",
  "profile",
  "pstats",
  "pty",
  "pwd",
  "py_compile",
  "pyclbr",
  "pydoc",
  "queue",
  "quopri",
  "random",
  "re",
  "readline",
  "reprlib",
  "resource",
  "rlcompleter",
  "runpy",
  "sched",
  "secrets",
  "select",
  "selectors",
  "shelve",
  "shlex",
  "shutil",
  "signal",
  "site",
  "sitecustomize",
  "smtplib",
  "sndhdr",
  "socket",
  "socketserver",
  "spwd",
  "sqlite3",
  "ssl",
  "stat",
  "statistics",
  "string",
  "stringprep",
  "struct",
  "subprocess",
  "sunau",
  "symtable",
  "sys",
  "sysconfig",
  "syslog",
  "tabnanny",
  "tarfile",
  "telnetlib",
  "tempfile",
  "termios",
  "test",
  "textwrap",
  "threading",
  "time",
  "timeit",
  "tkinter",
  "token",
  "tokenize",
  "tomllib",
  "trace",
  "traceback",
  "tracemalloc",
  "tty",
  "turtle",
  "turtledemo",
  "types",
  "typing",
  "unicodedata",
  "unittest",
  "urllib",
  "usercustomize",
  "uu",
  "uuid",
  "venv",
  "warnings",
  "wave",
  "weakref",
  "webbrowser",
  "winreg",
  "winsound",
  "wsgiref",
  "xdrlib",
  "xml",
  "xmlrpc",
  "zipapp",
  "zipfile",
  "zipimport",
  "zlib",
  "zoneinfo",
];

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

let lineNumbersName: PackageDictionary = {};
let oldLineNumbersName: PackageDictionary = {};
let filteredLineNumbersName: PackageDictionary = {};

interface additionalData {
  userid: string;
  linetext: string;
  tab: string;
  button: string;
  modules: PackageType[];
  theme: string; // light or dark
  language: string;
}

type AddData = additionalData;

async function setLineDecorations(activeEditor: vscode.TextEditor) {
  if (JSON.stringify(lineNumbersName) !== JSON.stringify(oldLineNumbersName)) {
    //copy lineNumbersName to oldLineNumbersName
    oldLineNumbersName = JSON.parse(JSON.stringify(lineNumbersName));
    let languageid: string | undefined = activeEditor?.document.languageId;
    if (languageid === "python") {
      for (const [key, value] of Object.entries(lineNumbersName)) {
        const numericKey = Number(key);
        // Check if the package is in the database
        for (let i = 0; i < value.length; i++) {
          if (!blockedPythonModules.includes(value[i].packageName)) {
            if (!filteredLineNumbersName[numericKey]) {
              filteredLineNumbersName[numericKey] = [value[i]];
            } else {
              filteredLineNumbersName[numericKey].push(value[i]);
            }
          }
        }
      }
      let filteredlineNumbers = Object.keys(filteredLineNumbersName).map(Number);
      let filteredlineDecorations = filteredlineNumbers.map((lineNumber) => ({
        range: new vscode.Range(lineNumber, 0, lineNumber, 0),
      }));
      activeEditor.setDecorations(lightDecoration, []);
      activeEditor.setDecorations(darkDecoration, []);
      if (currentColorTheme === "light") {
        activeEditor.setDecorations(lightDecoration, filteredlineDecorations);
      } else {
        activeEditor.setDecorations(darkDecoration, filteredlineDecorations);
      }
    } else {
      if (languageid === "javascript" || languageid === "typescript" || languageid === "typescriptreact") {
        let filteredlineNumbers = Object.keys(lineNumbersName).map(Number);
        let filteredlineDecorations = filteredlineNumbers.map((lineNumber) => ({
          range: new vscode.Range(lineNumber, 0, lineNumber, 0),
        }));
        activeEditor.setDecorations(lightDecoration, []);
        activeEditor.setDecorations(darkDecoration, []);
        if (currentColorTheme === "light") {
          activeEditor.setDecorations(lightDecoration, filteredlineDecorations);
        } else {
          activeEditor.setDecorations(darkDecoration, filteredlineDecorations);
        }
      }
    }
  } else {
    console.log("No change in lineNumbersName");
  }
}

function updateImports(document: vscode.TextDocument) {
  lineNumbersName = extractNames(document);
  lineNumbers = Object.keys(lineNumbersName).map(Number);
  if (lineNumbers.length === 0) {
    hasImport = false;
  } else {
    hasImport = true;
  }
}

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
    userid: "",
    linetext: "",
    tab: "",
    button: "",
    modules: [],
    theme: "light",
    language: "python",
  };

  globalState = context.globalState;

  if (globalState.get("id")) {
    // id already exists in local storage
    id = globalState.get("id");
  } else {
    setUserId();
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
    setLineDecorations(activeEditor);
  }

  vscode.workspace.onDidChangeTextDocument((event) => {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && event.document === activeEditor.document) {
      const { document } = activeEditor;
      updateImports(document);
      setLineDecorations(activeEditor);
    }
  });
  // End

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    activeEditor = editor;

    if (editor) {
      const { document } = editor;

      updateImports(document);
      setLineDecorations(editor);
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
    let test = false;
    let languageid: string | undefined = activeEditor?.document.languageId;
    if (!activeEditor) {
      if (args) {
        const document = await vscode.workspace.openTextDocument(args.uri);
        //get language id of document
        languageid = document.languageId;
      }
    }
    if (languageid === "python") {
      if (args.lineNumber - 1 in filteredLineNumbersName) {
        test = true;
      }
    } else if (languageid === "javascript" || languageid === "typescript" || languageid === "typescriptreact") {
      if (args.lineNumber - 1 in lineNumbersName) {
        test = true;
      }
    }
    if (test) {
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
          languageid = document.languageId;
          dummydata.linetext = document.lineAt(args.lineNumber - 1).text;
          console.log("dummy " + dummydata.linetext);
          updateImports(document);
          dummydata.modules = getModules(document, args.lineNumber - 1);
        }
      }
      dummydata.tab = "form";
      dummydata.button = "form";
      id = globalState.get("id");
      if (id) {
        dummydata.userid = id;
      }
      if (languageid) {
        dummydata.language = languageid;
      }
      if (currentColorTheme) {
        dummydata.theme = currentColorTheme;
      }
      console.log("dummy data");
      console.log(dummydata);
      HelloWorldPanel.render(context.extensionUri, dummydata);
    }
  });

  const sayThanksCommand = vscode.commands.registerCommand(
    "hug-reports.sayThanks",
    async (args) => {
      let test = false;
      let languageid: string | undefined = activeEditor?.document.languageId;
      if (!activeEditor) {
        if (args) {
          const document = await vscode.workspace.openTextDocument(args.uri);
          //get language id of document
          languageid = document.languageId;
        }
      }
      if (languageid === "python") {
        if (args.lineNumber - 1 in filteredLineNumbersName) {
          test = true;
        }
      } else if (languageid === "javascript" || languageid === "typescript" || languageid === "typescriptreact") {
        if (args.lineNumber - 1 in lineNumbersName) {
          test = true;
        }
      }
      if (test) {
        const lineNumber: number = args.lineNumber;
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
            //get language id of document
            languageid = document.languageId;
            dummydata.linetext = document.lineAt(args.lineNumber - 1).text;
            console.log("dummy " + dummydata.linetext);
            updateImports(document);
            dummydata.modules = getModules(document, args.lineNumber - 1);
          }
        }
        id = globalState.get("id");
        if (id) {
          dummydata.userid = id;
        }
        console.log("dummy data");
        console.log(dummydata);
        dummydata.modules.forEach(async (module) => {
          const thanksResponse = await fetch(`https://${BACKEND}/addThanks`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userid: dummydata.userid,
              packagename: module.packageName,
              modules: [""],
              personalnotes: {
                note1: "Thank you for your contributions.",
                note2: "Great work on the random module!",
              },
              language: languageid,
            }),
          });
          const { message, thanks } = await thanksResponse.json();
          console.log(message);
          console.log(thanks);
        });

        const additionalMessage =
          "Your thanks has been sent! If you feel inspired to share more, don't hesitate to send a note to the contributors. Your words of encouragement can make a world of difference and let them know just how much their efforts are valued.";
        const sayMore = "Say More";
        vscode.window
          .showInformationMessage(additionalMessage, { modal: true }, { title: sayMore })
          .then((selectedAction) => {
            if (selectedAction && selectedAction.title === sayMore) {
              vscode.commands.executeCommand(`hug-reports.sayMore`, args);
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
    const userAddedResponse = await fetch(`https://${BACKEND}/addUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "temp",
      }),
    });
    const { id } = await userAddedResponse.json();
    insertedId = id;
  } catch (error) {
    console.error("Error saving user to MongoDB: ", error);
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
