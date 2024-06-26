import { useState } from "react";
import "./App.css";
import SayMore from "./SayMore";

declare global {
  interface Window {
    lineofcode: any; // Use a more specific type instead of any if possible
  }
}

function App() {
  const lineofcode = window.lineofcode;
  const language = lineofcode.language;
  const user = lineofcode.userid;

  return (
    <div className="App">
      <SayMore lineofcode={lineofcode} />
    </div>
  );
}

export default App;
