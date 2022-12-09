mod instructions;
mod state;
mod errors;

use anchor_lang::prelude::*;
use crate::instructions::*;
use crate::state::Tile;

declare_id!("9163nkVWAADRHwSsK4NsbXEZ7UvqWXTR4inGDfustd5v");

#[program]
pub mod solana_tic_tac_toe {
    use super::*;

    pub fn play(ctx: Context<PlayGame>, tile: Tile) -> Result<()> {
        instructions::play(ctx, tile)
    }

    pub fn start_game(ctx: Context<StartGame>, player_two: Pubkey, admin_bump: u8) -> Result<()> {
        instructions::inc_games_count(&ctx, admin_bump)?;
        instructions::start_game(ctx, player_two)?;
        Ok(())
    }
}
