"use client"
import { useState, useEffect } from "react"
import { useAppSelector } from "@/hooks/reduxHooks"
import { useParams } from "next/navigation"
import { WalletDialog } from "@/components/WalletDialog"
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

const SolanaNavbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [balance, setBalance] = useState("")
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const params = useParams()
  const tourId = params?.tourId as string | undefined

  const { points } = useAppSelector((state) => state.user)

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    loadWalletFromLocalStorage()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const loadWalletFromLocalStorage = () => {
    try {
      const storedWalletAddress = localStorage.getItem("UserId")
      console.log("Stored Wallet Address:", storedWalletAddress)

      if (storedWalletAddress) {
        setWalletAddress(storedWalletAddress)
        fetchWalletBalance(storedWalletAddress)
      }
    } catch (error) {
      console.error("Error loading wallet from localStorage:", error)
    }
  }

  const fetchWalletBalance = async (address: string) => {
    try {
      // Use the Connection class from @solana/web3.js instead of solana.Connection
      const connection = new Connection("https://api.devnet.solana.com", "confirmed")

      const publicKey = new PublicKey(address)
      const balanceInLamports = await connection.getBalance(publicKey)

      const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL
      setBalance(balanceInSol.toFixed(3))
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  const openWalletDialog = () => {
    setIsWalletOpen(true)
  }

  return (
    <>
      <div
        className={`fixed w-full transition-all duration-300 z-50 ${scrolled ? "top-0" : "top-4"} pointer-events-none`}
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <div
            className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-[32px] px-3 py-2 max-w-[350px] sm:max-w-[520px] border border-gray-800 pointer-events-auto"
            style={{ backgroundColor: "rgba(0, 0, 0, .6)" }}
          >
            <div className="flex items-center gap-2 px-2 border-r border-gray-700">
              <span className="text-white">{points || 0}</span>
            </div>

            <button
              onClick={openWalletDialog}
              className="flex gap-1 items-center bg-slate-300 text-black font-medium px-4 py-1 rounded-full h-8 ml-2"
            >
              <span>Wallet</span>
              {balance && <span>({balance} SOL)</span>}
            </button>
          </div>
        </div>
      </div>

      <WalletDialog isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </>
  )
}

export default SolanaNavbar
