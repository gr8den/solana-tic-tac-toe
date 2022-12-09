mod errors;

use anchor_lang::prelude::*;
use errors::StatsError;

declare_id!("TicQkEcbikbk4K5LpMthVWhsZNmrJnopA9mcupg5qcr");

#[program]
pub mod stats {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, admin: Pubkey) -> Result<()> {
        let data = &mut ctx.accounts.stats;
        msg!("stats init with data acc {}", data.key());

        // require!(!data.inited, StatsError::AlreadyInited);
        data.admin = admin;

        Ok(())
    }

    pub fn inc_games_count(ctx: Context<IncGamesCountAccounts>) -> Result<()> {
        let stats = &mut ctx.accounts.stats;

        // require!(stats.inited, StatsError::NotInited);
        require!(ctx.accounts.admin.is_signer, StatsError::NotAuthorized);
        require_keys_eq!(ctx.accounts.admin.key(), stats.admin, StatsError::NotAuthorized);

        stats.games_count += 1;
        Ok(())
    }
}


#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + StatsData::MAX_SIZE, seeds = [b"stats"], bump)]
    pub stats: Account<'info, StatsData>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct IncGamesCountAccounts<'info> {
    #[account(mut)]
    pub stats: Account<'info, StatsData>,

    pub admin: Signer<'info>,
}


#[account]
pub struct StatsData {
    // inited: bool,
    admin: Pubkey,

    pub games_count: u64,
}

impl StatsData {
    pub const MAX_SIZE: usize = 32 + 8;
}
