"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  setupMafiaGame,
  checkWinner,
  roleEmojis,
  roleDescriptions,
  type MafiaPlayer,
  type MafiaRole,
} from "@/lib/mafia";
import { slugToSeed, seededRandom } from "@/lib/gamecodes";
import SoundToggle from "@/components/SoundToggle";
import { useSoundEnabled } from "@/hooks/useSoundEnabled";
import {
  narrateNightAnnounce,
  narratePrivacyWall,
  narrateNightDone,
  narrateWakeUp,
  stopSpeaking,
} from "@/lib/sounds";

/*
  ── DESIGN PHILOSOPHY ──
  The phone is placed face-up in the center of the group (like a board game).
  Nobody needs to "pass" it. The screen shows PUBLIC info for everyone
  EXCEPT during role-reveal (each player picks up the phone, taps to peek,
  taps to hide, puts it back). Night actions use a PRIVACY WALL — the screen
  says "Everyone close your eyes" then "Mafia, open your eyes" with a
  tap-to-reveal / tap-to-hide pattern so only the right person peeks.
*/

type GamePhase =
  | "roleReveal"     // Each player peeks at their role
  | "nightAnnounce"  // "Everyone close your eyes" — public
  | "nightAction"    // Mafia/Doctor/Detective peeks & picks — private
  | "nightDone"      // "Everyone open your eyes" transition
  | "nightResult"    // What happened overnight — public
  | "day"            // Discussion — public
  | "voting"         // Vote someone out — public
  | "voteResult"     // Who was voted out — public
  | "gameOver";      // Winner — public

type NightRole = "mafia" | "doctor" | "detective";

function parseCode(code: string, namesList?: string[]) {
  const parts = code.split("-");
  if (parts.length < 5) return null;

  const playerCount = parseInt(parts[0], 10);
  const mafiaCount = parseInt(parts[1], 10);
  const hasDoctor = parts[2] === "1";
  const hasDetective = parts[3] === "1";
  const slug = parts[parts.length - 1];

  if (isNaN(playerCount) || playerCount < 5 || playerCount > 15) return null;
  if (isNaN(mafiaCount) || mafiaCount < 1) return null;

  const seed = slugToSeed(slug);
  if (seed === null) return null;

  const random = seededRandom(seed);
  const playerNames =
    namesList && namesList.length === playerCount
      ? namesList
      : Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`);

  return setupMafiaGame(playerNames, mafiaCount, hasDoctor, hasDetective, random);
}

/* ── Shared UI Components ── */

function SyneHeading({ children, className = "", style }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h2
      className={`font-black uppercase tracking-[0.2em] ${className}`}
      style={{ fontFamily: "var(--font-syne), var(--font-display)", ...style }}
    >
      {children}
    </h2>
  );
}

function PlayerChips({ players, showDead = true }: { players: MafiaPlayer[]; showDead?: boolean }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
      {players.map((p) =>
        !showDead && !p.alive ? null : (
          <span
            key={p.id}
            className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold sm:text-xs ${
              p.alive
                ? "border-white/10 text-white/50"
                : "border-red-500/20 text-red-400/40 line-through"
            }`}
          >
            {p.name} {!p.alive && "☠️"}
          </span>
        )
      )}
    </div>
  );
}

function ActionButton({ onClick, children, variant = "default" }: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "danger" | "primary";
}) {
  const styles = {
    default: "border border-white/15 bg-white/[0.05] text-white/70 hover:bg-white/[0.1]",
    danger: "border-0 text-white shadow-lg",
    primary: "border border-white/15 bg-white/[0.05] text-white/70 hover:bg-white/[0.1]",
  };
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-xl px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all ${styles[variant]}`}
      style={
        variant === "danger"
          ? { background: "linear-gradient(135deg, #E11D48, #9F1239)", boxShadow: "0 0 30px rgba(225,29,72,0.2)" }
          : undefined
      }
    >
      {children}
    </motion.button>
  );
}

/* ── Privacy Wall: Narrates "close your eyes, [Role] open your eyes" ── */
function PrivacyWall({ role, onReady, soundEnabled }: { role: NightRole; onReady: () => void; soundEnabled: boolean }) {
  const labels: Record<NightRole, { emoji: string; who: string; instruction: string }> = {
    mafia: { emoji: "🔪", who: "Mafia", instruction: "Mafia, silently open your eyes and pick up the phone." },
    doctor: { emoji: "💉", who: "Doctor", instruction: "Doctor, silently open your eyes and pick up the phone." },
    detective: { emoji: "🔍", who: "Detective", instruction: "Detective, silently open your eyes and pick up the phone." },
  };
  const info = labels[role];
  const [narrating, setNarrating] = useState(true);

  useEffect(() => {
    if (!soundEnabled) {
      setTimeout(() => setNarrating(false), 0);
      return;
    }
    let cancelled = false;
    narratePrivacyWall(role, () => {
      if (!cancelled) setNarrating(false);
    });
    return () => { cancelled = true; stopSpeaking(); };
  }, [role, soundEnabled]);

  return (
    <motion.div
      key={`privacy-${role}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex w-full max-w-sm flex-col items-center gap-5 text-center"
    >
      <span className="text-4xl sm:text-5xl">🌙</span>
      <SyneHeading className="text-base text-white/90 sm:text-lg">
        Everyone, Close Your Eyes
      </SyneHeading>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 backdrop-blur-sm"
      >
        <p className="text-sm text-white/60">
          <span className="mr-1">{info.emoji}</span> {info.instruction}
        </p>
      </motion.div>

      {narrating ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-white/30"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white/30" />
          Narrating...
        </motion.div>
      ) : (
        <>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-white/25 sm:text-xs"
          >
            Only the {info.who} should be looking at the phone
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ActionButton onClick={onReady}>
              I&apos;m the {info.who} — Continue
            </ActionButton>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default function MafiaGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;

  const namesList = useMemo(() => {
    const raw = searchParams.get("names");
    return raw ? decodeURIComponent(raw).split(",") : undefined;
  }, [searchParams]);

  const parsed = useMemo(() => parseCode(code, namesList), [code, namesList]);
  const { soundEnabled, toggleSound } = useSoundEnabled();

  // Stop any ongoing narration on unmount
  useEffect(() => () => { stopSpeaking(); }, []);

  const [phase, setPhase] = useState<GamePhase>("roleReveal");
  const [players, setPlayers] = useState<MafiaPlayer[]>(() => parsed?.players ?? []);
  const [round, setRound] = useState(1);

  // Role reveal — each player taps their name to peek
  const [revealedPlayers, setRevealedPlayers] = useState<Set<number>>(new Set());
  const [peekingPlayer, setPeekingPlayer] = useState<number | null>(null);

  // Night actions
  const [mafiaTarget, setMafiaTarget] = useState<number | null>(null);
  const [doctorTarget, setDoctorTarget] = useState<number | null>(null);
  const [_detectiveTarget, setDetectiveTarget] = useState<number | null>(null);
  const [nightRole, setNightRole] = useState<NightRole>("mafia");
  const [nightSubPhase, setNightSubPhase] = useState<"privacy" | "action" | "confirm">("privacy");
  const [nightMessage, setNightMessage] = useState("");
  const [detectiveResult, setDetectiveResult] = useState<string | null>(null);

  // Day voting
  const [votedPlayer, setVotedPlayer] = useState<number | null>(null);
  const [winner, setWinner] = useState<"mafia" | "village" | null>(null);

  // Countdown for night announce
  const [countdown, setCountdown] = useState(3);
  const countdownRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const invalidCode = !parsed;
  const alivePlayers = players.filter((p) => p.alive);
  const aliveMafia = players.filter((p) => p.alive && p.role === "mafia");
  const hasDoctor = players.some((p) => p.role === "doctor" && p.alive);
  const hasDetective = players.some((p) => p.role === "detective" && p.alive);

  // ── Role Reveal: tap your name to peek ──
  const handlePeek = useCallback((id: number) => {
    setPeekingPlayer(id);
  }, []);

  const handleHidePeek = useCallback(() => {
    if (peekingPlayer !== null) {
      setRevealedPlayers((prev) => new Set(prev).add(peekingPlayer));
    }
    setPeekingPlayer(null);
  }, [peekingPlayer]);

  const allRevealed = revealedPlayers.size === players.length;

  // Track whether narration is handling the nightAnnounce→nightAction transition
  const narrationHandlingRef = useRef(false);

  const triggerNightAnnounce = useCallback(() => {
    setPhase("nightAnnounce");
    setNightRole("mafia");
    setCountdown(3);

    if (soundEnabled) {
      // Start narration immediately in the click handler (preserves user-gesture context)
      narrationHandlingRef.current = true;
      narrateNightAnnounce(() => {
        narrationHandlingRef.current = false;
        setPhase("nightAction");
        setNightSubPhase("privacy");
      });
    }
  }, [soundEnabled]);

  const startFirstNight = triggerNightAnnounce;

  // ── Night Announce: countdown fallback when sound is off ──
  useEffect(() => {
    if (phase !== "nightAnnounce") return;
    // If narration is already handling this, skip the countdown
    if (narrationHandlingRef.current) return;

    // Fallback: countdown
    setTimeout(() => setCountdown(3), 0);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          setPhase("nightAction");
          setNightSubPhase("privacy");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [phase]);

  // ── Night: determine order of roles ──
  const getNightOrder = useCallback((): NightRole[] => {
    const order: NightRole[] = ["mafia"];
    if (hasDoctor) order.push("doctor");
    if (hasDetective) order.push("detective");
    return order;
  }, [hasDoctor, hasDetective]);

  const advanceNightRole = useCallback((currentRole: NightRole) => {
    const order = getNightOrder();
    const idx = order.indexOf(currentRole);
    if (idx < order.length - 1) {
      setNightRole(order[idx + 1]);
      setNightSubPhase("privacy");
    } else {
      // All night actions done — narrate wake up
      if (soundEnabled) narrateWakeUp();
      setPhase("nightDone");
    }
  }, [getNightOrder, soundEnabled]);

  // ── Night Actions ──
  const handleNightChoice = useCallback((targetId: number) => {
    if (nightRole === "mafia") {
      setMafiaTarget(targetId);
      setNightSubPhase("confirm");
    } else if (nightRole === "doctor") {
      setDoctorTarget(targetId);
      setNightSubPhase("confirm");
    } else if (nightRole === "detective") {
      setDetectiveTarget(targetId);
      const target = players.find((p) => p.id === targetId);
      setDetectiveResult(
        target
          ? `${target.name} is ${target.role === "mafia" ? "🔪 MAFIA!" : "✅ Not Mafia"}`
          : null
      );
      setNightSubPhase("confirm");
    }
  }, [nightRole, players]);

  // Track confirm countdown
  const [confirmCountdown, setConfirmCountdown] = useState<number | null>(null);

  const confirmNightAction = useCallback(() => {
    // 3-second delay: the player puts the phone down face-down before
    // the God narrates the "close your eyes" — so nearby players
    // can't identify the role from the audio starting instantly.
    setConfirmCountdown(3);
    let count = 3;
    const tick = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(tick);
        setConfirmCountdown(null);
        if (soundEnabled) {
          narrateNightDone(nightRole);
        }
        advanceNightRole(nightRole);
      } else {
        setConfirmCountdown(count);
      }
    }, 1000);
  }, [advanceNightRole, nightRole, soundEnabled]);

  // ── Resolve Night ──
  const resolveNight = useCallback(() => {
    let msg = "";

    setPlayers((prev) => {
      const updated = prev.map((p) => ({ ...p, protected: false }));

      if (doctorTarget !== null) {
        const doc = updated.find((p) => p.id === doctorTarget);
        if (doc) doc.protected = true;
      }

      if (mafiaTarget !== null) {
        const victim = updated.find((p) => p.id === mafiaTarget);
        if (victim && !victim.protected) {
          victim.alive = false;
          msg = `☠️ ${victim.name} was eliminated during the night.`;
        } else if (victim?.protected) {
          msg = `💉 Someone was saved! No one was eliminated.`;
        }
      }

      if (!msg) msg = "☀️ The town wakes up... everyone survived the night!";

      const gameWinner = checkWinner(updated);
      if (gameWinner) {
        setWinner(gameWinner);
        setNightMessage(msg);
        setTimeout(() => setPhase("gameOver"), 100);
      } else {
        setNightMessage(msg);
        setPhase("nightResult");
      }

      return updated;
    });

    // Reset night targets
    setMafiaTarget(null);
    setDoctorTarget(null);
    setDetectiveTarget(null);
    setDetectiveResult(null);
  }, [mafiaTarget, doctorTarget]);

  // ── Day / Voting ──
  const startDay = useCallback(() => {
    setPhase("day");
  }, []);

  const startVoting = useCallback(() => {
    setPhase("voting");
  }, []);

  const handleVote = useCallback((targetId: number) => {
    setVotedPlayer(targetId);

    setPlayers((prev) => {
      const updated = prev.map((p) =>
        p.id === targetId ? { ...p, alive: false } : p
      );

      const w = checkWinner(updated);
      if (w) {
        setWinner(w);
        setTimeout(() => setPhase("gameOver"), 100);
      } else {
        setPhase("voteResult");
      }

      return updated;
    });
  }, []);

  const startNextNight = useCallback(() => {
    setPhase("nightAnnounce");
    setNightRole("mafia");
    setNightSubPhase("privacy");
    setVotedPlayer(null);
    setNightMessage("");
    setRound((r) => r + 1);

    if (soundEnabled) {
      narrationHandlingRef.current = true;
      narrateNightAnnounce(() => {
        narrationHandlingRef.current = false;
        setPhase("nightAction");
        setNightSubPhase("privacy");
      });
    }
  }, [soundEnabled]);

  // ── Invalid code ──
  if (invalidCode) {
    return (
      <main className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-4">
        <SyneHeading className="text-2xl text-white/80">Invalid Game Code</SyneHeading>
        <p className="text-xs text-white/40">This game code doesn&apos;t exist or has expired.</p>
        <Link
          href="/mafia"
          className="rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.1]"
        >
          Create New Game
        </Link>
      </main>
    );
  }

  // ── Peeking player data ──
  const peekPlayer = peekingPlayer !== null ? players.find((p) => p.id === peekingPlayer) : null;

  const roleColor = (role: MafiaRole) =>
    role === "mafia" ? "#EF4444" : role === "doctor" ? "#22C55E" : role === "detective" ? "#3B82F6" : "#A78BFA";

  return (
    <main className="relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden" style={{ overscrollBehavior: "none" }}>
      {/* Ambient */}
      <div
        className="pointer-events-none fixed inset-0 transition-all duration-1000"
        style={{
          background:
            phase === "nightAnnounce" || phase === "nightAction" || phase === "nightDone"
              ? "radial-gradient(ellipse at 50% 30%, rgba(15,15,60,0.12) 0%, transparent 70%)"
              : phase === "roleReveal"
              ? "radial-gradient(ellipse at 50% 30%, rgba(30,30,80,0.08) 0%, transparent 70%)"
              : "radial-gradient(ellipse at 50% 30%, rgba(225,29,72,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-3 py-2 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/60 sm:text-xs sm:tracking-[0.3em]"
        >
          ← The Arena
        </Link>

        <h1
          className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50 sm:text-sm sm:tracking-[0.35em]"
          style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
        >
          Mafia{round > 0 ? ` · Round ${round}` : ""}
        </h1>

        <div className="flex items-center gap-2 sm:gap-3">
          <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
          <Link
            href="/mafia"
            className="rounded-lg border border-white/8 bg-white/[0.02] px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 transition-colors hover:border-white/15 hover:text-white/60 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
          >
            <span className="hidden sm:inline">New Game</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-4 sm:px-6">
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════════
              ROLE REVEAL — Phone in center, each player
              taps THEIR name to privately peek at role,
              then taps "Hide" and puts phone back down.
              ═══════════════════════════════════════════ */}
          {phase === "roleReveal" && !peekPlayer && (
            <motion.div
              key="roleReveal-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex w-full max-w-md flex-col items-center gap-4 text-center"
            >
              <span className="text-3xl">🤫</span>
              <SyneHeading className="text-base text-white/90 sm:text-lg">
                Tap Your Name to Peek
              </SyneHeading>
              <p className="text-[10px] text-white/30 sm:text-xs">
                Place the phone face-up. One at a time, tap your name, memorize your role, then tap &quot;Hide&quot;.
              </p>

              <div className="mt-2 grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
                {players.map((p) => {
                  const done = revealedPlayers.has(p.id);
                  return (
                    <motion.button
                      key={p.id}
                      onClick={() => !done && handlePeek(p.id)}
                      whileHover={!done ? { scale: 1.05 } : undefined}
                      whileTap={!done ? { scale: 0.95 } : undefined}
                      disabled={done}
                      className={`rounded-xl border px-3 py-3 text-xs font-bold transition-all sm:text-sm ${
                        done
                          ? "border-green-500/20 bg-green-500/5 text-green-400/60"
                          : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      {done ? `✓ ${p.name}` : p.name}
                    </motion.button>
                  );
                })}
              </div>

              {allRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2"
                >
                  <ActionButton onClick={startFirstNight} variant="danger">
                    🌙 Night Falls...
                  </ActionButton>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══ ROLE PEEK — Full-screen overlay, only the peeking player sees ═══ */}
          {phase === "roleReveal" && peekPlayer && (
            <motion.div
              key={`peek-${peekPlayer.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
              onClick={handleHidePeek}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm sm:p-10"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs uppercase tracking-widest text-white/30">{peekPlayer.name}, your role is...</p>
                <span className="text-5xl sm:text-6xl">{roleEmojis[peekPlayer.role]}</span>
                <SyneHeading className="text-xl sm:text-2xl" style={{ color: roleColor(peekPlayer.role) }}>
                  {peekPlayer.role.toUpperCase()}
                </SyneHeading>
                <p className="max-w-xs text-xs text-white/40 sm:text-sm">
                  {roleDescriptions[peekPlayer.role]}
                </p>
                {peekPlayer.role === "mafia" && aliveMafia.length > 1 && (
                  <p className="text-xs text-red-400/60">
                    Fellow Mafia: {aliveMafia.filter((m) => m.id !== peekPlayer.id).map((m) => m.name).join(", ")}
                  </p>
                )}
                <motion.button
                  onClick={handleHidePeek}
                  whileTap={{ scale: 0.95 }}
                  className="mt-3 rounded-xl border border-white/15 bg-white/[0.05] px-8 py-3 text-sm font-bold uppercase tracking-widest text-white/70 transition-all hover:bg-white/[0.1]"
                >
                  🙈 Hide & Put Phone Down
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════
              NIGHT ANNOUNCE — Everyone sees this.
              "Close your eyes" countdown.
              ═══════════════════════════════════════════ */}
          {phase === "nightAnnounce" && (
            <motion.div
              key="nightAnnounce"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full max-w-sm flex-col items-center gap-5 text-center"
            >
              <span className="text-5xl">🌙</span>
              <SyneHeading className="text-xl text-white/90 sm:text-2xl">
                Night Falls
              </SyneHeading>
              <p className="text-sm text-white/50">Everyone, close your eyes...</p>
              {soundEnabled ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-white/30"
                >
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white/30" />
                  Narrating...
                </motion.div>
              ) : (
                <motion.span
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-black text-white/20"
                >
                  {countdown}
                </motion.span>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════
              NIGHT ACTION — Privacy wall + action picker.
              Only the active role should be looking.
              ═══════════════════════════════════════════ */}
          {phase === "nightAction" && nightSubPhase === "privacy" && (
            <PrivacyWall
              key={`privacy-${nightRole}`}
              role={nightRole}
              soundEnabled={soundEnabled}
              onReady={() => {
                setNightSubPhase("action");
              }}
            />
          )}

          {phase === "nightAction" && nightSubPhase === "action" && (
            <motion.div
              key={`action-${nightRole}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex w-full max-w-md flex-col items-center gap-4 text-center"
            >
              <span className="text-3xl">
                {nightRole === "mafia" ? "🔪" : nightRole === "doctor" ? "💉" : "🔍"}
              </span>
              <SyneHeading className="text-base text-white/90 sm:text-lg">
                {nightRole === "mafia" && "Choose Your Victim"}
                {nightRole === "doctor" && "Choose Who to Protect"}
                {nightRole === "detective" && "Choose Who to Investigate"}
              </SyneHeading>

              <div className="mt-2 grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
                {alivePlayers
                  .filter((p) => nightRole === "mafia" ? p.role !== "mafia" : true)
                  .map((p) => (
                    <motion.button
                      key={p.id}
                      onClick={() => handleNightChoice(p.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs font-bold text-white/70 transition-all hover:border-white/20 hover:bg-white/[0.06] sm:text-sm"
                    >
                      {p.name}
                    </motion.button>
                  ))}
              </div>
            </motion.div>
          )}

          {phase === "nightAction" && nightSubPhase === "confirm" && (
            <motion.div
              key={`confirm-${nightRole}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full max-w-sm flex-col items-center gap-4 text-center"
            >
              {nightRole === "detective" && detectiveResult && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-5 py-3 text-sm text-blue-300"
                >
                  🔍 {detectiveResult}
                </motion.div>
              )}

              <p className="text-xs text-white/40 sm:text-sm">
                {nightRole === "mafia" && "Target selected."}
                {nightRole === "doctor" && "Protection set."}
                {nightRole === "detective" && "Investigation complete."}
              </p>

              <p className="text-[10px] text-white/25">
                Put the phone face-down. The narrator will speak in a moment.
              </p>

              {confirmCountdown !== null ? (
                <motion.div
                  key={confirmCountdown}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-3xl font-black text-white/30">{confirmCountdown}</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/20">Narrating soon…</span>
                </motion.div>
              ) : (
                <ActionButton onClick={confirmNightAction}>
                  ✓ Done — Put Phone Down
                </ActionButton>
              )}
            </motion.div>
          )}

          {/* ═══ NIGHT DONE — "Everyone open your eyes" ═══ */}
          {phase === "nightDone" && (
            <motion.div
              key="nightDone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full max-w-sm flex-col items-center gap-5 text-center"
            >
              <span className="text-4xl">☀️</span>
              <SyneHeading className="text-lg text-white/90 sm:text-xl">
                Everyone, Open Your Eyes
              </SyneHeading>
              <p className="text-xs text-white/40">The night is over. Let&apos;s see what happened...</p>
              <ActionButton onClick={resolveNight}>
                ☀️ Reveal Night Results
              </ActionButton>
            </motion.div>
          )}

          {/* ═══ NIGHT RESULT — Public ═══ */}
          {phase === "nightResult" && (
            <motion.div
              key="nightResult"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full max-w-sm flex-col items-center gap-4 text-center"
            >
              <span className="text-3xl">☀️</span>
              <SyneHeading className="text-base text-white/90 sm:text-lg">
                Morning Report
              </SyneHeading>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-white/60"
              >
                {nightMessage}
              </motion.p>
              <PlayerChips players={players} />
              <ActionButton onClick={startDay}>
                Start Discussion 💬
              </ActionButton>
            </motion.div>
          )}

          {/* ═══ DAY / DISCUSSION — Public ═══ */}
          {phase === "day" && (
            <motion.div
              key="day"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex w-full max-w-sm flex-col items-center gap-4 text-center"
            >
              <span className="text-3xl">💬</span>
              <SyneHeading className="text-base text-white/90 sm:text-lg">
                Town Discussion
              </SyneHeading>
              <p className="text-xs text-white/40">
                Discuss who you think the Mafia is. When ready, vote!
              </p>
              <PlayerChips players={players} />
              <ActionButton onClick={startVoting} variant="danger">
                ⚖️ Vote Now
              </ActionButton>
            </motion.div>
          )}

          {/* ═══ VOTING — Public ═══ */}
          {phase === "voting" && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex w-full max-w-md flex-col items-center gap-4 text-center"
            >
              <span className="text-3xl">⚖️</span>
              <SyneHeading className="text-base text-white/90 sm:text-lg">
                Vote to Eliminate
              </SyneHeading>
              <p className="text-[10px] text-white/30 sm:text-xs">
                The group decides together. Tap the player to eliminate.
              </p>
              <div className="mt-2 grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
                {alivePlayers.map((p) => (
                  <motion.button
                    key={p.id}
                    onClick={() => handleVote(p.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-xl border border-red-500/15 bg-red-500/5 px-3 py-3 text-xs font-bold text-white/70 transition-all hover:border-red-500/30 hover:bg-red-500/10 sm:text-sm"
                  >
                    {p.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ VOTE RESULT — Public ═══ */}
          {phase === "voteResult" && (
            <motion.div
              key="voteResult"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full max-w-sm flex-col items-center gap-4 text-center"
            >
              <span className="text-3xl">⚖️</span>
              {votedPlayer !== null && (() => {
                const vp = players.find((p) => p.id === votedPlayer);
                return vp ? (
                  <>
                    <SyneHeading className="text-base text-white/90 sm:text-lg">
                      {vp.name} was eliminated
                    </SyneHeading>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-xs text-white/40"
                    >
                      The town has spoken.
                    </motion.p>
                  </>
                ) : null;
              })()}
              <ActionButton onClick={startNextNight}>
                🌙 Night Falls Again
              </ActionButton>
            </motion.div>
          )}

          {/* ═══ GAME OVER — Public overlay ═══ */}
          {phase === "gameOver" && winner && (
            <motion.div
              key="gameOver"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="mx-4 flex max-w-xs flex-col items-center gap-2 rounded-2xl border p-3 text-center backdrop-blur-xl sm:max-w-sm sm:gap-3 sm:rounded-3xl sm:p-8"
                style={{
                  borderColor: winner === "village" ? "rgba(34,197,94,0.4)" : "rgba(225,29,72,0.4)",
                  background: winner === "village" ? "rgba(34,197,94,0.12)" : "rgba(225,29,72,0.12)",
                  boxShadow: winner === "village" ? "0 0 40px rgba(34,197,94,0.2)" : "0 0 40px rgba(225,29,72,0.2)",
                }}
              >
                <span className="text-3xl sm:text-4xl">
                  {winner === "village" ? "🏘️" : "🔪"}
                </span>
                <SyneHeading
                  className="text-base sm:text-xl sm:tracking-[0.3em]"
                  style={{ color: winner === "village" ? "#22C55E" : "#EF4444" }}
                >
                  {winner === "village" ? "Village Wins!" : "Mafia Wins!"}
                </SyneHeading>
                <p className="text-[10px] text-white/40 sm:text-xs">
                  {winner === "village"
                    ? "All Mafia members have been eliminated!"
                    : "The Mafia has taken over the town!"}
                </p>

                {/* Reveal all roles */}
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {players.map((p) => (
                    <span
                      key={p.id}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] sm:text-[10px]"
                      style={{ color: roleColor(p.role) }}
                    >
                      {roleEmojis[p.role]} {p.name}
                    </span>
                  ))}
                </div>

                <Link
                  href="/mafia"
                  className="mt-1 rounded-lg border border-white/20 bg-white/[0.08] px-5 py-2 text-xs font-bold uppercase tracking-widest text-white/80 transition-all hover:bg-white/[0.15] hover:text-white sm:mt-2 sm:rounded-xl sm:px-8 sm:py-2.5 sm:text-sm"
                >
                  Play Again
                </Link>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
