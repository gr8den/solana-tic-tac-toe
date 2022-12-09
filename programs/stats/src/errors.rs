use anchor_lang::prelude::*;

#[error_code]
pub enum StatsError {
    NotInited,
    AlreadyInited,
    NotAuthorized,
}
