"use client"
import { useState, useCallback } from "react"
import type React from "react"

import { useUser } from "@civic/auth-web3/react"
import { userHasWallet } from "@civic/auth-web3"
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useAppDispatch } from "@/hooks/reduxHooks"
import { addUserPoints } from "@/store/userSlice"

interface CivicTransactionButtonProps {
  className?: string
}

const POINTS_PER_PURCHASE = 150
const SOL_AMOUNT = 0.2
const TREASURY_WALLET = "JCsFjtj6tem9Dv83Ks4HxsL7p8GhdLtokveqW7uWjGyi"
const SOLANA_RPC_URL = "https://api.devnet.solana.com"

export const CivicTransactionButton: React.FC<CivicTransactionButtonProps> = ({ className }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const userContext = useUser()
  const dispatch = useAppDispatch()

  const wallet = userHasWallet(userContext) ? userContext.solana.wallet : undefined

  const buyPoints = useCallback(async () => {
    if (!userHasWallet(userContext) || !wallet) {
      setError("No wallet found. Please connect your Civic wallet.")
      return
    }

    setIsProcessing(true)
    setError(null)
    setTxSignature(null)

    try {
      const connection = new Connection(SOLANA_RPC_URL, "confirmed")

      if (!userContext.solana.wallet.publicKey) {
        throw new Error("No wallet public key found")
      }

      const blockhash = await connection.getLatestBlockhash("confirmed")

      const transaction = new Transaction({
        ...blockhash,
        feePayer: userContext.solana.wallet.publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: userContext.solana.wallet.publicKey,
          toPubkey: new PublicKey(TREASURY_WALLET),
          lamports: SOL_AMOUNT * LAMPORTS_PER_SOL,
        }),
      )

      const signature = await wallet.sendTransaction(transaction, connection)
      setTxSignature(signature)

      await connection.confirmTransaction({ signature, ...blockhash }, "confirmed")

      // Add points after successful transaction
      dispatch(addUserPoints(POINTS_PER_PURCHASE))

      // Record transaction
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "buy",
          publicKey: userContext.solana.wallet.publicKey.toString(),
          points: POINTS_PER_PURCHASE,
          solAmount: SOL_AMOUNT,
          signature,
          status: "confirmed",
        }),
      })

      console.log("Transaction successful:", signature)
    } catch (err: any) {
      console.error("Transaction error:", err)
      setError(err.message || "Transaction failed")
    } finally {
      setIsProcessing(false)
    }
  }, [userContext, wallet, dispatch])

  if (!userContext.user) {
    return (
      <button className={className} disabled>
        Login with Civic first
      </button>
    )
  }

  if (!wallet) {
    return (
      <button className={className} disabled>
        Wallet not connected
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={buyPoints}
        disabled={isProcessing}
        className={`${className || "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"} ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isProcessing ? "Processing..." : `Buy ${POINTS_PER_PURCHASE} Points (${SOL_AMOUNT} SOL)`}
      </button>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {txSignature && (
        <div className="text-green-500 text-sm">
          Transaction successful!{" "}
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on Solana Explorer
          </a>
        </div>
      )}
    </div>
  )
}
