import { useTestContext } from "@/context/TestContext";

function Header({ text }) {
  return (
    <>
      <div className="topbar">
        <h2>{text}</h2>
      </div>
    </>
  );
}

export default Header;
