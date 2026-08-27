import { createContext, useContext } from "react";

export const TestContext = createContext();

export default function TestProvider({ children }) {
  const token = "asd";
  const asd = "123";
  return (
    <>
      <TestContext.Provider value={{ token, asd }}>
        {children}
      </TestContext.Provider>
    </>
  );
}
export const useTestContext = () => useContext(TestContext);
