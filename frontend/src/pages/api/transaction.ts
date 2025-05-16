import type { NextApiRequest, NextApiResponse } from "next"
import redisClient from "@/lib/redis"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { type, publicKey, points, solAmount, signature, status } = req.body

    if (!type || !publicKey || !points || !solAmount) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const transactionData = {
      type,
      publicKey,
      points,
      solAmount,
      signature: signature || null,
      status: status || "pending",
      timestamp: new Date().toISOString(),
    }

    // Store in Redis
    await redisClient.zAdd("transactions", {
      score: Date.now(),
      value: JSON.stringify(transactionData),
    })

    // Log the transaction for debugging
    console.log("Transaction recorded:", transactionData)

    return res.status(200).json({
      success: true,
      message: "Transaction recorded successfully",
      data: transactionData,
    })
  } catch (error) {
    console.error("Transaction recording error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
