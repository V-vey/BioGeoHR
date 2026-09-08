import { useState } from "react";
import "./App.css";

import Location from "./Module/LocationMain";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Location />
    </>
  );
}

export default App;
