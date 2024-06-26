import * as vscode from "vscode";
import { ModuleType, PackageDictionary, PackageType } from "./parser";

export function createJSObject(
    linenumber: number,
    lineofcode: string,
    packageDictionary: PackageDictionary
  ) {
    let lineArray = lineofcode.trim().replace(/[{}]/g, "").split(" ");
    const packageDictEntry = [];
    let idx: number = 1;
    let packageName: string = "";
    const modules: ModuleType[] = [];
    const aliases: string[] = [];
    while (idx < lineArray.length) {
      const cleanedLine = lineArray[idx].trim();
      if (lineArray[idx] === "from" || cleanedLine === '' || lineArray[idx] === ',') {
        idx += 1;
        continue;
      }
  
      if (lineArray[idx].includes('"') || lineArray[idx].includes("'")) {
        packageName = lineArray[idx].replace(/[;'"]/g, "");
        idx += 1;
      } else {
        let cleanToken = lineArray[idx];
        let multipleModules = cleanToken.trim().split(",").filter(item => item !== '');     // check for no space in between modules\
        if (multipleModules.length > 1) {
          for (let i = 0; i< multipleModules.length - 1; i++) {
            // all except last must just be module name
            modules.push({
              searchModules: multipleModules[i].trim(),
              identifier: multipleModules[i].trim(),
            });
            aliases.push(multipleModules[i]);
          }
          cleanToken = multipleModules[multipleModules.length - 1];
        }
        cleanToken = cleanToken.replace(/,/g, "");
        let searchModules = cleanToken;
        let identifier = cleanToken;
        idx += 1;
        if (lineArray[idx] === "as") {
          idx += 1;
          multipleModules = lineArray[idx].trim().split(",").filter(item => item !== '');
          if (multipleModules.length > 1) {
            lineArray = [...lineArray.slice(0, idx), ...multipleModules, ...lineArray.slice(idx + 1)];
          }
          aliases.push(lineArray[idx].trim());
          identifier = lineArray[idx];
          idx += 1;
        } else {
          aliases.push(cleanToken.trim());
        }
  
        modules.push({
          searchModules: searchModules,
          identifier: identifier,
        });
      }
    }
    packageDictEntry.push({
      packageName: packageName,
      modules: modules,
      aliases: aliases,
    });
    console.log(packageDictEntry);
    packageDictionary[linenumber] = packageDictEntry;
  }


  export function extractModulesJS(
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
            const index = aliasList.indexOf(identifier);
            searchModule = modulesList[index].searchModules;
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
  