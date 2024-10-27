import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [cells, setCells] = useState(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [status, setStatus] = useState("It's X's turn");
  const [gameActive, setGameActive] = useState(true);
  const [gameMode, setGameMode] = useState('Friend');

  const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
  ];

  useEffect(() => {
    if (gameMode === 'AI' && currentPlayer === 'O' && gameActive) {
      setStatus('AI is thinking...');
      setTimeout(aiMove, 3000);
    }
  }, [currentPlayer, gameMode, gameActive]);

  const handleClick = (index) => {
    if (!gameActive || cells[index]) return;
    const newCells = cells.slice();
    newCells[index] = currentPlayer;
    setCells(newCells);

    if (checkWin(newCells)) {
      setStatus(`Player ${currentPlayer} wins!`);
      setGameActive(false);
      showRocketAnimation();
    } else if (newCells.every(cell => cell !== '')) {
      setStatus("It's a draw!");
      setGameActive(false);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      setStatus(`It's ${currentPlayer === 'X' ? 'O' : 'X'}'s turn`);
    }
  };

  const checkWin = (board) => {
    return winningConditions.some(combination =>
      combination.every(index => board[index] === currentPlayer)
    );
  };

  const aiMove = () => {
    let availableCells = cells.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    let randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    const newCells = cells.slice();
    newCells[randomCell] = 'O';
    setCells(newCells);

    if (checkWin(newCells)) {
      setStatus('Player O wins!');
      setGameActive(false);
      showRocketAnimation();
    } else if (newCells.every(cell => cell !== '')) {
      setStatus("It's a draw!");
      setGameActive(false);
    } else {
      setCurrentPlayer('X');
      setStatus("It's X's turn");
    }
  };

  const resetGame = () => {
    setCells(Array(9).fill(''));
    setCurrentPlayer('X');
    setStatus("It's X's turn");
    setGameActive(true);

    const rocket = document.querySelector('.rocket');
    if (rocket) {
      rocket.remove();
    }
    
    const gameBoard = document.querySelector('.game');
    gameBoard.classList.remove('blur');
  };

  const changeMode = (mode) => {
    setGameMode(mode);
    resetGame();
  };

  const showRocketAnimation = () => {
    const gameBoard = document.querySelector('.game');
    gameBoard.classList.add('blur');
    const existingRocket = document.querySelector('.rocket');
    if (!existingRocket) {
      const rocket = document.createElement('div');
      rocket.classList.add('rocket');
      rocket.textContent = '🚀';
      document.body.appendChild(rocket);
    }
  };

  return (
    <div className="container">
      <h1>Tic-Tac-Toe</h1>
      <div className="buttons">
        <button onClick={() => changeMode('Friend')} className={gameMode === 'Friend' ? 'active' : ''}>Play with Friend</button>
        <button onClick={() => changeMode('AI')} className={gameMode === 'AI' ? 'active' : ''}>Play with AI</button>
      </div>
      <p id="modeText">{`Playing with ${gameMode}`}</p>
      <div className="game">
        {cells.map((cell, index) => (
          <div key={index} className={`cell ${cell}`} onClick={() => handleClick(index)}>
            {cell}
          </div>
        ))}
      </div>
      <div className="status">{status}</div>
      <button id="reset" onClick={resetGame}>Reset</button>
    </div>
  );
};

export default App;
