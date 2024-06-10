import "./App.css";
import { useState, useRef } from "react";
import {
  Button,
  Textarea,
  TabList,
  Tab,
  Label,
  SelectTabData,
  SelectTabEvent,
  Combobox,
  Option,
} from "@fluentui/react-components";
import type { ComboboxProps } from "@fluentui/react-components";
import { Dismiss12Regular } from "@fluentui/react-icons";

export function SayMoreNav({ page, setPage, setTab }) {
  const onSayMoreTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    if (data.value === "form") {
      setTab("form");
      setPage("form");
    } else {
      setTab("recently thanked");
      setPage("dashboard");
    }
  };

  return (
    <div className="navigation">
      <TabList selectedValue={page} onTabSelect={onSayMoreTabSelect}>
        <Tab value="form">Say More</Tab>
        <Tab value="dashboard">Dashboard</Tab>
      </TabList>
    </div>
  );
}

export function SayMoreSelectPackage({
  styles,
  selectedPackageOptions,
  setSelectedPackageOptions,
  modulesDict,
  setModule,
}) {
  const selectedPackageListRef = useRef<HTMLUListElement>(null);
  // const [test, setTest] = useState("");

  const onTagClick = (option: string, index: number) => {
    let newSelectedPackages = selectedPackageOptions;
    // remove selected option
    if (selectedPackageOptions.length > 1) {
      newSelectedPackages = selectedPackageOptions.filter((o) => o !== option);
      setSelectedPackageOptions(newSelectedPackages);

      // focus previous or next option, defaulting to focusing back to the combo input
      const indexToFocus = index === 0 ? 1 : index - 1;
      const optionToFocus = selectedPackageListRef.current?.querySelector(
        `#packageTags-remove-${indexToFocus}`
      );
      if (optionToFocus) {
        (optionToFocus as HTMLButtonElement).focus();
      }
    }

    const filteredModules = modulesDict.filter((entry) =>
      newSelectedPackages.includes(entry.packageName)
    );

    const newModules = filteredModules.reduce((acc, pkg) => {
      return acc.concat(pkg.modules.map((moduleType) => moduleType.identifier));
    }, []);

    setModule(newModules);
  };

  let labelString: string;
  let tagSymbol: boolean;
  if (selectedPackageOptions.length > 1) {
    labelString = "Please select a package to thank: ";
    tagSymbol = true;
  } else {
    labelString = "You are thanking the following package: ";
    tagSymbol = false;
  }

  return (
    <div className="sayMoreFormHeader">
      <h2>Say Thanks</h2>
      <p>Send a personal note to let the contributors know how their code has helped you!</p>

      <div className="selectedPackages">
        <label id="packageTags">{labelString}</label>
        <ul className={styles.tagsList}>
          {selectedPackageOptions.map((option, i) => (
            <li key={option}>
              <Button
                size="small"
                shape="circular"
                appearance="primary"
                icon={tagSymbol ? <Dismiss12Regular /> : null}
                iconPosition="after"
                onClick={() => onTagClick(option, i)}
                id={`packageTags-remove-${i}`}
                aria-labelledby={`packageTags-remove packageTags-remove-${i}`}>
                {option}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SayMoreSelectModules({ styles, packageModules, setModule }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [comboxValue, setComboValue] = useState("");

  const onSelectModuleSelect: ComboboxProps["onOptionSelect"] = (event, data) => {
    // update selectedOptions
    setSelectedOptions(data.selectedOptions);

    // reset value to an empty string after selection
    setComboValue("");
  };

  // clear value on focus
  const onFocusModuleSelect = () => {
    setComboValue("");
  };

  // update value to selected options on blur
  const onBlurModuleSelect = () => {
    setComboValue(selectedOptions.join(", "));
  };

  // update value on input change
  const onChangeModuleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComboValue(event.target.value);
  };

  const selectAllOption = () => {
    if (!packageModules.includes("Select entire package") && packageModules.length >= 1) {
      const newModules = ["Select entire package"].concat(packageModules);
      setModule(newModules);
    }
  };

  selectAllOption();

  return (
    <div className="selectedModules">
      {packageModules.length >= 1 ? (
        <div className={styles.moduleSelectBox}>
          <label id="comboModules">Select functions you would like to thank:</label>
          <Combobox
            className={styles.comboBox}
            aria-labelledby="comboModules"
            multiselect={true}
            placeholder="Click to select"
            value={comboxValue}
            onBlur={onBlurModuleSelect}
            onChange={onChangeModuleSelect}
            onFocus={onFocusModuleSelect}
            onOptionSelect={onSelectModuleSelect}>
            {packageModules.map((amodule) => (
              <Option key={amodule}>{amodule}</Option>
            ))}
          </Combobox>
        </div>
      ) : null}
      <br></br>
    </div>
  );
}

export function SayMoreContributors() {
  const contributors = ["usera", "userb", "userc", "userd", "usere"];
  return (
    <div className="contributors">
      <p>Your thanks goes to:</p>
      <p>{contributors.join(", ")}</p>
    </div>
  );
}

export function SayMoreForm({ styles }) {
  return (
    <form>
      <div className="useCase">
        <Label htmlFor="useCase">What is your specific use case for this package? </Label>
        <br></br>
        <Textarea
          rows={3}
          id="useCase"
          name="useCase"
          className={styles.textbox}
          placeholder="Ex. I used functions abc from the efg library to analyze data for my study on xyz."
        />
      </div>

      <div className="helpfulReason">
        <Label htmlFor="helpfulReason">Why was this package useful?</Label>
        <br></br>
        <Textarea
          rows={3}
          id="helpfulReason"
          name="helpfulReason"
          className={styles.textbox}
          placeholder="Ex. Package efg saved me a month on my project xyz."
        />
      </div>

      <div className="personalNote">
        <Label htmlFor="personalNote">Any additional notes?</Label>
        <br></br>
        <Textarea
          rows={3}
          id="personalNote"
          name="personalNote"
          className={styles.textbox}
          placeholder="Ex. I thought the design of xyz was nice!"/>
      </div>

      <Button appearance="primary">Submit</Button>
    </form>
  );
}
