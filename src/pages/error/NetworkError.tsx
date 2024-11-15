import React from "react";

function NetworkError() {
  return (
    <>
      <div
        style={{
          color: "var(--color-text-primary)",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img src="/images/network-error.png" width={50} height={50} alt="" />{" "}
        <br />
        <h1>500</h1>
        <h1>Server Error</h1>
      </div>
    </>
  );
}

export default NetworkError;
