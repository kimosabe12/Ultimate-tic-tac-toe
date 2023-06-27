import React from "react";
import "./Celula.css";
function Celula({ value, onClick }) {
  let style;
  if (value === "X") {
    style = "celula x";
  } else {
    style = "celula o";
  }

  return (
    <button className={style} onClick={onClick}>
      {value}
    </button>
  );
}

export default Celula;
