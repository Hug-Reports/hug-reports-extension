import "./App.css";
import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
} from "@fluentui/react-components";

export function Usage({ styles }) {
  const topThankedColumns = [
    { columnKey: "contributor", label: "Contributor" },
    { columnKey: "frequency", label: "Count" },
    { columnKey: "package", label: "Packages" },
  ];

  const topThanked = [
    {
      contributor: "a",
      frequency: 100,
      package: ["something", "other thing"],
    },
    {
      contributor: "b",
      frequency: 10,
      package: ["something", "another thing"],
    },
    {
      contributor: "c",
      frequency: 5,
      package: ["something"],
    },
    {
      contributor: "d",
      frequency: 1,
      package: ["something"],
    },
    {
      contributor: "e",
      frequency: 1,
      package: ["something"],
    },
  ];

  const topPackages = [
    {
      package: "test1",
      frequency: 200,
    },
    {
      package: "test2",
      frequency: 100,
    },
    {
      package: "test3",
      frequency: 100,
    },
  ];
  return (
    <div className="usage">
      <h2>Usage</h2>

      <h4>Your activity</h4>

      <h4>Top thanked contributors </h4>
      <Table>
        <TableHeader>
          <TableRow>
            {topThankedColumns.map((column) => (
              <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
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
  );
}
