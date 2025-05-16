"use client"
import { useState, useEffect, useCallback } from "react"
import type React from "react"

import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks"
import { addUserPoints, removeUserPoints } from "@/store/userSlice"
import { useParams } from "next/navigation"
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useWallet } from "@solana/wallet-adapter-react"
import { useUser } from "@civic/auth-web3/react"
import { userHasWallet } from "@civic/auth-web3"
import {
  X,
  Wallet,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  Loader2,
  Send,
} from "lucide-react"

const POINTS_PER_PURCHASE = 150
const SOL_AMOUNT = 0.2
const TREASURY_WALLET = new PublicKey("JCsFjtj6tem9Dv83Ks4HxsL7p8GhdLtokveqW7uWjGyi")
const SOLANA_RPC_URL = "https://devnet.helius-rpc.com/?api-key=a969d395-9864-418f-8a64-65c1ef2107f9"

interface WalletDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const WalletDialog: React.FC<WalletDialogProps> = ({ isOpen, onClose }) => {
  const [walletAddress, setWalletAddress] = useState("")
  const [balance, setBalance] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionType, setTransactionType] = useState("buy") // "buy" points, "exchange" points, or "transfer" sol
  const [message, setMessage] = useState({ type: "", text: "" })
  const [transactionSignature, setTransactionSignature] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [transferAddress, setTransferAddress] = useState("")
  const [transferAmount, setTransferAmount] = useState("0.1")

  // Get wallet from Solana wallet adapter
  const { publicKey, sendTransaction } = useWallet()

  // Get Civic user context
  const userContext = useUser()
  const civicWallet = userHasWallet(userContext) ? userContext.solana.wallet : undefined

  const dispatch = useAppDispatch()
  const params = useParams()
  const tourId = params?.tourId as string | undefined

  const { points } = useAppSelector((state) => state.user)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      loadWalletFromLocalStorage()
    } else {
      document.body.style.overflow = "auto"
      setMessage({ type: "", text: "" })
      setTransactionSignature("")
      setDebugInfo(null)
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const loadWalletFromLocalStorage = () => {
    try {
      const storedWalletAddress = localStorage.getItem("UserId")
      if (storedWalletAddress) {
        setWalletAddress(storedWalletAddress)
        fetchWalletBalance(storedWalletAddress)
      }
    } catch (error) {
      console.error("Error loading wallet from localStorage:", error)
      setDebugInfo({
        error: "Failed to load wallet from localStorage",
        details: error,
      })
    }
  }

  const fetchWalletBalance = async (address: string) => {
    try {
      const connection = new Connection(SOLANA_RPC_URL, "confirmed")
      const publicKey = new PublicKey(address)
      const balanceInLamports = await connection.getBalance(publicKey)
      setBalance(balanceInLamports / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error("Error fetching balance:", error)
      setDebugInfo({ error: "Failed to fetch wallet balance", details: error })
    }
  }

  const buyPoints = useCallback(async () => {
    try {
      if (!walletAddress) {
        setMessage({
          type: "error",
          text: "Please connect your wallet first.",
        })
        return
      }

      // Check if we have enough balance (including a buffer for transaction fees)
      if (balance < SOL_AMOUNT + 0.001) {
        setMessage({
          type: "error",
          text: `Insufficient balance. You need at least ${SOL_AMOUNT + 0.001} SOL.`,
        })
        return
      }

      setIsProcessing(true)
      setMessage({ type: "info", text: "Preparing transaction..." })
      setDebugInfo(null)

      // Create connection
      const connection = new Connection(SOLANA_RPC_URL, "confirmed")

      // Determine which wallet to use (Civic or regular wallet adapter)
      const activeWallet = civicWallet || {
        publicKey: new PublicKey(walletAddress),
      }

      if (!activeWallet.publicKey) {
        throw new Error("Wallet public key not found")
      }

      setDebugInfo({
        step: "Creating transaction",
        walletType: civicWallet ? "Civic" : "Standard",
        fromPublicKey: activeWallet.publicKey.toString(),
        toPublicKey: TREASURY_WALLET.toString(),
        amount: SOL_AMOUNT,
      })

      // Calculate exact lamports to send (avoid floating point issues)
      const lamportsToSend = Math.floor(SOL_AMOUNT * LAMPORTS_PER_SOL)

      // Get recent blockhash
      const blockhash = await connection.getLatestBlockhash("confirmed")

      // Create the transaction
      const transaction = new Transaction({
        ...blockhash,
        feePayer: activeWallet.publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: activeWallet.publicKey,
          toPubkey: TREASURY_WALLET,
          lamports: lamportsToSend,
        }),
      )

      setMessage({
        type: "info",
        text: "Please approve the transaction in your wallet...",
      })

      let signature: string

      // Send transaction using the appropriate wallet
      if (civicWallet) {
        // Use Civic wallet
        signature = await civicWallet.sendTransaction(transaction, connection)
        dispatch(addUserPoints(POINTS_PER_PURCHASE))
      } else if (sendTransaction) {
        // Use wallet adapter
        signature = await sendTransaction(transaction, connection)
      } else {
        throw new Error("No wallet method available to send transaction")
      }

      setTransactionSignature(signature)
      setMessage({
        type: "info",
        text: "Transaction sent! Waiting for confirmation...",
      })

      setDebugInfo({
        ...debugInfo,
        step: "Transaction sent",
        signature,
      })

      // Wait for confirmation
      await connection.confirmTransaction(
        {
          signature,
          ...blockhash,
        },
        "confirmed",
      )

      // Update balance
      await fetchWalletBalance(walletAddress)

      // Add points

      // Record the transaction
      try {
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "buy",
            publicKey: walletAddress,
            points: POINTS_PER_PURCHASE,
            solAmount: SOL_AMOUNT,
            signature,
            status: "confirmed",
          }),
        })
      } catch (error) {
        console.error("Failed to record transaction:", error)
        // Continue even if recording fails
      }

      setMessage({
        type: "success",
        text: `Successfully purchased ${POINTS_PER_PURCHASE} points!`,
      })

      setDebugInfo({
        ...debugInfo,
        step: "Transaction confirmed",
        points: POINTS_PER_PURCHASE,
      })

      setTimeout(() => {
        setMessage({ type: "", text: "" })
        onClose()
      }, 3000)
    } catch (error: any) {
      console.error("Error buying points:", error)
      setMessage({
        type: "error",
        text: error.message || "Transaction failed. Please try again.",
      })
      setDebugInfo({
        ...debugInfo,
        step: "Transaction failed",
        error: error.message || "Unknown error",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [walletAddress, balance, civicWallet, sendTransaction, dispatch, debugInfo, onClose])

  const exchangePointsForSol = async () => {
    try {
      if (!walletAddress) {
        setMessage({
          type: "error",
          text: "Please connect your wallet first.",
        })
        return
      }

      if (points < POINTS_PER_PURCHASE) {
        setMessage({
          type: "error",
          text: `Insufficient points. You need at least ${POINTS_PER_PURCHASE} points.`,
        })
        return
      }

      setIsProcessing(true)
      setMessage({ type: "info", text: "Processing redemption request..." })

      // Only deduct points - no API call or Redis interaction
      dispatch(removeUserPoints(POINTS_PER_PURCHASE))

      setMessage({
        type: "success",
        text: `${POINTS_PER_PURCHASE} points exchanged!`,
      })

      setTimeout(() => {
        setMessage({ type: "", text: "" })
        onClose()
      }, 3000)
    } catch (error: any) {
      console.error("Error exchanging points:", error)
      setMessage({
        type: "error",
        text: error.message || "Transaction failed. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const transferSol = async () => {
    try {
      if (!walletAddress) {
        setMessage({
          type: "error",
          text: "Please connect your wallet first.",
        })
        return
      }

      // Validate recipient address
      if (!transferAddress) {
        setMessage({
          type: "error",
          text: "Please enter a recipient wallet address.",
        })
        return
      }

      // Validate transfer amount
      const amount = Number.parseFloat(transferAmount)
      if (isNaN(amount) || amount <= 0) {
        setMessage({
          type: "error",
          text: "Please enter a valid amount greater than 0.",
        })
        return
      }

      // Check if we have enough balance (including a buffer for transaction fees)
      if (balance < amount + 0.001) {
        setMessage({
          type: "error",
          text: `Insufficient balance. You need at least ${amount + 0.001} SOL.`,
        })
        return
      }

      setIsProcessing(true)
      setMessage({ type: "info", text: "Preparing transaction..." })
      setDebugInfo(null)

      // Create connection
      const connection = new Connection(SOLANA_RPC_URL, "confirmed")

      // Validate recipient address
      let recipientPublicKey: PublicKey
      try {
        recipientPublicKey = new PublicKey(transferAddress)
      } catch (error) {
        throw new Error("Invalid recipient wallet address")
      }

      // Determine which wallet to use (Civic or regular wallet adapter)
      const activeWallet = civicWallet || {
        publicKey: new PublicKey(walletAddress),
      }

      if (!activeWallet.publicKey) {
        throw new Error("Wallet public key not found")
      }

      setDebugInfo({
        step: "Creating transfer transaction",
        walletType: civicWallet ? "Civic" : "Standard",
        fromPublicKey: activeWallet.publicKey.toString(),
        toPublicKey: recipientPublicKey.toString(),
        amount: amount,
      })

      // Calculate exact lamports to send (avoid floating point issues)
      const lamportsToSend = Math.floor(amount * LAMPORTS_PER_SOL)

      // Get recent blockhash
      const blockhash = await connection.getLatestBlockhash("confirmed")

      // Create the transaction
      const transaction = new Transaction({
        ...blockhash,
        feePayer: activeWallet.publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: activeWallet.publicKey,
          toPubkey: recipientPublicKey,
          lamports: lamportsToSend,
        }),
      )

      setMessage({
        type: "info",
        text: "Please approve the transaction in your wallet...",
      })

      let signature: string

      // Send transaction using the appropriate wallet
      if (civicWallet) {
        // Use Civic wallet
        signature = await civicWallet.sendTransaction(transaction, connection)
      } else if (sendTransaction) {
        // Use wallet adapter
        signature = await sendTransaction(transaction, connection)
      } else {
        throw new Error("No wallet method available to send transaction")
      }

      setTransactionSignature(signature)
      setMessage({
        type: "info",
        text: "Transaction sent! Waiting for confirmation...",
      })

      setDebugInfo({
        ...debugInfo,
        step: "Transaction sent",
        signature,
      })

      // Wait for confirmation
      await connection.confirmTransaction(
        {
          signature,
          ...blockhash,
        },
        "confirmed",
      )

      // Update balance
      await fetchWalletBalance(walletAddress)

      // Record the transaction
      try {
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "transfer",
            publicKey: walletAddress,
            recipientPublicKey: recipientPublicKey.toString(),
            solAmount: amount,
            signature,
            status: "confirmed",
          }),
        })
      } catch (error) {
        console.error("Failed to record transaction:", error)
        // Continue even if recording fails
      }

      setMessage({
        type: "success",
        text: `Successfully transferred ${amount} SOL!`,
      })

      setDebugInfo({
        ...debugInfo,
        step: "Transaction confirmed",
        amount: amount,
      })

      // Reset form
      setTransferAddress("")
      setTransferAmount("0.1")

      setTimeout(() => {
        setMessage({ type: "", text: "" })
      }, 3000)
    } catch (error: any) {
      console.error("Error transferring SOL:", error)
      setMessage({
        type: "error",
        text: error.message || "Transaction failed. Please try again.",
      })
      setDebugInfo({
        ...debugInfo,
        step: "Transaction failed",
        error: error.message || "Unknown error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-4xl mx-auto my-8 z-10 overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-6 relative">
          <div className="flex items-center">
            <Wallet className="w-6 h-6 mr-3" />
            <h3 className="text-xl font-bold">Wallet</h3>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Messages */}
        {message.text && (
          <div
            className={`mx-6 mt-6 px-5 py-4 rounded-lg flex items-start ${
              message.type === "error"
                ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                : message.type === "info"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            }`}
          >
            <div className="mr-3 mt-0.5 flex-shrink-0">
              {message.type === "error" ? (
                <AlertCircle className="w-5 h-5" />
              ) : message.type === "info" ? (
                <Info className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-medium">{message.text}</p>
              {transactionSignature && (
                <div className="mt-2 text-xs flex items-center">
                  <a
                    href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline flex items-center hover:text-black dark:hover:text-white transition-colors"
                  >
                    View transaction on Solana Explorer
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content - Two Column Layout */}
        <div className="p-6 bg-white dark:bg-black dark:text-white grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Wallet Info */}
          <div className="space-y-6">
            {/* Balance Cards */}
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Wallet Balance</div>
                <div className="text-3xl font-bold">{balance.toFixed(3)} SOL</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Points Balance</div>
                <div className="text-3xl font-bold">{points || 0}</div>
              </div>
            </div>

            {!walletAddress ? (
              <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">No wallet connected.</p>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Connected Wallet</div>
                <div className="font-mono text-sm bg-white dark:bg-black p-3 rounded-lg border border-gray-200 dark:border-gray-800 break-all">
                  {walletAddress}
                </div>
                <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                    {civicWallet ? "Civic Custodial Wallet" : "Standard Wallet"}
                  </div>
                </div>
              </div>
            )}

            {/* Debug Info (Collapsible) */}
            {debugInfo && (
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 text-xs font-medium">Debug Information</div>
                <div className="bg-gray-50 dark:bg-gray-950 p-3 overflow-auto max-h-40 text-xs font-mono">
                  <pre className="text-gray-800 dark:text-gray-300">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Transaction Options */}
          <div className="space-y-6">
            {/* Transaction Type Selector */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-1.5 flex gap-2 border border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setTransactionType("buy")}
                className={`flex-1 py-3 px-2 rounded-lg font-medium transition-all text-sm ${
                  transactionType === "buy"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-lg"
                    : "bg-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                Buy Points
              </button>
              <button
                onClick={() => setTransactionType("exchange")}
                className={`flex-1 py-3 px-2 rounded-lg font-medium transition-all text-sm ${
                  transactionType === "exchange"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-lg"
                    : "bg-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                Exchange Points
              </button>
              <button
                onClick={() => setTransactionType("transfer")}
                className={`flex-1 py-3 px-2 rounded-lg font-medium transition-all text-sm ${
                  transactionType === "transfer"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-lg"
                    : "bg-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                Transfer Points
              </button>
            </div>

            {/* Transaction Details */}
            {transactionType === "buy" ? (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black w-12 h-12 rounded-full mb-2">
                    <ArrowDown className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold">Buy Points</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Cost</span>
                    <span className="font-bold">{SOL_AMOUNT} SOL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Network Fee</span>
                    <span className="font-medium">~0.000005 SOL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Points Earned</span>
                    <span className="font-bold text-green-600 dark:text-green-400">+{POINTS_PER_PURCHASE}</span>
                  </div>

                  <div className="pt-2">
                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Cost</span>
                      <span className="font-bold">{SOL_AMOUNT + 0.000005} SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : transactionType === "exchange" ? (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black w-12 h-12 rounded-full mb-2">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold">Exchange Points</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Points Cost</span>
                    <span className="font-bold text-red-600 dark:text-red-400">-{POINTS_PER_PURCHASE} Points</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">SOL Received</span>
                    <span className="font-bold text-green-600 dark:text-green-400">+{SOL_AMOUNT} SOL</span>
                  </div>

                  <div className="pt-2">
                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Exchange Rate</span>
                      <span className="font-bold">
                        {POINTS_PER_PURCHASE} Points = {SOL_AMOUNT} SOL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black w-12 h-12 rounded-full mb-2">
                    <Send className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold">Transfer Points</h4>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="recipient-address"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Recipient Wallet Address
                    </label>
                    <input
                      id="recipient-address"
                      type="text"
                      value={transferAddress}
                      onChange={(e) => setTransferAddress(e.target.value)}
                      placeholder="Enter wallet address"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="transfer-amount"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Amount (SOL)
                    </label>
                    <input
                      id="transfer-amount"
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                    />
                  </div>

                  <div className="pt-2">
                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Network Fee</span>
                      <span className="font-medium">~0.000005 SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={
                transactionType === "buy"
                  ? buyPoints
                  : transactionType === "exchange"
                    ? exchangePointsForSol
                    : transferSol
              }
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl text-white font-medium transition-all ${
                isProcessing
                  ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </span>
              ) : transactionType === "buy" ? (
                `Buy ${POINTS_PER_PURCHASE} Points`
              ) : transactionType === "exchange" ? (
                `Exchange for ${SOL_AMOUNT} SOL`
              ) : (
                `Transfer SOL`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
