import type { NextApiRequest, NextApiResponse } from "next"
import redisClient from "@/lib/redis"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { points, publicKey, solAmount } = req.body

    if (!points || !publicKey) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Validate the points amount
    if (points !== 150) {
      return res.status(400).json({ error: "Invalid points amount" })
    }

    // Validate the SOL amount if provided
    if (solAmount && solAmount !== 0.2) {
      return res.status(400).json({ error: "Invalid SOL amount" })
    }

    const redemptionData = {
      publicKey,
      points,
      solAmount: solAmount || 0.2,
      timestamp: new Date().toISOString(),
      status: "pending",
    }

    // Store in Redis
    await redisClient.zAdd("redemptions", {
      score: Date.now(),
      value: JSON.stringify(redemptionData),
    })

    // Log the redemption for debugging
    console.log("Redemption recorded:", redemptionData)

    return res.status(200).json({
      success: true,
      message: "Redemption recorded successfully",
      data: redemptionData,
    })
  } catch (error) {
    console.error("Redemption error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
