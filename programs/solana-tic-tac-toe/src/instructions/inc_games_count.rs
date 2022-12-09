use anchor_lang::prelude::*;
use stats::cpi::accounts::IncGamesCountAccounts;
use crate::instructions::StartGame;

pub fn inc_games_count(ctx: &Context<StartGame>, admin_bump: u8) -> Result<()> {
  let seeds = &[&[b"admin", bytemuck::bytes_of(&admin_bump)][..]];
  let cpi_program = ctx.accounts.stats_program.to_account_info();
  let cpi_accounts = IncGamesCountAccounts {
    stats: ctx.accounts.stats.to_account_info(),
    admin: ctx.accounts.admin.to_account_info(),
  };
  let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds);
  stats::cpi::inc_games_count(cpi_ctx)
}
