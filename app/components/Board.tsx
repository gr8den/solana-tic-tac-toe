import { FC, MouseEventHandler, useState } from 'react';
import { IBoard, Sign } from '../types/game';
import styles from '../styles/Board.module.scss';

export const Board: FC<{
  board: IBoard,
  turnBy: Sign | null,
  disabled: boolean,
  onSelect: (tile: {x: number, y: number}) => any,
}> = ({board, turnBy, disabled, onSelect}) => {
  const [hover, setHover] = useState({x: -1, y: -1});

  function onMouseOver(x: number, y: number) {
    setHover({x, y});
  }

  const onClick: MouseEventHandler = (e) => {
    if(disabled) return;
    onSelect(hover);
  }

  return (
    <table className={styles.board}>
      <tbody>
        { board.map((row, rowIdx) => (
          <tr key={rowIdx}>
            { row.map((applied, colIdx) => {
              let rendered = applied;

              if(!rendered && hover.x === colIdx && hover.y === rowIdx) {
                rendered = turnBy;
              }

              return (
                <td
                  key={colIdx}
                  className={!applied ? styles.available : undefined}
                  onMouseOver={() => onMouseOver(colIdx, rowIdx)}
                  onMouseOut={() => setHover({x: -1, y: -1})}
                  onClick={onClick}
                >
                  {rendered || ''}
                </td>
              )
            }) }
          </tr>
        ) ) }
      </tbody>
    </table>
  );
};
