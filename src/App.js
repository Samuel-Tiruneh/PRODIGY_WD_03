import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import Register from './Register';
import axios from 'axios';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState(null); // Ensure this is defined
  const [cells, setCells] = useState(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [status, setStatus] = useState("It's X's turn");
  const [gameActive, setGameActive] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [setsWon, setSetsWon] = useState({ X: 0, O: 0 });
  const [sets, setSets] = useState(3);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [overallWinner, setOverallWinner] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  
  const handleLogin = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAvatar(response.data.avatar);
      setUsername(response.data.username);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleRegister = ({ avatar, username }) => {
    setAvatar(avatar);
    setUsername(username);
    setIsRegistering(false);
    setIsLoggedIn(true);
  };

  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
  };


  useEffect(() => {
    if (isCountingDown) {
      if (countdown > 0) {
        const timer = setInterval(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
      } else {
        startGame();
      }
    }
  }, [countdown]);

  const handleClick = (index) => {
    if (!gameActive || cells[index]) return;
    const newCells = [...cells];
    if (currentPlayer === 'X') {
      newCells[index] = 'X';
      setCells(newCells);

      const winningLine = checkWin(newCells);
      if (winningLine) {
        setWinningCells(winningLine);
        setStatus(`Player X wins this round!`);
        updateScores('X');
        showRocketAnimation();
      } else if (newCells.every(cell => cell !== '')) {
        setStatus("It's a draw!");
        setGameActive(false);
      } else {
        setCurrentPlayer('O');
        setStatus('AI is thinking...');
        setTimeout(() => aiMove(newCells), 2000); 
      }
    }
  };

  const aiMove = (board) => {
    let availableCells = board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    if (availableCells.length === 0) {
      setStatus("It's a draw!");
      setGameActive(false);
      return;
    }
    let randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    board[randomCell] = 'O';
    setCells(board);

    const winningLine = checkWin(board);
    if (winningLine) {
      setWinningCells(winningLine);
      setStatus('Player O wins this round!');
      updateScores('O');
      showRocketAnimation();
    } else if (board.every(cell => cell !== '')) {
      setStatus("It's a draw!");
      setGameActive(false);
    } else {
      setCurrentPlayer('X');
      setStatus("It's X's turn");
    }
  };

  const checkWin = (board) => {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let condition of winConditions) {
      const [a, b, c] = condition;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return condition;
      }
    }

    return null;
  };

  const updateScores = (winner) => {
    const newScores = { ...scores };
    newScores[winner] += 1;
    const newSetsWon = { ...setsWon };
    newSetsWon[winner] += 1;
    setTotalGamesPlayed(prev => prev + 1);

    if (newSetsWon[winner] >= sets) {
      setOverallWinner(winner);
      setGameOver(true);
      resetGame();
    } else {
      setScores(newScores);
      setSetsWon(newSetsWon);
      resetGame();
    }
  };

  const resetGame = () => {
    setCells(Array(9).fill(''));
    setWinningCells([]);
    setCurrentPlayer('X');
    setStatus("It's X's turn");
    const rocket = document.querySelector('.rocket');
    if (rocket) {
      rocket.remove();
    }
    document.querySelector('.game').classList.remove('blur');
    if (!gameOver) {
      setGameActive(true);
    } else {
      resetOverallGame();
    }
  };
  const resetOverallGame = () => {
    if (totalGamesPlayed >= sets) {
      alert(`Final Result: Player X - ${setsWon.X}, Player O - ${setsWon.O}`);
      setScores({ X: 0, O: 0 });
      setSetsWon({ X: 0, O: 0 });
      setOverallWinner('');
      setGameOver(false);
      setTotalGamesPlayed(0);
    }
  };

  const newGame = () => {
    resetOverallGame();
  };

  const continueGame = () => {
    resetGame();
  };

  const showRocketAnimation = () => {
    const existingRocket = document.querySelector('.rocket');
    if (!existingRocket) {
      const rocketContainer = document.createElement('div');
      rocketContainer.classList.add('rocket-container');
      const rocket = document.createElement('div');
      rocket.classList.add('rocket');
      rocket.textContent = '🚀';
      rocketContainer.appendChild(rocket);
      document.body.appendChild(rocketContainer);
    }
  };

  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(3);
    document.querySelector('.game').classList.add('blur');
  };

  const startGame = () => {
    resetGame();
    document.querySelector('.game').classList.remove('blur');
    setCurrentPlayer('X');
    setStatus("It's X's turn");
    setIsCountingDown(false);
  };

  return (
    <div className="container">
      {isLoggedIn ? (
        <>
          <h1>Tic-Tac-Toe</h1>
          <div className="scoreboard">
            <div className="player">
              <img src={avatar || "player1.jpg"} alt={`${username} (Player X)`} />
              <p>{username}: {scores.X}</p>
            </div>
            <div className="game">
              {cells.map((cell, index) => (
                <div key={index} className={`cell ${cell} ${winningCells.includes(index) ? 'winning-cell' : ''}`} onClick={() => handleClick(index)}>
                  {cell}
                </div>
              ))}
            </div>
            <div className="player">
              <img src="player2.jpg" alt="Player O" />
              <p>Player O: {scores.O}</p>
            </div>
          </div>
          {gameOver && (
            <h2 className="game-over">{`Game Over! ${overallWinner === 'X' ? username : 'AI'} wins the series!`}</h2>
          )}
          {isCountingDown && (
            <div className="countdown">
              <h2>{`Game starts in ${countdown} seconds...`}</h2>
              <h3>{`You vs AI`}</h3>
            </div>
          )}
          <div className="buttons">
            <select onChange={(e) => setSets(Number(e.target.value))} value={sets}>
              <option value={3}>3 Sets</option>
              <option value={5}>5 Sets</option>
              <option value={7}>7 Sets</option>
            </select>
          </div>
          <p id="modeText">Playing with AI</p>
          <div className="status">{status}</div>
          <button id="newGame" onClick={newGame}>New Game</button>
          <button id="continue" onClick={continueGame}>Continue</button>
        </>
      ) : (
        isRegistering ? (
          <Register onRegister={handleRegister} />
        ) : (
          <Login onLogin={handleLogin} onToggleRegister={toggleRegister} />
        )
      )}
    </div>
  );
  
  
};

export default App;
