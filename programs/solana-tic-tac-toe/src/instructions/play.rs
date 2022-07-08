use anchor_lang::prelude::*;
use crate::state::{Tile, Game};

pub fn play(ctx: Context<PlayGame>, tile: Tile) -> Result<()> {
  ctx.accounts.game.play(ctx.accounts.player.key(), tile)
}

#[derive(Accounts)]
pub struct PlayGame<'info> {
    #[account(mut)]
    game: Account<'info, Game>,
    player: Signer<'info>,
}
