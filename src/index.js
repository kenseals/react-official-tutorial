import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  let isWinner = props.winner ? "winner" : "";
  return (
    <button className={['square', isWinner].join(' ')} onClick={props.onClick}>
      {props.value}
      {props.winner}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winningSquare = this.props.winningSquares.includes(i) ? true : false;
    return (
      <Square
        value={this.props.squares[i]}
        winner={winningSquare}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(start, total) {
    const squares = total;
    const row = [];
    for (let i = start; i < start + squares; i++) {
      row.push(this.renderSquare(i));
    }
    return (
      <div className="board-row">
        {row}
      </div>
    );
  }

  renderBoard(r) {
    const rows = r;
    const board = [];
    for (let i = 0; i < rows; i++) {
      let rowStart = i * rows;
      board.push(this.renderRow(rowStart, rows));
    }
    return (
      board
    );
  }

  render() {
    return (
      this.renderBoard(3)
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        position: 1
      }],
      sortAscending: true,
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length -1];
    const squares = current.squares.slice();
    const position = calculatePosition(i);
    if (calculateConclusion(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        position: position
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  sortAscending(direction) {
    this.setState({
      sortAscending: direction
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const conclusion = calculateConclusion(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + " (" + String(step.position) + ")":
        'Go to game start';
      let isCurrent = move === this.state.stepNumber ? "current" : ""
      return (
        <li key={move} className={['c-move', isCurrent].join(' ')}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    if (!this.state.sortAscending) {
      moves.reverse();
    }

    let status,
        winningSquares = [];
    if (conclusion) {
      if (conclusion.winner) {
        status = 'Winner: ' + conclusion.winner.winningValue;
        winningSquares = conclusion.winner.winningSquares;
      } else if (conclusion.draw) {
        status = "Draw!";
      }
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningSquares={winningSquares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.sortAscending(!this.state.sortAscending)}>Sort by {this.state.sortAscending ? "descending" : "ascending"}</button>
          <ol reversed={this.state.sortAscending ? false : true}>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculatePosition(square) {
  const cols = [
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8]
  ];
  const rows = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
  ];
  let x, y;
  for (let i = 0; i < cols.length && x === undefined; i++) {
    if (cols[i].indexOf(square) !== -1) {
      x = i + 1;
    }
  }
  for (let i = 0; i < rows.length && y === undefined; i++) {
    if (rows[i].indexOf(square) !== -1) {
      y = i + 1;
    }
  }
  return [x, y];
}

function calculateConclusion(squares) {
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
    const conclusion = {};
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      conclusion.winner = {
        winningSquares: lines[i],
        winningValue: squares[a]
      }
      return conclusion;
    } else if (!squares.some(containsNull)) {
      conclusion.draw = true;
      return conclusion;
    }
  }
  return null;
}

function containsNull(item) {
  return item === null;
}
