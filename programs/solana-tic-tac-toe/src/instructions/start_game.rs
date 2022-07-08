use anchor_lang::prelude::*;
use crate::state::Game;

pub fn start_game(ctx: Context<StartGame>, player_two: Pubkey) -> Result<()> {
  ctx.accounts.game.start([ctx.accounts.player_one.key(), player_two])
}

#[derive(Accounts)]
pub struct StartGame<'info> {
    #[account(init, payer = player_one, space = 8 + Game::MAX_SIZE)]
    pub game: Account<'info, Game>,

    #[account(mut)]
    player_one: Signer<'info>,

    system_program: Program<'info, System>,
}
