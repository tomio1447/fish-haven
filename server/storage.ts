import { 
  type User, 
  type InsertUser,
  type Player,
  type InsertPlayer,
  type Catch,
  type InsertCatch,
  type Mastery,
  type InsertMastery,
  type Trophy,
  type InsertTrophy,
  users,
  players,
  catches,
  mastery,
  trophies
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Player methods
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByUserId(userId: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, updates: Partial<InsertPlayer>): Promise<Player>;
  
  // Catch methods
  getCatches(playerId: number, includeUnsold?: boolean): Promise<Catch[]>;
  createCatch(catch_: InsertCatch): Promise<Catch>;
  sellCatch(catchId: number): Promise<void>;
  sellAllCatches(playerId: number): Promise<number>; // Returns number of catches sold
  
  // Mastery methods
  getMasteryRecords(playerId: number): Promise<Mastery[]>;
  getMasteryByFish(playerId: number, fishId: string): Promise<Mastery | undefined>;
  updateMastery(playerId: number, fishId: string, updates: Partial<InsertMastery>): Promise<Mastery>;
  createMastery(mastery_: InsertMastery): Promise<Mastery>;

  // Trophy methods
  getTrophies(playerId: number): Promise<Trophy[]>;
  createTrophy(trophy: InsertTrophy): Promise<Trophy>;
  deleteTrophy(trophyId: number): Promise<void>;
  makeCatchTrophy(catchId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Player methods
  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayerByUserId(userId: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.userId, userId));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async updatePlayer(id: number, updates: Partial<InsertPlayer>): Promise<Player> {
    const [player] = await db
      .update(players)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(players.id, id))
      .returning();
    return player;
  }

  // Catch methods
  async getCatches(playerId: number, includeUnsold: boolean = false): Promise<Catch[]> {
    if (includeUnsold) {
      return db.select().from(catches).where(eq(catches.playerId, playerId)).orderBy(desc(catches.caughtAt));
    }
    return db.select().from(catches).where(
      and(eq(catches.playerId, playerId), eq(catches.sold, 0))
    ).orderBy(desc(catches.caughtAt));
  }

  async createCatch(insertCatch: InsertCatch): Promise<Catch> {
    const [catch_] = await db
      .insert(catches)
      .values(insertCatch)
      .returning();
    return catch_;
  }

  async sellCatch(catchId: number): Promise<void> {
    await db
      .update(catches)
      .set({ sold: 1 })
      .where(eq(catches.id, catchId));
  }

  async sellAllCatches(playerId: number): Promise<number> {
    const unsoldCatches = await this.getCatches(playerId, false);
    
    if (unsoldCatches.length === 0) return 0;

    await db
      .update(catches)
      .set({ sold: 1 })
      .where(
        and(
          eq(catches.playerId, playerId),
          eq(catches.sold, 0)
        )
      );
    
    return unsoldCatches.length;
  }

  // Mastery methods
  async getMasteryRecords(playerId: number): Promise<Mastery[]> {
    return db.select().from(mastery).where(eq(mastery.playerId, playerId));
  }

  async getMasteryByFish(playerId: number, fishId: string): Promise<Mastery | undefined> {
    const [record] = await db.select().from(mastery).where(
      and(eq(mastery.playerId, playerId), eq(mastery.fishId, fishId))
    );
    return record || undefined;
  }

  async updateMastery(playerId: number, fishId: string, updates: Partial<InsertMastery>): Promise<Mastery> {
    const [record] = await db
      .update(mastery)
      .set(updates)
      .where(
        and(eq(mastery.playerId, playerId), eq(mastery.fishId, fishId))
      )
      .returning();
    return record;
  }

  async createMastery(insertMastery: InsertMastery): Promise<Mastery> {
    const [record] = await db
      .insert(mastery)
      .values(insertMastery)
      .returning();
    return record;
  }

  // Trophy methods
  async getTrophies(playerId: number): Promise<Trophy[]> {
    return db.select().from(trophies).where(eq(trophies.playerId, playerId)).orderBy(desc(trophies.createdAt));
  }

  async createTrophy(insertTrophy: InsertTrophy): Promise<Trophy> {
    const [trophy] = await db
      .insert(trophies)
      .values(insertTrophy)
      .returning();
    return trophy;
  }

  async deleteTrophy(trophyId: number): Promise<void> {
    await db.delete(trophies).where(eq(trophies.id, trophyId));
  }

  async makeCatchTrophy(catchId: number): Promise<void> {
    await db
      .update(catches)
      .set({ sold: 2 }) // 2 = trophy
      .where(eq(catches.id, catchId));
  }
}

export const storage = new DatabaseStorage();
