// Storage adapter: Supabase (per-account) when env vars are present,
// localStorage fallback. The game code only talks to the StorageAdapter
// interface, so the backend can be swapped without touching game logic.
//
// With Supabase configured, writes require a signed-in user (RLS); reads
// of the leaderboard are public.

import { getSupabase, supabaseConfigured } from "./auth";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface GameRecord {
  gameId: string;
  mode: "ai" | "2p";
  winner: "A" | "B" | "draw" | null;
  moves: number;
  durationSec: number;
  createdAt: string;
}

export interface SavedGame {
  gameId: string;
  /** Serialized engine GameState (JSON-safe). */
  state: unknown;
  updatedAt: string;
}

export interface LeaderEntry {
  userId: string;
  games: number;
  aiWins: number;
}

export interface StorageAdapter {
  readonly backend: "supabase" | "local";
  /** True when writes will persist (local always; supabase needs sign-in). */
  canWrite(): Promise<boolean>;
  saveResult(r: GameRecord): Promise<void>;
  listResults(gameId: string, limit?: number): Promise<GameRecord[]>;
  myResults(gameId: string, limit?: number): Promise<GameRecord[]>;
  saveGame(s: SavedGame): Promise<void>;
  loadGame(gameId: string): Promise<SavedGame | null>;
  clearGame(gameId: string): Promise<void>;
  leaderboard(gameId: string, limit?: number): Promise<LeaderEntry[]>;
}

const LS_RESULTS = "ck:results";
const LS_SAVE_PREFIX = "ck:save:";

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

class LocalAdapter implements StorageAdapter {
  readonly backend = "local" as const;

  async canWrite(): Promise<boolean> {
    return true;
  }

  async saveResult(r: GameRecord): Promise<void> {
    const all = readLS<GameRecord[]>(LS_RESULTS, []);
    all.push(r);
    try {
      localStorage.setItem(LS_RESULTS, JSON.stringify(all.slice(-500)));
    } catch { /* storage full / private mode: ignore */ }
  }

  async listResults(gameId: string, limit = 20): Promise<GameRecord[]> {
    return this.myResults(gameId, limit);
  }

  async myResults(gameId: string, limit = 20): Promise<GameRecord[]> {
    return readLS<GameRecord[]>(LS_RESULTS, [])
      .filter((r) => r.gameId === gameId)
      .slice(-limit)
      .reverse();
  }

  async saveGame(s: SavedGame): Promise<void> {
    try {
      localStorage.setItem(LS_SAVE_PREFIX + s.gameId, JSON.stringify(s));
    } catch { /* ignore */ }
  }

  async loadGame(gameId: string): Promise<SavedGame | null> {
    return readLS<SavedGame | null>(LS_SAVE_PREFIX + gameId, null);
  }

  async clearGame(gameId: string): Promise<void> {
    try {
      localStorage.removeItem(LS_SAVE_PREFIX + gameId);
    } catch { /* ignore */ }
  }

  async leaderboard(): Promise<LeaderEntry[]> {
    return [];
  }
}

async function uid(sb: SupabaseClient): Promise<string> {
  const { data } = await sb.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("sign-in required");
  return id;
}

class SupabaseAdapter implements StorageAdapter {
  readonly backend = "supabase" as const;
  private sb: SupabaseClient;

  constructor() {
    this.sb = getSupabase()!;
  }

  async canWrite(): Promise<boolean> {
    const { data } = await this.sb.auth.getUser();
    return !!data.user;
  }

  async saveResult(r: GameRecord): Promise<void> {
    const user_id = await uid(this.sb);
    const { error } = await this.sb.from("ck_results").insert({
      user_id,
      game_id: r.gameId,
      mode: r.mode,
      winner: r.winner,
      moves: r.moves,
      duration_sec: r.durationSec,
      created_at: r.createdAt,
    });
    if (error) throw error;
  }

  async listResults(gameId: string, limit = 20): Promise<GameRecord[]> {
    const { data, error } = await this.sb
      .from("ck_results")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(toRecord);
  }

  async myResults(gameId: string, limit = 20): Promise<GameRecord[]> {
    const user_id = await uid(this.sb);
    const { data, error } = await this.sb
      .from("ck_results")
      .select("*")
      .eq("game_id", gameId)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(toRecord);
  }

  async saveGame(s: SavedGame): Promise<void> {
    const user_id = await uid(this.sb);
    const { error } = await this.sb.from("ck_saves").upsert(
      { user_id, game_id: s.gameId, state: s.state, updated_at: s.updatedAt },
      { onConflict: "user_id,game_id" },
    );
    if (error) throw error;
  }

  async loadGame(gameId: string): Promise<SavedGame | null> {
    const user_id = await uid(this.sb);
    const { data, error } = await this.sb
      .from("ck_saves")
      .select("*")
      .eq("user_id", user_id)
      .eq("game_id", gameId)
      .maybeSingle();
    if (error) throw error;
    return data
      ? { gameId: data.game_id, state: data.state, updatedAt: data.updated_at }
      : null;
  }

  async clearGame(gameId: string): Promise<void> {
    const user_id = await uid(this.sb);
    const { error } = await this.sb
      .from("ck_saves")
      .delete()
      .eq("user_id", user_id)
      .eq("game_id", gameId);
    if (error) throw error;
  }

  async leaderboard(gameId: string, limit = 10): Promise<LeaderEntry[]> {
    const { data, error } = await this.sb
      .from("ck_leaderboard")
      .select("*")
      .eq("game_id", gameId)
      .order("ai_wins", { ascending: false })
      .order("games", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((d) => ({
      userId: d.user_id,
      games: d.games,
      aiWins: d.ai_wins,
    }));
  }
}

function toRecord(d: Record<string, unknown>): GameRecord {
  return {
    gameId: d.game_id as string,
    mode: d.mode as "ai" | "2p",
    winner: d.winner as "A" | "B" | "draw" | null,
    moves: d.moves as number,
    durationSec: d.duration_sec as number,
    createdAt: d.created_at as string,
  };
}

let instance: StorageAdapter | null = null;

/** Singleton adapter. Supabase only when env vars are set. */
export function getStorage(): StorageAdapter {
  if (instance) return instance;
  if (typeof window !== "undefined" && supabaseConfigured()) {
    try {
      instance = new SupabaseAdapter();
      console.info("[ck] storage backend: supabase");
      return instance;
    } catch (e) {
      console.warn("[ck] supabase init failed, falling back to local", e);
    }
  }
  instance = new LocalAdapter();
  if (typeof window !== "undefined") console.info("[ck] storage backend: local");
  return instance;
}
