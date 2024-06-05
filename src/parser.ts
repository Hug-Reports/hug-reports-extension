import * as vscode from "vscode";
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
      const packageDictEntry: PackageType[] = [];
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
          packageDictEntry.push({
            packageName: bracketName.split(/\s*\}\s*/)[0],
            modules: [],
            aliases: [],
          });
        } else {
          packageDictEntry.push({
            packageName: item,
            modules: [],
            aliases: [],
          });
        }
      });
      packageDictionary[lineNumber] = packageDictEntry;
    }

    const jsRequireRegex =
      /(const|let)\s+\{?\s*([\w,\s]+)\s*\}?\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)[^;]*;/g;
    while ((match = jsRequireRegex.exec(document.getText()))) {
      if (match[3].trim().startsWith("./") || match[3].trim().startsWith("/")) {
        continue;
      }
      const lineNumber = document.positionAt(match.index).line;
      const packageDictEntry: PackageType[] = [];
      if (match[2].includes(",")) {
        const splitNames = match[2].replace(/\s/g, "").split(",");
        splitNames.forEach((name) =>
          packageDictEntry.push({
            packageName: name,
            modules: [],
            aliases: [],
          })
        );
      } else {
        packageDictEntry.push({
          packageName: match[2].trim(),
          modules: [],
          aliases: [],
        });
      }
      packageDictionary[lineNumber] = packageDictEntry;
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
  const text = document.getText();
  //const regexString: string = "\\b" + alias + "(?:\\.\\w)*\\(";
  //console.log(regexString);
  //const pattern: RegExp = new RegExp(regexString);
  const pattern = new RegExp(alias.concat("(\\.[A-Za-z0-9_]+)*[\\(]"), "g");
  const matches: ModuleType[] = [];
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.length >= 1) {
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
