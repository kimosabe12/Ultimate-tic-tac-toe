import React from "react";
import "./tabuleiro.css";
import Celula from "../Celula/Celula";

function Tabuleiro(props) {
  const renderCelula = (i) => {
    return <Celula value={props.celulas[i]} onClick={() => props.onClick(i)} />;
  };

  return (
    <div className="board grid3x3">
      {renderCelula(0)}
      {renderCelula(1)}
      {renderCelula(2)}
      {renderCelula(3)}
      {renderCelula(4)}
      {renderCelula(5)}
      {renderCelula(6)}
      {renderCelula(7)}
      {renderCelula(8)}
    </div>
  );
}

export default Tabuleiro;
