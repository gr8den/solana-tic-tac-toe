use anchor_lang::prelude::*;
use crate::state::{Tile, Game};

pub fn play(ctx: Context<PlayGame>, tile: Tile) -> Result<()> {
  let game_key = ctx.accounts.game.key();
  ctx.accounts.game.play(game_key, ctx.accounts.player.key(), tile)
}

#[derive(Accounts)]
pub struct PlayGame<'info> {
    #[account(mut)]
    game: Account<'info, Game>,
    player: Signer<'info>,
}
