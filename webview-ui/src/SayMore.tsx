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

    const filteredModules = Object.keys(modulesDict)
      .filter((key) => newSelectedPackages.includes(key))
      .map((key) => modulesDict[key]);

    const newModules = [].concat(...filteredModules);
    setModule(newModules);
  };

  let labelString: string;
  if (selectedPackageOptions.length > 1) {
    labelString = "Please select a package to thank: ";
  } else {
    labelString = "You are thanking the following package: ";
  }

  return (
    <div className="sayMoreFormHeader">
      <h2>Say Thanks</h2>
      <p>
        Send a personal note to the contributors and let them know how their code has helped you!
      </p>

      <div className="selectedPackages">
        <label id="packageTags">{labelString}</label>
        <ul className={styles.tagsList}>
          {selectedPackageOptions.map((option, i) => (
            <li key={option}>
              <Button
                size="small"
                shape="circular"
                appearance="primary"
                icon={<Dismiss12Regular />}
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

export function SayMoreSelectModules({ styles, packageModules }) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
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

  return (
    <div className="selectedModules">
      {packageModules.length >= 1 ? (
        <div className={styles.moduleSelectBox}>
          <br></br>
          <label id="comboModules">Thank Modules:</label>
          <Combobox
            aria-labelledby="comboModules"
            multiselect={true}
            placeholder="Select the modules you would like to thank"
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
        <Label htmlFor="useCase">Describe your specific use case for this package:</Label>
        <br></br>
        <Textarea rows={3} id="useCase" name="useCase" className={styles.textbox}></Textarea>
      </div>

      <div className="helpfulReason">
        <Label htmlFor="helpfulReason">Why was this package useful?</Label>
        <br></br>
        <Textarea
          rows={3}
          id="helpfulReason"
          name="helpfulReason"
          className={styles.textbox}></Textarea>
      </div>

      <div className="personalNote">
        <Label htmlFor="personalNote">Add a personal note here:</Label>
        <br></br>
        <Textarea
          rows={3}
          id="personalNote"
          name="personalNote"
          className={styles.textbox}></Textarea>
      </div>

      <Button appearance="primary">Submit</Button>
    </form>
  );
}
