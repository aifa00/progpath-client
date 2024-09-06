import React from "react";
import { ClipLoader } from "react-spinners";

const Spinner: React.FC<any> = () => {
  return <ClipLoader color="var(--color-blue)" size={30} />;
};

export default Spinner;
