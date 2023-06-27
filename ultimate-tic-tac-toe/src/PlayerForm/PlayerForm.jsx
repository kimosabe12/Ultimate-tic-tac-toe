import React, { useState } from "react";
import "./PlayerForm.css";

function PlayerForm({ onSubmit }) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [isComputer, setIsComputer] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(player1, player2);
  };

  const handleToggleComputer = () => {
    setIsComputer(!isComputer);
    setPlayer2(!isComputer ? "Computador" : "");
  };

  return (
    <form className="player-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome do Jogador 1 (X)"
        value={player1}
        onChange={(e) => setPlayer1(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder={isComputer ? "Computador(O)" : "Nome do Jogador 2(O)"}
        value={player2}
        onChange={(e) => setPlayer2(e.target.value)}
        disabled={isComputer}
        required
      />
      <div>
        <label>
          <input
            type="checkbox"
            checked={isComputer}
            onChange={handleToggleComputer}
          />
          Jogar contra o computador
        </label>
      </div>
      <button type="submit">Iniciar Jogo</button>
    </form>
  );
}

export default PlayerForm;
