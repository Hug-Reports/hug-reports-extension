import "./App.css";
import {
  Button,
  TabList,
  Tab,
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  TableCellLayout,
} from "@fluentui/react-components";

export function DashboardNav({ tab, setTab }) {
  return (
    <div className="dashboardNav">
      <TabList selectedValue={tab} onTabSelect={(event, data) => setTab(data.value)}>
        <Tab value="recently thanked">Recently Thanked</Tab>
        <Tab value="usage">Usage</Tab>
      </TabList>
    </div>
  );
}

export function RecentlyThanked({
  setPackage,
  setSelectedPackageOptions,
  setButton,
  setTab,
  setPage,
  setModule,
  modulesDict
}) {
  const thankedColumns = [
    { columnKey: "package", label: "Package" },
    { columnKey: "date", label: "Date Thanked" },
    { columnKey: "contributors", label: "Contributor" },
  ];

  const items = [
    {
      package: "numpy",
      dateThanked: "Yesterday",
      contributors: {
        usernames: ["a", "b", "c", "d"],
      },
    },
    {
      package: "matplotlib",
      dateThanked: "April 4th, 2024",
      contributors: {
        usernames: ["e", "f", "g", "h"],
      },
    },
    {
      package: "pandas",
      dateThanked: "March 30th, 2024",
      contributors: {
        usernames: ["i", "j", "k", "l"],
      },
    },
  ];


  const onThankOther = (newPackage) => {
    setPackage(newPackage);
    setSelectedPackageOptions([newPackage]);
    const newModules = [].concat(...Object.entries(modulesDict).filter(([key, value]) => key === newPackage).map(([key, value]) => value));
    setModule(newModules);
    setButton("form");
    setTab("form");
    setPage("form");
  };

  return (
    <div className="recentlyThanked">
      <h2>Recently Thanked</h2>

      <p>Here are the packages you've recently thanked. </p>

      <Table arial-label="recently thanked table">
        <TableHeader>
          <TableRow>
            {thankedColumns.map((column) => (
              <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
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
  );
}
