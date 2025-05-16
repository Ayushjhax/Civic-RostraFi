import { type Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"

/**
 * Transfer SOL from one wallet to another
 *
 * @param connection - Solana connection
 * @param fromWallet - Wallet to send from (can be Civic or standard wallet)
 * @param toAddress - Recipient address
 * @param amount - Amount in SOL to send
 * @returns Transaction signature
 */
export async function transferSol(connection: Connection, fromWallet: any, toAddress: string, amount: number) {
  try {
    const toPublicKey = new PublicKey(toAddress)

    // Get recent blockhash
    const latestBlockhash = await connection.getLatestBlockhash("confirmed")

    // Create transaction
    const transaction = new Transaction();
    transaction.feePayer = fromWallet.publicKey;
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: toPublicKey,
        lamports: Math.floor(amount * LAMPORTS_PER_SOL),
      }),
    )

    // Send transaction using the wallet's sendTransaction method
    const signature = await fromWallet.sendTransaction(transaction, connection)

    // Confirm the transaction
    await connection.confirmTransaction(
      {
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "confirmed",
    )

    return signature
  } catch (error) {
    console.error("Error transferring SOL:", error)
    throw error
  }
}
