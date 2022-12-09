use anchor_lang::prelude::*;
use crate::state::Game;
use stats::program::Stats;
use stats::{self, StatsData};

pub fn start_game(ctx: Context<StartGame>, player_two: Pubkey) -> Result<()> {
  let game_key = ctx.accounts.game.key();
  ctx.accounts.game.start(game_key, [ctx.accounts.player_one.key(), player_two])
}

#[derive(Accounts)]
pub struct StartGame<'info> {
    #[account(init, payer = player_one, space = 8 + Game::MAX_SIZE)]
    pub game: Account<'info, Game>,

    #[account(mut)]
    player_one: Signer<'info>,

    #[account(mut)]
    pub stats: Account<'info, StatsData>,

    pub stats_program: Program<'info, Stats>,

    /// CHECK: only used as a signing PDA
    pub admin: UncheckedAccount<'info>,

    system_program: Program<'info, System>,
}
