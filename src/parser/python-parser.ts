import * as vscode from "vscode";
import { ModuleType, PackageDictionary, PackageType } from "./parser";

export function createPythonPackageObject(
  linenumber: number,
  lineofcode: string,
  packageDictionary: PackageDictionary
) {
  let line = lineofcode.replace(/,/g, "").trim();

  const lineArray = line.split(" ");
  const packageDictEntry = [];
  if (line.startsWith("import")) {
    let idx: number = 1;
    while (idx < lineArray.length) {
      let packageName: string = "";
      const modules: ModuleType[] = [];
      const aliases: string[] = [];
      packageName = lineArray[idx].split(".")[0];

      if (lineArray[idx].split(".").length > 1) {
        modules.push({
          searchModules: lineArray[idx].split(".").slice(1).join("."),
          identifier: lineArray[idx],
        });
      }

      idx += 1;
      if (lineArray[idx] === "as") {
        idx += 1;
        aliases.push(lineArray[idx]);
        idx += 1;
      } else {
        aliases.push(lineArray[idx - 1]);
      }

      let foundItem: PackageType | undefined = packageDictEntry.find(
        (item) => item.packageName === packageName
      );

      if (foundItem) {
        foundItem.modules = foundItem.modules.concat(modules);
        foundItem.aliases = foundItem.aliases.concat(aliases);
      } else {
        packageDictEntry.push({
          packageName: packageName,
          modules: modules,
          aliases: aliases,
        });
      }
    }
    packageDictionary[linenumber] = packageDictEntry;
  } else if (line.startsWith("from")) {
    let idx: number;
    let packageName = lineArray[1].split(".")[0];

    const modules: ModuleType[] = [];
    const aliases: string[] = [];
    if (lineArray[2] === "import") {
      idx = 3;
      while (idx < lineArray.length) {
        const splitReferenceModules = lineArray[idx].split(".");
        const searchModules = lineArray[idx].split(".")[splitReferenceModules.length - 1];
        let identifier = lineArray[idx];
        idx += 1;
        if (lineArray[idx] === "as") {
          idx += 1;
          aliases.push(lineArray[idx]);
          identifier = lineArray[idx];
          idx += 1;
        } else {
          aliases.push(lineArray[idx - 1]);
        }
        // modules.push({
        //   searchModules: searchModules,
        //   identifier: identifier,
        // });
      }
    }
    packageDictEntry.push({
      packageName: packageName,
      modules: modules,
      aliases: aliases,
    });
    packageDictionary[linenumber] = packageDictEntry;
  }
}

export function extractModulesPython(
  document: vscode.TextDocument,
  alias: string,
  modulesList: ModuleType[],
  aliasList: string[]
) {
  const text = document.getText();
  //const regexString: string = "\\b" + alias + "(?:\\.\\w)*\\(";
  //console.log(regexString);
  //const pattern: RegExp = new RegExp(regexString);
  const pattern = new RegExp(`(?<=[^A-Za-z0-9_])${alias.concat("(\\.[A-Za-z0-9_]+)*[\\(]")}`, "g");
  const matches: ModuleType[] = [];
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.length >= 1) {
      console.log("Match:" + match[0]);
      const identifier = match[0].split("(")[0].trim();
      const splitReferenceModules = match[0].split(".");
      let searchModule;
      if (splitReferenceModules.length === 1) {
        searchModule = identifier;
      } else {
        searchModule = match[0].split(".")[splitReferenceModules.length - 1].replace("(", "");
      }
      console.log("Module:" + searchModule);
      matches.push({
        searchModules: searchModule,
        identifier: identifier,
      });
    }
  }

  const isUniqueModule = (module: ModuleType, index: number, self: ModuleType[]) => {
    return (
      self.findIndex(
        (m) => m.identifier === module.identifier && m.searchModules === module.searchModules
      ) === index
    );
  };

  const uniqueMatches = matches.filter(isUniqueModule);
  return uniqueMatches;
}
