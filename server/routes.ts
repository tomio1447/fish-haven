import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCatchSchema, insertMasterySchema, insertTrophySchema } from "@shared/schema";
import { FISH_SPECIES } from "@shared/fishData";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get player data by guest ID (for demo/prototype - in production would use auth)
  app.get("/api/player/:guestId", async (req, res) => {
    try {
      const guestId = `guest_${req.params.guestId}`;
      
      // Check if guest user exists
      let user = await storage.getUserByUsername(guestId);
      
      if (!user) {
        // Create guest user
        user = await storage.createUser({ username: guestId, password: "guest" });
      }
      
      // Get or create player
      let player = await storage.getPlayerByUserId(user.id);
      
      if (!player) {
        player = await storage.createPlayer({ userId: user.id });
      }
      
      // Get inventory (unsold catches)
      const inventory = await storage.getCatches(player.id, false);
      
      // Get mastery records
      const masteryRecords = await storage.getMasteryRecords(player.id);
      
      // Get trophies
      const trophyRecords = await storage.getTrophies(player.id);
      
      // Transform to frontend format
      const masteryMap = masteryRecords.reduce((acc, record) => {
        acc[record.fishId] = {
          fishId: record.fishId,
          count: record.count,
          maxWeight: record.maxWeight,
          stars: record.stars
        };
        return acc;
      }, {} as Record<string, any>);
      
      res.json({
        player,
        inventory: inventory.map(c => ({
          id: c.id,
          fishId: c.fishId,
          weight: c.weight,
          length: c.length || 0,
          rank: c.rank || 'C',
          locationId: c.locationId || 'pond',
          date: c.caughtAt.getTime()
        })),
        mastery: masteryMap,
        trophies: trophyRecords.map(t => ({
          id: t.id,
          fishId: t.fishId,
          weight: t.weight,
          length: t.length,
          rank: t.rank,
          locationId: t.locationId,
          caughtAt: t.caughtAt.getTime(),
          createdAt: t.createdAt.getTime()
        }))
      });
    } catch (error) {
      console.error("Error getting player:", error);
      res.status(500).json({ error: "Failed to get player data" });
    }
  });
  
  // Update player (level, coins, equipment, etc)
  app.patch("/api/player/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const updates = req.body;
      
      const player = await storage.updatePlayer(playerId, updates);
      res.json(player);
    } catch (error) {
      console.error("Error updating player:", error);
      res.status(500).json({ error: "Failed to update player" });
    }
  });
  
  // Add a catch
  app.post("/api/catches", async (req, res) => {
    try {
      const validated = insertCatchSchema.parse(req.body);
      const catch_ = await storage.createCatch(validated);
      
      // Update player mastery
      const { playerId, fishId, weight } = validated;
      
      // Get current mastery
      let masteryRecord = await storage.getMasteryByFish(playerId, fishId);
      
      if (!masteryRecord) {
        // Create new mastery record
        masteryRecord = await storage.createMastery({
          playerId,
          fishId,
          count: 1,
          maxWeight: weight,
          stars: 1
        });
      } else {
        // Update existing
        const newCount = masteryRecord.count + 1;
        const newMaxWeight = Math.max(masteryRecord.maxWeight, weight);
        
        // Calculate stars
        let stars = 0;
        if (newCount >= 1) stars = 1;
        if (newCount >= 5) stars = 2;
        if (newCount >= 10) stars = 3;
        if (newCount >= 25) stars = 4;
        if (newCount >= 50) stars = 5;
        
        masteryRecord = await storage.updateMastery(playerId, fishId, {
          count: newCount,
          maxWeight: newMaxWeight,
          stars
        });
      }
      
      // Calculate XP gain and update player
      const fish = FISH_SPECIES.find(f => f.id === fishId);
      const xpGain = fish ? Math.round(fish.price * 1.5) : 0;
      
      const player = await storage.getPlayer(playerId);
      if (player) {
        let newExp = player.experience + xpGain;
        let newLevel = player.level;
        
        // Level up logic
        while (newExp >= newLevel * 100) {
          newExp -= newLevel * 100;
          newLevel++;
        }
        
        await storage.updatePlayer(playerId, {
          experience: newExp,
          level: newLevel
        });
      }
      
      res.json({ catch: catch_, mastery: masteryRecord });
    } catch (error) {
      console.error("Error creating catch:", error);
      res.status(500).json({ error: "Failed to create catch" });
    }
  });
  
  // Sell a single catch
  app.post("/api/catches/:catchId/sell", async (req, res) => {
    try {
      const catchId = parseInt(req.params.catchId);
      const { playerId, price } = req.body;
      
      await storage.sellCatch(catchId);
      
      // Update player coins
      const player = await storage.getPlayer(playerId);
      if (player) {
        await storage.updatePlayer(playerId, {
          coins: player.coins + price
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error selling catch:", error);
      res.status(500).json({ error: "Failed to sell catch" });
    }
  });
  
  // Sell all catches
  app.post("/api/catches/sell-all", async (req, res) => {
    try {
      const { playerId } = req.body;
      
      // Get all unsold catches
      const unsoldCatches = await storage.getCatches(playerId, false);
      
      // Calculate total value
      let totalValue = 0;
      for (const catch_ of unsoldCatches) {
        const fish = FISH_SPECIES.find(f => f.id === catch_.fishId);
        if (fish) totalValue += fish.price;
      }
      
      // Mark all as sold
      const soldCount = await storage.sellAllCatches(playerId);
      
      // Update player coins
      const player = await storage.getPlayer(playerId);
      if (player) {
        await storage.updatePlayer(playerId, {
          coins: player.coins + totalValue
        });
      }
      
      res.json({ soldCount, totalValue });
    } catch (error) {
      console.error("Error selling all catches:", error);
      res.status(500).json({ error: "Failed to sell all catches" });
    }
  });

  // Create trophy from a catch
  app.post("/api/trophies", async (req, res) => {
    try {
      const { playerId, fishId, weight, length, rank, locationId, caughtAt, catchId } = req.body;
      
      // Create trophy record
      const trophy = await storage.createTrophy({
        playerId,
        fishId,
        weight,
        length,
        rank,
        locationId,
        caughtAt: new Date(caughtAt)
      });
      
      // Mark the catch as trophy (status = 2)
      if (catchId) {
        await storage.makeCatchTrophy(catchId);
      }
      
      res.json({ 
        id: trophy.id,
        fishId: trophy.fishId,
        weight: trophy.weight,
        length: trophy.length,
        rank: trophy.rank,
        locationId: trophy.locationId,
        caughtAt: trophy.caughtAt.getTime(),
        createdAt: trophy.createdAt.getTime()
      });
    } catch (error) {
      console.error("Error creating trophy:", error);
      res.status(500).json({ error: "Failed to create trophy" });
    }
  });

  // Delete trophy
  app.delete("/api/trophies/:trophyId", async (req, res) => {
    try {
      const trophyId = parseInt(req.params.trophyId);
      await storage.deleteTrophy(trophyId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting trophy:", error);
      res.status(500).json({ error: "Failed to delete trophy" });
    }
  });

  return httpServer;
}
