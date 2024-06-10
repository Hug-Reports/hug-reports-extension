import { useState } from "react";
import "./App.css";
import {
  SayMoreNav,
  SayMoreSelectPackage,
  SayMoreSelectModules,
  SayMoreContributors,
  SayMoreForm,
} from "./SayMore";
import { Usage } from "./Usage";
import { DashboardNav, RecentlyThanked } from "./Thanked";
import { shorthands, makeStyles, tokens } from "@fluentui/react-components";

declare global {
  interface Window {
    lineofcode: any; // Use a more specific type instead of any if possible
    contributors: any;
    image: any;
  }
}

function App() {
  const lineofcode = window.lineofcode;
  const modulesDict = lineofcode.modules;
  const [thankPackages, setPackage] = useState(modulesDict.map(item => item.packageName));
  // const contributors = window.contributors;
  const [button, setButton] = useState(lineofcode.button);
  const [tab, setTab] = useState(lineofcode.tab);
  const [page, setPage] = useState(button);
  const [packageModules, setModule] = useState(modulesDict.reduce((acc, pkg) => {
    return acc.concat(pkg.modules.map(moduleType => moduleType.identifier));
  }, []));

  const useStyles = makeStyles({
    root: {
      marginTop: tokens.spacingVerticalS,
      marginBottom: tokens.spacingVerticalS,
      marginLeft: tokens.spacingHorizontalS,
      marginRight: tokens.spacingHorizontalS,
    },
    textbox: {
      width: "100%",
      marginBottom: tokens.spacingVerticalS,
    },
    moduleSelectBox: {
      display: "grid",
      gridTemplateRows: "repeat(1fr)",
      justifyItems: "start",
      ...shorthands.gap("2px"),
    },
    comboBox: {
      width: "100%",
    },
    wrapper: {
      alignItems: "center",
      columnGap: "15px",
      display: "flex",
    },
    topPackage: {},
    tagsList: {
      listStyleType: "none",
      marginBottom: tokens.spacingVerticalXXS,
      marginTop: 0,
      paddingLeft: 0,
      display: "flex",
      gridGap: tokens.spacingHorizontalXXS,
    },
  });

  const styles = useStyles();

  const [selectedPackageOptions, setSelectedPackageOptions] = useState<string[]>(thankPackages);

  return (
    <main className={styles.root}>
      {button === "form" ? (
        <SayMoreNav page={page} setPage={setPage} setTab={setTab} />
      ) : null}

      {tab === "form" ? (
        <div className="sayMoreForm">
          <SayMoreSelectPackage
            styles={styles}
            selectedPackageOptions={selectedPackageOptions}
            setSelectedPackageOptions={setSelectedPackageOptions}
            modulesDict={modulesDict}
            setModule={setModule}
          />
          {selectedPackageOptions.length > 1 ? null : (
            <div className="fillForm">
              <SayMoreSelectModules styles={styles} packageModules={packageModules} setModule={setModule} />
              <SayMoreForm styles={styles} />
            </div>
          )}
        </div>
      ) : (
        <DashboardNav tab={tab} setTab={setTab} />
      )}

      {tab === "recently thanked" && (
        <RecentlyThanked
          setPackage={setPackage}
          setSelectedPackageOptions={setSelectedPackageOptions}
          setButton={setButton}
          setTab={setTab}
          setPage={setPage}
          setModule={setModule}
          modulesDict={modulesDict}
        />
      )}

      {tab === "usage" && <Usage styles={styles} />}
    </main>
  );
}

export default App;
