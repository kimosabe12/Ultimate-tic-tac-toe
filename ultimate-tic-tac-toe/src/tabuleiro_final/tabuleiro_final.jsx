import React from "react";
import "./tabuleiro_final.css";
import Tabuleiro from "../Tabuleiro/tabuleiro";
import PlayerForm from "../PlayerForm/PlayerForm";

class TabuleiroFinal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabuleiros: Array(9)
        .fill(null)
        .map(() => Array(9).fill(null)),
      xIsNext: true,
      players: null,
      overallWinner: null,
      gameTime: 300,
      timeRemaining: 300,
      lastPlayedCell: null,
    };
  }
  startTimer() {
    this.timer = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.overallWinner) {
          clearInterval(this.timer); // para o temporizador se um vencedor já foi determinado
          return {};
        }

        if (prevState.timeRemaining > 0) {
          return { timeRemaining: prevState.timeRemaining - 1 };
        } else {
          clearInterval(this.timer);
          return {};
        }
      });
    }, 1000);
  }
  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getCurrentPlayerInfo() {
    const currentPlayerSymbol = this.state.xIsNext ? "X" : "O";
    const currentPlayerName =
      this.state.players &&
      Object.keys(this.state.players).find(
        (key) => this.state.players[key] === currentPlayerSymbol
      );

    return {
      name: currentPlayerName,
      symbol: currentPlayerSymbol,
    };
  }

  randomizeFirstPlayer() {
    const firstPlayer =
      Math.random() < 0.5
        ? this.state.players.player1
        : this.state.players.player2;
    const firstSymbol = Math.random() < 0.5 ? "X" : "O";

    return { firstPlayer, firstSymbol };
  }

  handlePlayerFormSubmit = (player1, player2) => {
    this.setState({
      players: { player1, player2 },
    });
  };

  handleResetGame = () => {
    this.setState(
      {
        tabuleiros: Array(9)
          .fill(null)
          .map(() => Array(9).fill(null)),
        xIsNext: true,
        players: null,
        overallWinner: null,
        timeRemaining: this.state.gameTime,
        lastPlayedCell: null,
      },
      () => {
        this.startTimer();
      }
    );
  };
  handleComputerMove = () => {
    const tabuleiros = this.state.tabuleiros.slice();
    const availableBoards = tabuleiros
      .map((board, index) => ({ board, index }))
      .filter(({ board }) => !calculateWinner(board));

    if (availableBoards.length === 0) {
      return;
    }

    const randomBoard =
      availableBoards[Math.floor(Math.random() * availableBoards.length)];
    const availableCells = randomBoard.board
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell }) => cell === null);

    if (availableCells.length === 0) {
      return;
    }

    const randomCell =
      availableCells[Math.floor(Math.random() * availableCells.length)];
    this.handleClick(randomBoard.index, randomCell.index);
  };
  componentDidUpdate(prevProps, prevState) {
    if (!prevState.players && this.state.players) {
      const { firstPlayer, firstSymbol } = this.randomizeFirstPlayer();
      this.setState(
        {
          xIsNext: firstSymbol === "X",
        },
        () => {
          if (firstPlayer === "Computador") {
            setTimeout(this.handleComputerMove, 500);
          }
        }
      );
    }

    if (
      prevState.xIsNext !== this.state.xIsNext &&
      this.state.players &&
      this.state.players.player2 === "Computador" &&
      !this.state.xIsNext &&
      prevState.players
    ) {
      setTimeout(this.handleComputerMove, 500);
    }

    if (prevState.timeRemaining !== this.state.timeRemaining) {
      this.calculateOverallWinner();
    }
  }
  getCurrentPlayerName() {
    if (!this.state.players) {
      return "";
    }

    return this.state.xIsNext
      ? this.state.players.player1
      : this.state.players.player2;
  }

  getCurrentPlayerSymbol() {
    return this.state.xIsNext ? "X" : "O";
  }

  handleClick(tabuleiroIndex, celulaIndex) {
    const tabuleiros = this.state.tabuleiros.slice();
    if (
      this.state.overallWinner ||
      calculateWinner(tabuleiros[tabuleiroIndex]) ||
      tabuleiros[tabuleiroIndex][celulaIndex]
    ) {
      return;
    }
    tabuleiros[tabuleiroIndex][celulaIndex] = this.state.xIsNext ? "X" : "O";
    this.setState(
      {
        tabuleiros: tabuleiros,
        xIsNext: !this.state.xIsNext,
      },
      () => {
        this.calculateOverallWinner();
      }
    );
  }

  checkThreeInLine() {
    const miniBoardWinners = this.state.tabuleiros.map((tabuleiro) =>
      calculateWinner(tabuleiro)
    );

    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        miniBoardWinners[a] &&
        miniBoardWinners[a] === miniBoardWinners[b] &&
        miniBoardWinners[a] === miniBoardWinners[c]
      ) {
        return miniBoardWinners[a];
      }
    }
    return null;
  }

  countMiniBoardWins() {
    const miniBoardWinners = this.state.tabuleiros.map((tabuleiro) =>
      calculateWinner(tabuleiro)
    );

    let xWins = 0;
    let oWins = 0;

    for (const winner of miniBoardWinners) {
      if (winner === "X") {
        xWins++;
      } else if (winner === "O") {
        oWins++;
      }
    }

    return { xWins, oWins };
  }

  calculateOverallWinner() {
    let winner = this.checkThreeInLine();

    if (!winner && this.state.timeRemaining <= 0) {
      const { xWins, oWins } = this.countMiniBoardWins();
      winner = xWins > oWins ? "X" : "O";
    }

    // Verifica se todos os mini-tabuleiros foram jogados
    const allBoardsPlayed = this.state.tabuleiros.every(
      (tabuleiro) => calculateWinner(tabuleiro) || isBoardFull(tabuleiro)
    );
    if ((allBoardsPlayed || this.state.timeRemaining <= 0) && !winner) {
      // Para o temporizador se todos os mini-tabuleiros foram jogados ou se o tempo acabou
      clearInterval(this.timer);
      const { xWins, oWins } = this.countMiniBoardWins();
      if (xWins > oWins) {
        winner = "X";
      } else if (oWins > xWins) {
        winner = "O";
      } else {
        winner = "Empate";
      }
    }
    this.setState({ overallWinner: winner });
  }

  renderTabuleiros() {
    const tabuleiros = this.state.tabuleiros;
    const tabuleirosRenderizados = [];
    for (let i = 0; i < 3; i++) {
      const tabuleirosLinha = [];
      for (let j = 0; j < 3; j++) {
        const tabuleiroIndex = i * 3 + j;
        const winner = calculateWinner(tabuleiros[tabuleiroIndex]);
        const boardClass = winner
          ? `board grid3x3 tabuleiro tabuleiro-${winner.toLowerCase()}`
          : "board grid3x3";

        tabuleirosLinha.push(
          <div key={tabuleiroIndex} className={boardClass}>
            <Tabuleiro
              celulas={tabuleiros[tabuleiroIndex]}
              winner={winner}
              onClick={(celulaIndex) =>
                this.handleClick(tabuleiroIndex, celulaIndex)
              }
            />
          </div>
        );
      }
      tabuleirosRenderizados.push(
        <div key={i} className="board-row">
          {tabuleirosLinha}
        </div>
      );
    }

    return tabuleirosRenderizados;
  }

  render() {
    const timeRemaining = this.state.timeRemaining;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    if (!this.state.players) {
      return (
        <div className="game">
          <PlayerForm onSubmit={this.handlePlayerFormSubmit} />
        </div>
      );
    }

    const currentPlayerName = this.getCurrentPlayerName();
    const currentPlayerSymbol = this.getCurrentPlayerSymbol();
    const status =
      this.state.overallWinner === "Empate"
        ? "Empate"
        : this.state.overallWinner
        ? `Vencedor: ${
            this.state.players[
              this.state.players.player1 === currentPlayerSymbol
                ? "player1"
                : "player2"
            ]
          } (${this.state.overallWinner})`
        : `Jogador Atual: ${currentPlayerName} (${currentPlayerSymbol})`;

    return (
      <div className="game">
        <h1 className="game-title">ULTIMATE TIC-TAC-TOE</h1>
        <div className="time-container">
          <span>
            Tempo restante: {minutes}m {seconds}s
          </span>
        </div>
        <div>{status}</div>
        <div className="board-final">{this.renderTabuleiros()}</div>
        {this.state.overallWinner && (
          <button className="reset-game-button" onClick={this.handleResetGame}>
            Jogar Novamente
          </button>
        )}
      </div>
    );
  }
}

function calculateWinner(celulas) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (celulas[a] && celulas[a] === celulas[b] && celulas[a] === celulas[c]) {
      return celulas[a];
    }
  }
  return null;
}
function isBoardFull(tabuleiro) {
  return tabuleiro.every((celulas) => celulas !== null);
}

export default TabuleiroFinal;
