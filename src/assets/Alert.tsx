import React, { useEffect } from "react";
import { useSelector, useDispatch, TypedUseSelectorHook } from "react-redux";
import { RootState } from "../redux/store";
import { removeAlert } from "../redux/alertSlice";

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

function Alert() {
  const alert = useTypedSelector((state) => state.alert);
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      dispatch(removeAlert());
    }, 5000);
  }, []);

  const alertStyle = {
    position: "fixed" as const,
    zIndex: 1000,
    backgroundColor: "#bebebe",
    color: "black",
    left: "3%",
    bottom: "5%",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "15%",
    borderRadius: "15px",
    transition: "all 0.5s",
  };

  return (
    <>
      <div style={alertStyle}>
        <div style={{ display: "flex", marginRight: "20px" }}>
          <i
            style={{
              color: alert.value.type === "success" ? "green" : "red",
              fontSize: "large",
              marginRight: "5px",
            }}
            className={
              alert.value.type === "success"
                ? "bi bi-check-circle-fill"
                : "bi bi-exclamation-circle-fill"
            }
          ></i>

          <p>{alert.value.message}</p>
        </div>

        <span
          style={{ fontSize: "x-large", marginBottom: "2px", color: "blue" }}
          onClick={(e) => dispatch(removeAlert())}
        >
          &times;
        </span>
      </div>
    </>
  );
}

export default Alert;
