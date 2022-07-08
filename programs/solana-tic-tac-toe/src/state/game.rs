use anchor_lang::prelude::*;
use crate::errors::TicTacToeError;

#[account]
pub struct Game {
    turn: u8,                           // 1
    players: [Pubkey; 2],               // 32 * 2
    board: [[Option<Sign>; 3]; 3],      // (1 + 1) * 9
    status: GameStatus,                 // 1 + 32
}

impl Game {
    pub const MAX_SIZE: usize = 1 + (32 * 2) + ((1 + 1) * 9) + (1 + 32);

    pub fn start(&mut self, players: [Pubkey; 2]) -> Result<()> {
        require_eq!(self.turn, 0, TicTacToeError::AlreadyInited);
        self.players = players;
        self.turn += 1;

        Ok(())
    }

    pub fn play(&mut self, player_key: Pubkey, tile: Tile) -> Result<()> {
        let player_idx = self.key_to_player_idx(player_key)?;
        require_eq!(player_idx, self.turn_of_player(), TicTacToeError::NotPlayersTurn);
        require!(self.is_game_active(), TicTacToeError::GameNotActive);
        tile.validate()?;

        match self.board[tile.y as usize][tile.x as usize] {
            None => self.board[tile.y as usize][tile.x as usize] = Some(Sign::try_from_idx(player_idx)?),
            Some(_) => err!(TicTacToeError::TileNotEmpty)?,
        }

        match self.get_winner() {
            Some(sign) => {
                self.status = GameStatus::Won {
                    winner: self.players[sign.to_idx()]
                }
            },
            None => {
                if self.turn == 9 {
                    self.status = GameStatus::Tie;
                } else {
                    self.turn += 1;
                }
            }
        }

        Ok(())
    }

    fn get_winner(&self) -> Option<Sign> {
        //
        for i in 0..=2 {
            if Game::is_same_tiles(self.board[i]) {
                return self.board[i][0];
            }
        }

        for i in 0..=2 {
            if Game::is_same_tiles([self.board[0][i], self.board[1][i], self.board[2][i]]) {
                return self.board[0][i];
            }
        }

        if Game::is_same_tiles([self.board[0][0], self.board[1][1], self.board[2][2]]) {
            return self.board[1][1];
        }

        if Game::is_same_tiles([self.board[0][2], self.board[1][1], self.board[2][0]]) {
            return self.board[1][1];
        }

        None
    }

    fn is_game_active(&self) -> bool {
        match self.status {
            GameStatus::Active => true,
            _ => false,
        }
    }

    fn is_same_tiles(v: [Option<Sign>; 3]) -> bool {
        v[0].is_some() && v[0] == v[1] && v[1] == v[2]
    }

    fn turn_of_player(&self) -> u8 {
        (self.turn - 1) % 2
    }

    fn key_to_player_idx(&self, player: Pubkey) -> Result<u8> {
        if self.players[0] == player {
            return Ok(0);
        } else if self.players[1] == player {
            return Ok(1);
        } else {
            return err!(TicTacToeError::NotPlayer);
        }
    }

}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct Tile {
    x: u8,
    y: u8,
}

impl Tile {
    fn validate(&self) -> Result<()> {
        match self {
            Tile { x: 0..=2, y: 0..=2 } => Ok(()),
            _ => err!(TicTacToeError::InvalidTile),
        }
    }
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
enum GameStatus {
    Active,
    Tie,
    Won { winner: Pubkey },
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy, PartialEq, Eq)]
enum Sign {
    X,
    O,
}

impl Sign {
    fn try_from_idx(idx: u8) -> Result<Self> {
        match idx {
            0 => Ok(Sign::X),
            1 => Ok(Sign::O),
            _ => err!(TicTacToeError::WrongIdx),
        }
    }

    fn to_idx(&self) -> usize {
        match self {
            Sign::X => 0,
            Sign::O => 1,
        }
    }
}
