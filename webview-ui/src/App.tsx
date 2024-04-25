import { vscode } from "./utilities/vscode";
import { useState, useRef } from 'react';
import "./App.css";
import {
  Button,
  Textarea,
  TabList,
  Tab,
  Label,
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  TableCellLayout,
  Image,
  Field,
  Radio,
  RadioGroup,
  SelectTabData,
  SelectTabEvent,
  Combobox,
  Option,
  makeStyles,
  useId,
  tokens
} from '@fluentui/react-components';
import type { ComboboxProps } from '@fluentui/react-components';
import { Dismiss12Regular } from "@fluentui/react-icons";



declare global {
  interface Window {
    lineofcode: any; // Use a more specific type instead of any if possible
    contributors: any;
    image: any;
  }
}
function App() {

  const lineofcode = window.lineofcode;
  const [thankPackages, setPackage] = useState(lineofcode.packages);
  // const contributors = window.contributors;
  const [button, setButton] = useState(lineofcode.button);
  const [tab, setTab] = useState(lineofcode.tab);
  const [page, setPage] = useState(button);
  // const linechart = window.image;
  const modulesDict = lineofcode.modules;
  const [packageModules, setModules] = useState([].concat(...Object.values(modulesDict)));
  // let packageModules: string[] = [].concat(...Object.values(modulesDict));

  const useStyles = makeStyles({
    wrapper: {
      alignItems: "center",
      columnGap: "15px",
      display: "flex",
    },
    topPackage: {
    },
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

  const contributors = [
    "usera",
    "userb",
    "userc",
    "userd",
    "usere"
  ];

  const thankedColumns = [
    { columnKey: "package", label: "Package" },
    { columnKey: "date", label: "Date Thanked" },
    { columnKey: "contributors", label: "Contributor" }
  ];

  const items = [
    {
      package: "numpy",
      dateThanked: "Yesterday",
      contributors: {
        usernames: [
          "a",
          "b",
          "c",
          "d"
        ]
      }
    },
    {
      package: "matplotlib",
      dateThanked: "April 4th, 2024",
      contributors: {
        usernames: [
          "e",
          "f",
          "g",
          "h"
        ]
      }
    },
    {
      package: "pandas",
      dateThanked: "March 30th, 2024",
      contributors: {
        usernames: [
          "i",
          "j",
          "k",
          "l"
        ]
      }
    }
  ];

  const topThankedColumns = [
    { columnKey: "contributor", label: "Contributor" },
    { columnKey: "frequency", label: "Count" },
    { columnKey: "package", label: "Packages" }
  ];

  const topThanked = [
    {
      contributor: "a",
      frequency: 100,
      package: ["something", "other thing"]
    },
    {
      contributor: "b",
      frequency: 10,
      package: ["something", "another thing"]
    },
    {
      contributor: "c",
      frequency: 5,
      package: ["something"]
    },
    {
      contributor: "d",
      frequency: 1,
      package: ["something"]
    },
    {
      contributor: "e",
      frequency: 1,
      package: ["something"]
    }
  ];

  const topPackages = [
    {
      package: "test1",
      frequency: 200
    },
    {
      package: "test2",
      frequency: 100
    },
    {
      package: "test3",
      frequency: 100
    }
  ];

  const onSayMoreTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    if (data.value === 'form') {
      setTab('form');
      setPage('form');
    }
    else {
      setTab('recently thanked');
      setPage('dashboard');
    }
  }

  const onThankOther = (newPackage) => {
    setPackage(newPackage);
    // setModules(modulesDict.get(thankPackages));
    setButton('form');
    setTab('form');
    setPage('form');
  }

  // Select module functionality

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


  // Select package functionality
  const comboPackageId = useId("combo-multi-package");
  const selectedPackageListId = `${comboPackageId}-selection`;

  const selectedPackageListRef = useRef<HTMLUListElement>(null);
  const comboboxPackageInputRef = useRef<HTMLInputElement>(null);

  const [selectedPackageOptions, setSelectedPackageOptions] = useState<string[]>([]);

  const onSelectPackageSelect: ComboboxProps["onOptionSelect"] = (event, data) => {
    setSelectedPackageOptions(data.selectedOptions);
    let packagingModules = [];
    data.selectedOptions.forEach(s => packagingModules = packagingModules.concat(modulesDict[s]));
    setModules(packageModules);
  };

  const onTagClick = (option: string, index: number) => {
    // remove selected option
    setSelectedPackageOptions(selectedPackageOptions.filter((o) => o !== option));

    // focus previous or next option, defaulting to focusing back to the combo input
    const indexToFocus = index === 0 ? 1 : index - 1;
    const optionToFocus = selectedPackageListRef.current?.querySelector(
      `#${comboPackageId}-remove-${indexToFocus}`
    );
    if (optionToFocus) {
      (optionToFocus as HTMLButtonElement).focus();
    } else {
      comboboxPackageInputRef.current?.focus();
    }
  };

  const labelledBy =
    selectedOptions.length > 0 ? `${comboPackageId} ${selectedPackageListId}` : comboPackageId;


  return (
    <main>
      {
        button === 'form'
          ?
          <div className="navigation">
            <TabList selectedValue={page} onTabSelect={onSayMoreTabSelect}>
              <Tab value="form">Say More</Tab>
              <Tab value="dashboard">Dashboard</Tab>
            </TabList>
          </div>
          :
          <div className="empty"></div>
      }

      {
        tab === 'form'
          ?
          <div className="sayMoreForm">
            <h2>Say Thanks</h2>
            <p>Send a personal note to the contributors and let them know how their code has helped you!</p>

            <div>
              <label id={comboPackageId}>You are thanking the following package(s):</label>
              {selectedPackageOptions.length ? (
                <ul
                  id={selectedPackageListId}
                  className={styles.tagsList}
                  ref={selectedPackageListRef}
                >
                  {/* The "Remove" span is used for naming the buttons without affecting the Combobox name */}
                  <span id={`${comboPackageId}-remove`} hidden>
                    Remove
                  </span>
                  {selectedPackageOptions.map((option, i) => (
                    <li key={option}>
                      <Button
                        size="small"
                        shape="circular"
                        appearance="primary"
                        icon={<Dismiss12Regular />}
                        iconPosition="after"
                        onClick={() => onTagClick(option, i)}
                        id={`${comboPackageId}-remove-${i}`}
                        aria-labelledby={`${comboPackageId}-remove ${comboPackageId}-remove-${i}`}
                      >
                        {option}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Combobox
                aria-labelledby={labelledBy}
                multiselect={true}
                placeholder="Select one or more packages"
                selectedOptions={selectedPackageOptions}
                onOptionSelect={onSelectPackageSelect}
                ref={comboboxPackageInputRef}
              >
                {thankPackages.map((option) => (
                  <Option key={option}>{option}</Option>
                ))}
              </Combobox>
            </div>

            {
              packageModules.length >= 1 &&
              <div className="selectModules">
                <br></br>
                <label id="comboModules">Thank Modules</label>
                <Combobox
                  aria-labelledby="comboModules"
                  multiselect={true}
                  placeholder="Choose which modules you would like to thank"
                  value={comboxValue}
                  onBlur={onBlurModuleSelect}
                  onChange={onChangeModuleSelect}
                  onFocus={onFocusModuleSelect}
                  onOptionSelect={onSelectModuleSelect}
                >
                  {packageModules.map((amodule) => (
                    <Option key={amodule}>{amodule}</Option>
                  ))}
                </Combobox>
              </div>
            }


            <p>Your thanks goes to:</p>
            <p>{contributors.join(", ")}</p>

            <form>
              <div className="useCase">
                <Label htmlFor="useCase">Describe your specific use case for this package:</Label>
                <br></br>
                <Textarea rows={3} id="useCase" name="useCase"></Textarea>
              </div>

              <div className="helpfulReason">
                <Label htmlFor="helpfulReason">Why was this package useful?</Label>
                <br></br>
                <Textarea rows={3} id="helpfulReason" name="helpfulReason"></Textarea>
              </div>

              <div className="personalNote">
                <Label htmlFor="personalNote">Add a personal note here:</Label>
                <br></br>
                <Textarea rows={3} id="personalNote" name="personalNote"></Textarea>
              </div>

              <div className="rating-0-10">
                <p className="grateful-scale">How surprised do you think the recipient(s) will be to learn about the specific reasons for why you feel grateful to them?
                  (0 = not surprised at all and 10 = extremely surprised) </p>
                <div className="chart-scale">
                  <Field label="">
                    <RadioGroup layout="horizontal-stacked">
                      <Radio value="1" label="1" />
                      <Radio value="2" label="2" />
                      <Radio value="3" label="3" />
                      <Radio value="4" label="4" />
                      <Radio value="5" label="5" />
                      <Radio value="6" label="6" />
                      <Radio value="7" label="7" />
                      <Radio value="8" label="8" />
                      <Radio value="9" label="9" />
                      <Radio value="10" label="10" />
                    </RadioGroup>
                  </Field>

                </div>
              </div>

              <Button appearance="primary">Submit</Button>
            </form>
          </div>
          :
          <TabList selectedValue={tab} onTabSelect={(event, data) => setTab(data.value)}>
            <Tab value="recently thanked">Recently Thanked</Tab>
            <Tab value="usage">Usage</Tab>
          </TabList>
      }

      {
        tab === 'recently thanked' &&

        <div className="recentlyThanked">
          <h2>Recently Thanked</h2>

          <p>Here are the packages you've recently thanked. </p>

          <Table arial-label="recently thanked table">
            <TableHeader>
              <TableRow>
                {thankedColumns.map((column) => (
                  <TableHeaderCell key={column.columnKey}>
                    {column.label}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.package}>
                  <TableCell>{item.package}</TableCell>
                  <TableCell>{item.dateThanked}</TableCell>
                  <TableCell>{item.contributors.usernames.join(", ")}</TableCell>
                  <TableCell role="gridcell">
                    <TableCellLayout>
                      <Button onClick={(event) => onThankOther(item.package)}>Thank</Button>
                    </TableCellLayout>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      }

      {
        tab === 'usage' &&
        <div className="usage">
          <h2>Usage</h2>

          <h4>Your activity</h4>

          <h4>Top thanked contributors </h4>
          <Table>
            <TableHeader>
              <TableRow>
                {topThankedColumns.map((column) => (
                  <TableHeaderCell key={column.columnKey}>
                    {column.label}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {topThanked.map((item) => (
                <TableRow key={item.contributor}>
                  <TableCell>{item.contributor}</TableCell>
                  <TableCell>{item.frequency}</TableCell>
                  <TableCell>{item.package.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <h4>Most used packages </h4>
          <div className={styles.wrapper}>
            {topPackages.map((item) => (
              <div className={styles.topPackage}>
                <p>{item.package}</p>
                <p>Count: {item.frequency}</p>
              </div>
            ))}
          </div>

        </div>
      }
    </main>
  );
}

export default App;

/*
<Button className="btn btn-scale btn-scale-asc-1">0</Button>
                  <Button className="btn btn-scale btn-scale-asc-1">1</Button>
                  <Button className="btn btn-scale btn-scale-asc-2">2</Button>
                  <Button className="btn btn-scale btn-scale-asc-3">3</Button>
                  <Button className="btn btn-scale btn-scale-asc-4">4</Button>
                  <Button className="btn btn-scale btn-scale-asc-5">5</Button>
                  <Button className="btn btn-scale btn-scale-asc-6">6</Button>
                  <Button className="btn btn-scale btn-scale-asc-7">7</Button>
                  <Button className="btn btn-scale btn-scale-asc-8">8</Button>
                  <Button className="btn btn-scale btn-scale-asc-9">9</Button>
                  <Button className="btn btn-scale btn-scale-asc-10">10</Button>
*/