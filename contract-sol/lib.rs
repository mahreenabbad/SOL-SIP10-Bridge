use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::system_program;

//program id-declare id
declare_id!("BrqvbtST215rkLD1fyzj7p5j7tcVGoQPZ4T39GtkGttg");

#[program]
pub mod sol_sip10_bridge {
    use super::*;
// unlock function
    pub fn unlock(ctx: Context<Unlock>, amount: u64) -> Result<()> {
        let pda = &ctx.accounts.pda;
        let recipient = &ctx.accounts.recipient;

        let seeds: &[&[u8]] = &[b"bridge-vault"];
        let (expected_pda, bump) = Pubkey::find_program_address(seeds, ctx.program_id);

        if pda.key() != expected_pda {
            return Err(ProgramError::InvalidArgument.into());
        }

        let transfer_ix = system_instruction::transfer(
            &pda.key(),
            &recipient.key(),
            amount,
        );

        let signer_seeds: &[&[u8]] = &[b"bridge-vault", &[bump]];

        anchor_lang::solana_program::program::invoke_signed(
            &transfer_ix,
            &[
                pda.to_account_info(),
                recipient.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[signer_seeds],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Unlock<'info> {
    #[account(mut)]
    pub pda: AccountInfo<'info>,  // The PDA holding the locked SOL
    /// CHECK: This is safe as we only transfer SOL
    #[account(mut)]
    pub recipient: AccountInfo<'info>, // Destination of the unlocked SOL
    pub system_program: Program<'info, System>,
}
//signature 2PDnVyPtijDQLVpHbpaLqsEkAgCdFQAs793oyYN9BCm7Cg8TVAJjpD7TDcpmoHx1gH8UgdzrJLvhjUaeD8Vo7Xb8
