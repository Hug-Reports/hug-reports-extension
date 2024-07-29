import * as vscode from "vscode";
import { createPythonPackageObject, extractModulesPython } from "./python-parser";
import { createJSObject, extractModulesJS } from "./js-parser";

export type ModuleType = {
  searchModules: string;
  identifier: string;
};

export type PackageType = {
  packageName: string;
  modules: ModuleType[];
  aliases: string[];
};

export type PackageDictionary = {
  [key: number]: PackageType[];
};

export function extractNames(document: vscode.TextDocument) {
  let match: RegExpExecArray | null;
  const packageDictionary: PackageDictionary = {};
  if (document.languageId === "python") {
    const pyImportRegex = /(^import\s+\S+.*|^from\s+\S+\s+import\s+.*)$/gm;
    while ((match = pyImportRegex.exec(document.getText()))) {
      const lineNumber = document.positionAt(match.index).line;
      const importStatement = match[1].trim();
      createPythonPackageObject(lineNumber, importStatement, packageDictionary);
    }
  } else if (document.languageId === "javascript" || document.languageId === "typescript" || document.languageId === "typescriptreact") {
    const jsImportRegex =
      /^import\s+(?:(?:[,\w*\s{}]*\s+from\s+)?["'][^\."'][^"']+["']|\s*["'][^\."'][^"']+["'])\s*;?/gm;
    while ((match = jsImportRegex.exec(document.getText()))) {
      const lineNumber = document.positionAt(match.index).line;
      const importStatement = match[0].trim();
      createJSObject(lineNumber, importStatement, packageDictionary);
    }
  }

  return packageDictionary;
}

export function extractModules(
  document: vscode.TextDocument,
  alias: string,
  modulesList: ModuleType[],
  aliasList: string[]
) {
  let moduleMatches: ModuleType[] = [];
  if (document.languageId === "python") {
    moduleMatches = extractModulesPython(document, alias, modulesList, aliasList);
  } else if (document.languageId === "javascript" || document.languageId === "typescript" || document.languageId === "typescriptreact") {
    moduleMatches = extractModulesJS(document, alias, modulesList, aliasList);
  }
  return moduleMatches;
}
