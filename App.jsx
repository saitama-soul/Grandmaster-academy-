import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
   GLOBAL CSS – All animations and styles for a premium look
   ═══════════════════════════════════════════════════════════════════════════════ */
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#2a2438;border-radius:4px}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes introK{0%{opacity:0;transform:translateY(50px)scale(.5)}65%{transform:translateY(-5px)scale(1.06)}100%{opacity:1;transform:none}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes checkFlash{0%,100%{box-shadow:inset 0 0 0 0 #f44336}50%{box-shadow:inset 0 0 24px #f44336,0 0 12px #f4433655}}
@keyframes drop{0%{transform:scale(.7)translateY(-10px);opacity:.5}65%{transform:scale(1.07)translateY(2px)}100%{transform:none;opacity:1}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideRight{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
@keyframes winPulse{0%,100%{box-shadow:0 0 14px rgba(200,168,75,.2)}50%{box-shadow:0 0 40px rgba(200,168,75,.55)}}
@keyframes clockLow{0%,100%{color:#f44336}50%{color:#ff8080}}
@keyframes boardIn{0%{opacity:0;transform:perspective(500px) rotateX(14deg) scale(.9)}100%{opacity:1;transform:none}}
`;

/* ═══════════════════════════════════════════════════════════════════════════════
   CHESS ENGINE – Complete move generation and evaluation
   ═══════════════════════════════════════════════════════════════════════════════ */

const cl = p => p?.[0] ?? null;
const tp = p => p?.[1] ?? null;
const opp = c => (c === "w" ? "b" : "w");
const cpB = b => b.map(r => [...r]);
const IB = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

const PVAL = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

const PST = {
  P: [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
  N: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
  B: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
  R: [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
  Q: [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
  K: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]],
};

const INIT_BOARD = () => [
  ["bR","bN","bB","bQ","bK","bB","bN","bR"],
  ["bP","bP","bP","bP","bP","bP","bP","bP"],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ["wP","wP","wP","wP","wP","wP","wP","wP"],
  ["wR","wN","wB","wQ","wK","wB","wN","wR"]
];
const INIT_CAST = () => ({ wK: true, wQ: true, bK: true, bQ: true });

function atkMoves(board, r, c) {
  const p = board[r][c];
  if (!p) return [];
  const c0 = cl(p), t = tp(p);
  const moves = [];
  const add = (tr, tc) => {
    if (!IB(tr, tc)) return false;
    const x = board[tr][tc];
    if (x && cl(x) === c0) return false;
    moves.push([tr, tc]);
    return !x;
  };
  if (t === "P") {
    const d = c0 === "w" ? -1 : 1;
    if (IB(r + d, c - 1)) moves.push([r + d, c - 1]);
    if (IB(r + d, c + 1)) moves.push([r + d, c + 1]);
  } else if (t === "N") {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => add(r+dr, c+dc));
  } else if (t === "B") {
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => {
      let nr = r+dr, nc = c+dc;
      while (IB(nr, nc)) {
        if (!add(nr, nc)) break;
        nr += dr; nc += dc;
      }
    });
  } else if (t === "R") {
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => {
      let nr = r+dr, nc = c+dc;
      while (IB(nr, nc)) {
        if (!add(nr, nc)) break;
        nr += dr; nc += dc;
      }
    });
  } else if (t === "Q") {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => {
      let nr = r+dr, nc = c+dc;
      while (IB(nr, nc)) {
        if (!add(nr, nc)) break;
        nr += dr; nc += dc;
      }
    });
  } else if (t === "K") {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => add(r+dr, c+dc));
  }
  return moves;
}

function isAttacked(board, r, c, byColor) {
  for (let rr = 0; rr < 8; rr++)
    for (let cc = 0; cc < 8; cc++) {
      const p = board[rr][cc];
      if (p && cl(p) === byColor && atkMoves(board, rr, cc).some(([mr, mc]) => mr === r && mc === c)) return true;
    }
  return false;
}

function pseudoMoves(board, r, c, ep, castling) {
  const p = board[r][c];
  if (!p) return [];
  const c0 = cl(p), t = tp(p);
  const moves = [];
  const add = (tr, tc) => {
    if (!IB(tr, tc)) return false;
    const x = board[tr][tc];
    if (x && cl(x) === c0) return false;
    moves.push([tr, tc]);
    return !x;
  };
  if (t === "P") {
    const d = c0 === "w" ? -1 : 1;
    const sr = c0 === "w" ? 6 : 1;
    if (IB(r + d, c) && !board[r + d][c]) {
      moves.push([r + d, c]);
      if (r === sr && !board[r + 2*d][c]) moves.push([r + 2*d, c]);
    }
    for (const dc of [-1, 1]) {
      if (IB(r + d, c + dc)) {
        const x = board[r + d][c + dc];
        if (x && cl(x) !== c0) moves.push([r + d, c + dc]);
        if (ep && ep[0] === r + d && ep[1] === c + dc) moves.push([r + d, c + dc]);
      }
    }
  } else if (t === "N") {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => add(r+dr, c+dc));
  } else if (t === "B") {
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => {
      let nr = r+dr, nc = c+dc;
      while (IB(nr, nc)) {
        if (!add(nr, nc)) break;
        nr += dr; nc += dc;
      }
    });
  } else if (t === "R") {
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => {
      let nr = r+dr, nc = c+dc;
      while (IB(nr, nc)) {
        if (!add(nr, nc)) break;
        nr += dr; nc += dc;
      }
    });
  } else if (t === "Q") {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => {
      let nr = r+dr, nc = c+dc;
      while (IB(nr, nc)) {
        if (!add(nr, nc)) break;
        nr += dr; nc += dc;
      }
    });
  } else if (t === "K") {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => add(r+dr, c+dc));
    const row = c0 === "w" ? 7 : 0;
    if (r === row && c === 4) {
      if (castling[c0 + "K"] && !board[row][5] && !board[row][6] &&
          !isAttacked(board, row, 4, opp(c0)) &&
          !isAttacked(board, row, 5, opp(c0)) &&
          !isAttacked(board, row, 6, opp(c0))) moves.push([row, 6]);
      if (castling[c0 + "Q"] && !board[row][3] && !board[row][2] && !board[row][1] &&
          !isAttacked(board, row, 4, opp(c0)) &&
          !isAttacked(board, row, 3, opp(c0)) &&
          !isAttacked(board, row, 2, opp(c0))) moves.push([row, 2]);
    }
  }
  return moves;
}

function findKing(b, c0) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c] === c0 + "K") return [r, c];
  return [0, 0];
}

function inCheck(b, c0) {
  const [kr, kc] = findKing(b, c0);
  return isAttacked(b, kr, kc, opp(c0));
}

function applyMove(board, fr, fc, tr, tc, ep, castling, promo = null) {
  const nb = cpB(board);
  const p = nb[fr][fc];
  const c0 = cl(p);
  const t = tp(p);
  const nc = { ...castling };
  let nep = null;
  const captured = nb[tr][tc];
  nb[tr][tc] = p;
  nb[fr][fc] = null;

  if (t === "P" && ep && tr === ep[0] && tc === ep[1]) {
    nb[c0 === "w" ? tr + 1 : tr - 1][tc] = null;
  }
  if (t === "P" && Math.abs(tr - fr) === 2) {
    nep = [(fr + tr) / 2, tc];
  }
  if (t === "K") {
    if (tc - fc === 2) {
      nb[fr][5] = nb[fr][7];
      nb[fr][7] = null;
    }
    if (fc - tc === 2) {
      nb[fr][3] = nb[fr][0];
      nb[fr][0] = null;
    }
    nc[c0 + "K"] = false;
    nc[c0 + "Q"] = false;
  }
  if (t === "R") {
    if (fr === 7 && fc === 7) nc.wK = false;
    if (fr === 7 && fc === 0) nc.wQ = false;
    if (fr === 0 && fc === 7) nc.bK = false;
    if (fr === 0 && fc === 0) nc.bQ = false;
  }
  if (tr === 7 && tc === 7) nc.wK = false;
  if (tr === 7 && tc === 0) nc.wQ = false;
  if (tr === 0 && tc === 7) nc.bK = false;
  if (tr === 0 && tc === 0) nc.bQ = false;
  if (t === "P" && (tr === 0 || tr === 7)) {
    nb[tr][tc] = c0 + (promo || "Q");
  }
  return { board: nb, ep: nep, castling: nc, captured };
}

function legalMovesFor(board, r, c, ep, castling) {
  const p = board[r][c];
  if (!p) return [];
  const c0 = cl(p);
  const res = [];
  for (const [tr, tc] of pseudoMoves(board, r, c, ep, castling)) {
    const isPromo = tp(p) === "P" && (tr === 0 || tr === 7);
    for (const promo of (isPromo ? ["Q", "R", "B", "N"] : [null])) {
      const { board: nb } = applyMove(board, r, c, tr, tc, ep, castling, promo);
      if (!inCheck(nb, c0)) res.push([r, c, tr, tc, promo]);
    }
  }
  return res;
}

function allLegal(board, c0, ep, castling) {
  const moves = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] && cl(board[r][c]) === c0)
        legalMovesFor(board, r, c, ep, castling).forEach(m => moves.push(m));
  return moves;
}

/* ─── Enhanced Evaluation with many terms ─── */
function evalFull(board) {
  let sc = 0;
  let wPawns = Array(8).fill(0), bPawns = Array(8).fill(0);
  let wMob = 0, bMob = 0;
  let wBishops = 0, bBishops = 0;
  let wKnights = 0, bKnights = 0;
  let wRooks = 0, bRooks = 0;

  // Material + PST
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const c0 = cl(p), t = tp(p);
      const pr = c0 === "w" ? r : 7 - r;
      sc += (c0 === "w" ? 1 : -1) * (PVAL[t] + (PST[t]?.[pr]?.[c] ?? 0));
      if (t === "P") c0 === "w" ? wPawns[c]++ : bPawns[c]++;
      else if (t === "B") c0 === "w" ? wBishops++ : bBishops++;
      else if (t === "N") c0 === "w" ? wKnights++ : bKnights++;
      else if (t === "R") c0 === "w" ? wRooks++ : bRooks++;
    }
  }

  // Pawn structure
  for (let c = 0; c < 8; c++) {
    if (wPawns[c] > 1) sc -= 20 * (wPawns[c] - 1);
    if (bPawns[c] > 1) sc += 20 * (bPawns[c] - 1);
    const wIso = wPawns[c] > 0 && (c === 0 || wPawns[c-1] === 0) && (c === 7 || wPawns[c+1] === 0);
    const bIso = bPawns[c] > 0 && (c === 0 || bPawns[c-1] === 0) && (c === 7 || bPawns[c+1] === 0);
    if (wIso) sc -= 15;
    if (bIso) sc += 15;
  }

  // Rook on open file & 7th rank
  for (let c = 0; c < 8; c++) {
    const open = wPawns[c] === 0 && bPawns[c] === 0;
    const semiW = wPawns[c] === 0 && bPawns[c] > 0;
    const semiB = bPawns[c] === 0 && wPawns[c] > 0;
    for (let r = 0; r < 8; r++) {
      if (board[r][c] === "wR") {
        sc += open ? 25 : semiW ? 12 : 0;
        if (r === 1) sc += 15; // rook on 7th (white's perspective, rank 2 is index 1)
      }
      if (board[r][c] === "bR") {
        sc -= open ? 25 : semiB ? 12 : 0;
        if (r === 6) sc -= 15; // rook on 7th for black
      }
    }
  }

  // Bishop pair
  if (wBishops >= 2) sc += 40;
  if (bBishops >= 2) sc -= 40;

  // Knight outposts
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || tp(p) !== "N") continue;
      const c0 = cl(p);
      const isOutpostW = c0 === "w" && r >= 4 && r <= 6 && !isAttacked(board, r, c, "b") &&
                         r > 0 && board[r-1][c] && tp(board[r-1][c]) === "P" && cl(board[r-1][c]) === "w";
      const isOutpostB = c0 === "b" && r <= 3 && r >= 1 && !isAttacked(board, r, c, "w") &&
                         r < 7 && board[r+1][c] && tp(board[r+1][c]) === "P" && cl(board[r+1][c]) === "b";
      if (isOutpostW) sc += 30;
      if (isOutpostB) sc -= 30;
    }
  }

  // Mobility
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const t = tp(p);
      if (t === "K" || t === "P") continue;
      const moves = atkMoves(board, r, c).length;
      if (cl(p) === "w") wMob += moves;
      else bMob += moves;
    }
  }
  sc += (wMob - bMob) * 2;

  // King safety
  const wKing = findKing(board, "w");
  const bKing = findKing(board, "b");
  let wKingSafety = 0, bKingSafety = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = wKing[0] + dr, nc = wKing[1] + dc;
      if (IB(nr, nc) && board[nr][nc] && cl(board[nr][nc]) === "b") wKingSafety -= 15;
      const br = bKing[0] + dr, bc = bKing[1] + dc;
      if (IB(br, bc) && board[br][bc] && cl(board[br][bc]) === "w") bKingSafety += 15;
    }
  }
  sc += wKingSafety + bKingSafety;

  // Passed pawns
  for (let c = 0; c < 8; c++) {
    let wPassed = true, bPassed = true;
    for (let i = 0; i < 8; i++) {
      if (bPawns[i] && Math.abs(i - c) <= 1) wPassed = false;
      if (wPawns[i] && Math.abs(i - c) <= 1) bPassed = false;
    }
    for (let r = 0; r < 8; r++) {
      if (board[r][c] === "wP" && wPassed) sc += (7 - r) * 8;
      if (board[r][c] === "bP" && bPassed) sc -= r * 8;
    }
  }

  return sc;
}

/* ─── Move ordering helpers (history, killers) ─── */
let killerMoves = Array(64).fill(null).map(() => [null, null]);
let historyTable = Array(64).fill(0).map(() => Array(64).fill(0));

function clearTables() {
  killerMoves = Array(64).fill(null).map(() => [null, null]);
  historyTable = Array(64).fill(0).map(() => Array(64).fill(0));
}

function orderMoves(board, moves, depth, ply, ttMove = null) {
  return moves.slice().sort((a, b) => {
    // MVV-LVA for captures
    const aCap = board[a[2]][a[3]];
    const bCap = board[b[2]][b[3]];
    const aVal = aCap ? PVAL[tp(aCap)] : 0;
    const bVal = bCap ? PVAL[tp(bCap)] : 0;
    const aAtt = PVAL[tp(board[a[0]][a[1]])] || 0;
    const bAtt = PVAL[tp(board[b[0]][b[1]])] || 0;
    let scoreA = (aVal - aAtt / 100) * 10000;
    let scoreB = (bVal - bAtt / 100) * 10000;

    // TT move
    if (ttMove && a[0] === ttMove[0] && a[1] === ttMove[1] && a[2] === ttMove[2] && a[3] === ttMove[3]) scoreA += 200000;
    if (ttMove && b[0] === ttMove[0] && b[1] === ttMove[1] && b[2] === ttMove[2] && b[3] === ttMove[3]) scoreB += 200000;

    // Killer moves
    const fromToA = a[0] * 8 + a[1];
    const fromToB = b[0] * 8 + b[1];
    const killers = killerMoves[ply];
    if (killers[0] === fromToA) scoreA += 1000;
    if (killers[1] === fromToA) scoreA += 500;
    if (killers[0] === fromToB) scoreB += 1000;
    if (killers[1] === fromToB) scoreB += 500;

    // History
    scoreA += historyTable[fromToA]?.[a[2] * 8 + a[3]] ?? 0;
    scoreB += historyTable[fromToB]?.[b[2] * 8 + b[3]] ?? 0;

    return scoreB - scoreA;
  });
}

/* ─── Quiescence search (captures only) ─── */
function quiesce(board, alpha, beta, isMax, ep, castling, depth = 0) {
  const stand = evalFull(board);
  if (isMax) {
    if (stand >= beta) return beta;
    alpha = Math.max(alpha, stand);
  } else {
    if (stand <= alpha) return alpha;
    beta = Math.min(beta, stand);
  }
  if (depth >= 4) return isMax ? alpha : beta;

  const c0 = isMax ? "w" : "b";
  const caps = allLegal(board, c0, ep, castling).filter(m => board[m[2]][m[3]] || (tp(board[m[0]][m[1]]) === "P" && ep && m[2] === ep[0] && m[3] === ep[1]));
  const ordered = orderMoves(board, caps, 0, depth);
  for (const [fr, fc, tr, tc, promo] of ordered) {
    const { board: nb, ep: ne, castling: nc } = applyMove(board, fr, fc, tr, tc, ep, castling, promo);
    const score = quiesce(nb, alpha, beta, !isMax, ne, nc, depth + 1);
    if (isMax) {
      alpha = Math.max(alpha, score);
      if (alpha >= beta) return beta;
    } else {
      beta = Math.min(beta, score);
      if (beta <= alpha) return alpha;
    }
  }
  return isMax ? alpha : beta;
}

/* ─── Transposition Table ─── */
const TT_SIZE = 2 ** 20;
let tt = new Array(TT_SIZE).fill(null);

function getTTKey(board, turn, castling, ep) {
  return board.flat().map(p => p || ".").join("") + turn +
         (castling.wK ? "K" : "") + (castling.wQ ? "Q" : "") +
         (castling.bK ? "k" : "") + (castling.bQ ? "q" : "") +
         (ep ? `${ep[0]},${ep[1]}` : "-");
}

function storeTT(key, depth, score, flag, move) {
  const idx = Math.abs(key.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % TT_SIZE;
  tt[idx] = { key, depth, score, flag, move };
}

function probeTT(key, depth, alpha, beta) {
  const idx = Math.abs(key.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % TT_SIZE;
  const entry = tt[idx];
  if (entry && entry.key === key && entry.depth >= depth) {
    if (entry.flag === 0) return entry.score; // exact
    if (entry.flag === 1 && entry.score <= alpha) return alpha; // lower bound
    if (entry.flag === 2 && entry.score >= beta) return beta;   // upper bound
  }
  return null;
}

/* ─── Negamax with TT and killer/history ─── */
let nodesSearched = 0;
let startTime = 0;
let maxTime = 0;

function negamax(board, depth, alpha, beta, c0, ep, castling, ply = 0) {
  if (depth === 0) return quiesce(board, alpha, beta, c0 === "w", ep, castling);

  // Time check
  if (Date.now() - startTime > maxTime) return 0;

  const key = getTTKey(board, c0, castling, ep);
  const ttEntry = probeTT(key, depth, alpha, beta);
  if (ttEntry !== null) return ttEntry;

  const ms = allLegal(board, c0, ep, castling);
  if (!ms.length) return inCheck(board, c0) ? -50000 + depth * 100 : 0;

  const ordered = orderMoves(board, ms, depth, ply);
  let best = -Infinity;
  let bestMove = null;
  let flag = 1; // lower bound

  for (const [fr, fc, tr, tc, promo] of ordered) {
    const { board: nb, ep: ne, castling: nc } = applyMove(board, fr, fc, tr, tc, ep, castling, promo);
    const score = -negamax(nb, depth - 1, -beta, -alpha, opp(c0), ne, nc, ply + 1);
    if (score > best) {
      best = score;
      bestMove = [fr, fc, tr, tc, promo];
      if (score > alpha) {
        alpha = score;
        if (alpha >= beta) {
          flag = 2; // upper bound
          // Update killer & history
          if (!board[tr][tc]) {
            const fromTo = fr * 8 + fc;
            const to = tr * 8 + tc;
            const killers = killerMoves[ply];
            if (killers[0] !== fromTo) {
              killers[1] = killers[0];
              killers[0] = fromTo;
            }
            historyTable[fromTo][to] += depth * depth;
          }
          break;
        }
      }
    }
  }

  storeTT(key, depth, best, flag, bestMove);
  return best;
}

/* ─── Iterative deepening with time management ─── */
function iterativeDeepening(board, c0, ep, castling, maxDepth, timeMs) {
  nodesSearched = 0;
  startTime = Date.now();
  maxTime = timeMs;
  let bestMove = null;

  for (let d = 1; d <= maxDepth; d++) {
    negamax(board, d, -Infinity, Infinity, c0, ep, castling);
    const key = getTTKey(board, c0, castling, ep);
    const idx = Math.abs(key.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % TT_SIZE;
    const entry = tt[idx];
    if (entry && entry.key === key && entry.move) {
      bestMove = entry.move;
    }
    if (Date.now() - startTime > maxTime * 0.9) break;
  }
  return bestMove;
}

/* ─── Opening Book (small but functional) ─── */
const openingBook = {
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -": ["e2e4", "d2d4", "g1f3", "c2c4"],
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3": ["e7e5", "c7c5", "e7e6"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6": ["d2d4", "g1f3", "b1c3"],
};

function boardToFEN(board, turn, castling, ep) {
  let fen = "";
  for (let r = 0; r < 8; r++) {
    let empty = 0;
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) { empty++; continue; }
      if (empty) { fen += empty; empty = 0; }
      const piece = p[1];
      fen += p[0] === "w" ? piece.toUpperCase() : piece.toLowerCase();
    }
    if (empty) fen += empty;
    if (r < 7) fen += "/";
  }
  fen += " " + (turn === "w" ? "w" : "b");
  fen += " " + (castling.wK ? "K" : "") + (castling.wQ ? "Q" : "") + (castling.bK ? "k" : "") + (castling.bQ ? "q" : "") + (castling.wK || castling.wQ || castling.bK || castling.bQ ? "" : "-");
  fen += " " + (ep ? String.fromCharCode(97 + ep[1]) + (8 - ep[0]) : "-");
  fen += " 0 1";
  return fen;
}

function getBookMove(board, turn, ep, castling) {
  const fen = boardToFEN(board, turn, castling, ep);
  if (openingBook[fen]) {
    const moves = openingBook[fen];
    const moveStr = moves[Math.floor(Math.random() * moves.length)];
    const fromFile = moveStr.charCodeAt(0) - 97;
    const fromRank = 8 - parseInt(moveStr[1]);
    const toFile = moveStr.charCodeAt(2) - 97;
    const toRank = 8 - parseInt(moveStr[3]);
    const legal = allLegal(board, turn, ep, castling).find(m => m[0] === fromRank && m[1] === fromFile && m[2] === toRank && m[3] === toFile);
    if (legal) return legal;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   BOT SYSTEM – 25 bots with increasing strength
   ═══════════════════════════════════════════════════════════════════════════════ */
const BOTS = [
  { id: 0, name: "Random", elo: 100, depth: 1, blunder: 0.99, subOpt: 0, em: "🎲", clr: "#ef9a9a", tier: "Beginner", desc: "Completely random moves" },
  { id: 1, name: "Novice", elo: 200, depth: 1, blunder: 0.95, subOpt: 0, em: "🐣", clr: "#ef9a9a", tier: "Beginner", desc: "Almost random, occasionally stumbles" },
  { id: 2, name: "Learner", elo: 300, depth: 1, blunder: 0.85, subOpt: 0.05, em: "🐣", clr: "#ef9a9a", tier: "Beginner", desc: "Drops pieces often" },
  { id: 3, name: "Beginner", elo: 400, depth: 1, blunder: 0.75, subOpt: 0.1, em: "🐤", clr: "#FFCC80", tier: "Novice", desc: "Sees obvious captures" },
  { id: 4, name: "Rookie", elo: 500, depth: 1, blunder: 0.65, subOpt: 0.12, em: "🐤", clr: "#FFCC80", tier: "Novice", desc: "Basic development" },
  { id: 5, name: "Amateur", elo: 600, depth: 1, blunder: 0.55, subOpt: 0.15, em: "🐥", clr: "#FFB74D", tier: "Club Beg.", desc: "Slight pawn structure" },
  { id: 6, name: "Club Player", elo: 700, depth: 2, blunder: 0.45, subOpt: 0.18, em: "🐥", clr: "#FFB74D", tier: "Club Beg.", desc: "One-move threats" },
  { id: 7, name: "Patzer", elo: 800, depth: 2, blunder: 0.35, subOpt: 0.2, em: "♘", clr: "#FFA726", tier: "Class E", desc: "Avoids obvious blunders" },
  { id: 8, name: "Tactician", elo: 900, depth: 2, blunder: 0.28, subOpt: 0.2, em: "♘", clr: "#FFA726", tier: "Class E", desc: "Spots simple forks" },
  { id: 9, name: "Attacker", elo: 1000, depth: 2, blunder: 0.22, subOpt: 0.18, em: "🦉", clr: "#A5D6A7", tier: "Class D", desc: "Aggressive play" },
  { id: 10, name: "Positional", elo: 1100, depth: 2, blunder: 0.18, subOpt: 0.16, em: "🦉", clr: "#A5D6A7", tier: "Class D", desc: "Controls center" },
  { id: 11, name: "Strong Club", elo: 1200, depth: 3, blunder: 0.14, subOpt: 0.14, em: "🦅", clr: "#66BB6A", tier: "Class C", desc: "2-move combos" },
  { id: 12, name: "Expert Club", elo: 1300, depth: 3, blunder: 0.1, subOpt: 0.12, em: "🦅", clr: "#66BB6A", tier: "Class C", desc: "Good tactics" },
  { id: 13, name: "Candidate", elo: 1400, depth: 3, blunder: 0.07, subOpt: 0.1, em: "🦅", clr: "#66BB6A", tier: "Class B", desc: "Solid openings" },
  { id: 14, name: "Class A", elo: 1500, depth: 3, blunder: 0.05, subOpt: 0.08, em: "🏅", clr: "#42A5F5", tier: "Class A", desc: "Reliable" },
  { id: 15, name: "Expert", elo: 1600, depth: 3, blunder: 0.03, subOpt: 0.06, em: "🏅", clr: "#42A5F5", tier: "Expert", desc: "Deep calculation" },
  { id: 16, name: "Strong Expert", elo: 1700, depth: 4, blunder: 0.02, subOpt: 0.05, em: "🏅", clr: "#42A5F5", tier: "Expert", desc: "Rarely errs" },
  { id: 17, name: "Master", elo: 1800, depth: 4, blunder: 0.01, subOpt: 0.04, em: "🎓", clr: "#CE93D8", tier: "FIDE FM", desc: "FM-level" },
  { id: 18, name: "Senior Master", elo: 1900, depth: 4, blunder: 0.007, subOpt: 0.03, em: "🎓", clr: "#CE93D8", tier: "FIDE FM", desc: "Strong FM" },
  { id: 19, name: "International Master", elo: 2000, depth: 4, blunder: 0.005, subOpt: 0.02, em: "🧑‍🏫", clr: "#AB47BC", tier: "Intl Master", desc: "IM-level" },
  { id: 20, name: "Grandmaster", elo: 2200, depth: 5, blunder: 0.003, subOpt: 0.01, em: "👑", clr: "#FFD54F", tier: "Grandmaster", desc: "GM strength" },
  { id: 21, name: "Super GM", elo: 2400, depth: 5, blunder: 0.001, subOpt: 0.005, em: "👑", clr: "#FFD54F", tier: "Grandmaster", desc: "Elite GM" },
  { id: 22, name: "Engine", elo: 2600, depth: 6, blunder: 0.0005, subOpt: 0.002, em: "🤖", clr: "#FFD54F", tier: "Engine", desc: "Deep search" },
  { id: 23, name: "Deep Engine", elo: 2800, depth: 6, blunder: 0.0001, subOpt: 0.001, em: "🤖", clr: "#FFD54F", tier: "Engine", desc: "Depth 6 + TT" },
  { id: 24, name: "Stockfish Lite", elo: 3000, depth: 7, blunder: 0.00005, subOpt: 0.0005, em: "⚙️", clr: "#FFD54F", tier: "Engine", desc: "Max strength" },
];

function chooseBotMove(board, turn, ep, castling, bot) {
  const ms = allLegal(board, turn, ep, castling);
  if (!ms.length) return null;

  // Opening book for strong bots
  if (bot.depth >= 4 && Math.random() < 0.6) {
    const bookMove = getBookMove(board, turn, ep, castling);
    if (bookMove) return bookMove;
  }

  // Blunder
  if (Math.random() < bot.blunder) return ms[Math.floor(Math.random() * ms.length)];

  // Search with time allocation
  const timeMs = Math.min(4000, 800 + bot.depth * 200);
  const bestMove = iterativeDeepening(board, turn, ep, castling, bot.depth, timeMs);
  if (bestMove) return bestMove;

  // Fallback: simple scoring
  const isMax = turn === "w";
  const scored = ms.map(m => {
    const { board: nb, ep: ne, castling: nc } = applyMove(board, m[0], m[1], m[2], m[3], ep, castling, m[4]);
    const raw = negamax(nb, bot.depth - 1, -Infinity, Infinity, opp(turn), ne, nc);
    return { m, score: isMax ? raw : -raw };
  });
  scored.sort((a, b) => b.score - a.score);
  if (bot.subOpt > 0 && scored.length > 1 && Math.random() < bot.subOpt) {
    const idx = Math.min(Math.floor(Math.random() * 3) + 1, scored.length - 1);
    return scored[idx].m;
  }
  return scored[0].m;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   BOARD THEMES & PIECE STYLES (unchanged from original, but included fully)
   ═══════════════════════════════════════════════════════════════════════════════ */
const BOARD_THEMES = {
  classic:   { name: "Classic Wood",  light: "#f0d9b5", dark: "#b58863", lm: "#cdd26a", lmD: "#aaa23a", sel: "#f6f669", selD: "#baca2b", dot: "rgba(0,0,0,.2)" },
  tournament:{ name: "Tournament",    light: "#eeeed2", dark: "#769656", lm: "#baca2b", lmD: "#96a83a", sel: "#f0f04a", selD: "#a0b020", dot: "rgba(0,0,0,.18)" },
  ocean:     { name: "Ocean",         light: "#d8eaf5", dark: "#4a7aac", lm: "#6ab8e0", lmD: "#3a88c0", sel: "#90c8f0", selD: "#3080c0", dot: "rgba(0,20,80,.2)" },
  midnight:  { name: "Midnight",      light: "#788898", dark: "#2a3a54", lm: "#406890", lmD: "#305878", sel: "#5090c0", selD: "#205080", dot: "rgba(0,0,0,.28)" },
  walnut:    { name: "Walnut",        light: "#deb887", dark: "#7b3a10", lm: "#c89820", lmD: "#a07010", sel: "#e8c040", selD: "#c09010", dot: "rgba(0,0,0,.22)" },
  emerald:   { name: "Emerald",       light: "#e4f0e8", dark: "#2e7d44", lm: "#80cc66", lmD: "#509a40", sel: "#a8ee80", selD: "#60b040", dot: "rgba(0,30,0,.18)" },
  rose:      { name: "Rose",          light: "#f5dede", dark: "#b85050", lm: "#e08080", lmD: "#b05050", sel: "#f0a0a0", selD: "#c06060", dot: "rgba(40,0,0,.18)" },
  slate:     { name: "Slate",         light: "#c8d0d8", dark: "#4e5a68", lm: "#7098b8", lmD: "#507090", sel: "#88b0cc", selD: "#4080a8", dot: "rgba(0,0,0,.2)" },
  royal:     { name: "Royal Purple",  light: "#ddd0f0", dark: "#5a3a9a", lm: "#a078e0", lmD: "#7050c0", sel: "#c0a0f0", selD: "#8060d0", dot: "rgba(20,0,40,.2)" },
  arctic:    { name: "Arctic",        light: "#e0eff8", dark: "#3868a8", lm: "#80b8e0", lmD: "#3868a8", sel: "#a0d0f0", selD: "#3070c0", dot: "rgba(0,0,40,.18)" },
};

/* ─── SVG pieces (fully defined) ─── */
function PieceClassic({ isW, t }) {
  const gid = isW ? "gw" : "gb";
  const grad = isW ?
    <radialGradient id={gid} cx="38%" cy="28%" r="66%"><stop offset="0%" stopColor="#fff8ec"/><stop offset="100%" stopColor="#c8a028"/></radialGradient> :
    <radialGradient id={gid} cx="38%" cy="28%" r="60%"><stop offset="0%" stopColor="#2a3e58"/><stop offset="100%" stopColor="#0a1520"/></radialGradient>;
  const f = `url(#${gid})`;
  const s = isW ? "#4a3008" : "#7aaad0";
  const sw = 1.6;
  const P = { fill: f, stroke: s, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  const hl = isW ? "rgba(255,255,255,.6)" : "rgba(120,180,240,.22)";
  const sh = isW ? "rgba(120,80,10,.38)" : "rgba(0,0,0,.55)";
  const shapes = {
    P: <><defs>{grad}</defs><ellipse cx="22.5" cy="38" rx="8.5" ry="2.1" fill={sh}/><path d="M14 31 Q13 39 22.5 39 Q32 39 31 31Z" {...P}/><rect x="17" y="25.5" width="11" height="6.5" rx="1.5" {...P}/><circle cx="22.5" cy="19" r="6.5" {...P}/><ellipse cx="20.5" cy="17" rx="2.8" ry="2" fill={hl} opacity=".65"/></>,
    N: <><defs>{grad}</defs><ellipse cx="22.5" cy="38.5" rx="9" ry="2.1" fill={sh}/><path d="M14 33 Q13 39.5 22.5 39.5 Q32 39.5 31 33Z" {...P}/><path d="M15 33C15 23 16.5 14.5 20.5 11 22 9.8 24.5 9.5 26.5 11.5 30 14.5 28.5 21.5 25.5 24.5L23 27 23 33Z" {...P}/><circle cx="17.5" cy="17.5" r="1.8" fill={s}/><ellipse cx="19.5" cy="12" rx="2.5" ry="1.8" fill={hl} opacity=".6"/></>,
    B: <><defs>{grad}</defs><ellipse cx="22.5" cy="38.5" rx="9" ry="2.1" fill={sh}/><path d="M14.5 32 Q13.5 39.5 22.5 39.5 Q31.5 39.5 30.5 32Z" {...P}/><path d="M16.5 32 L19 15.5 22.5 10 26 15.5 28.5 32Z" {...P}/><circle cx="22.5" cy="8.5" r="3.5" {...P}/><line x1="22.5" y1="5" x2="22.5" y2="11.5" stroke={s} strokeWidth={sw}/><circle cx="22.5" cy="4.5" r="1.5" {...P}/><ellipse cx="20.5" cy="9.5" rx="2.2" ry="1.5" fill={hl} opacity=".65"/></>,
    R: <><defs>{grad}</defs><ellipse cx="22.5" cy="38.5" rx="9.5" ry="2.1" fill={sh}/><path d="M13 32 Q12 39.5 22.5 39.5 Q33 39.5 32 32Z" {...P}/><rect x="14.5" y="16" width="16" height="17" rx="1" {...P}/><rect x="13.5" y="12.5" width="18" height="4.5" rx="1" {...P}/><rect x="13.5" y="8" width="5" height="6.5" rx="1" {...P}/><rect x="20" y="8" width="5" height="6.5" rx="1" {...P}/><rect x="26.5" y="8" width="5" height="6.5" rx="1" {...P}/><rect x="14.5" y="25.5" width="16" height="2.5" fill={isW ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.04)"}/></>,
    Q: <><defs>{grad}</defs><ellipse cx="22.5" cy="39" rx="10" ry="2.1" fill={sh}/><path d="M12.5 31 Q11.5 39.5 22.5 39.5 Q33.5 39.5 32.5 31Z" {...P}/><path d="M12.5 31 L15.5 12 22.5 20 29.5 12 32.5 31Z" {...P}/><circle cx="12.5" cy="10.5" r="2.8" {...P}/><circle cx="22.5" cy="8.5" r="2.8" {...P}/><circle cx="32.5" cy="10.5" r="2.8" {...P}/><circle cx="17.5" cy="9.5" r="2" {...P}/><circle cx="27.5" cy="9.5" r="2" {...P}/><ellipse cx="19.5" cy="9.5" rx="3" ry="2" fill={hl} opacity=".5"/></>,
    K: <><defs>{grad}</defs><ellipse cx="22.5" cy="39" rx="10" ry="2.1" fill={sh}/><path d="M12.5 32 Q11.5 39.5 22.5 39.5 Q33.5 39.5 32.5 32Z" {...P}/><path d="M15 18 L14.5 32 H30.5 L30 18Z" {...P}/><rect x="13.5" y="14" width="18" height="4.5" rx="2" {...P}/><rect x="20.5" y="4.5" width="4" height="12" rx="2" {...P}/><rect x="16.5" y="8" width="12" height="3.5" rx="1.8" {...P}/><ellipse cx="20" cy="7.5" rx="2.8" ry="2" fill={hl} opacity=".6"/></>,
  };
  return <svg viewBox="0 0 45 45" style={{ width: "84%", height: "84%", display: "block", overflow: "visible" }}>{shapes[t]}</svg>;
}

function PieceNeo({ isW, t }) {
  const fill = isW ? "#f0e8d4" : "#182436";
  const s = isW ? "#2a1600" : "#80b0d0";
  const sw = 2;
  const hl = isW ? "rgba(255,255,255,.55)" : "rgba(100,160,220,.3)";
  const acc = isW ? "#d4a020" : "#4488cc";
  const P = { fill, stroke: s, strokeWidth: sw, strokeLinejoin: "round", strokeLinecap: "round" };
  const shapes = {
    P: <><circle cx="22.5" cy="15" r="7.5" {...P}/><path d="M17.5 21.5L16.5 33 Q16 39.5 22.5 39.5 Q29 39.5 28.5 33L27.5 21.5Z" {...P}/><circle cx="20" cy="12" r="2.5" fill={hl}/></>,
    N: <><path d="M16 34L19 25C16 19 17 11 21.5 9.5 23.5 8.8 26 9.5 27.5 12 30.5 16.5 29 23 26 26.5L29 34 Q28.5 39.5 22.5 39.5 Q15.5 39.5 16 34Z" {...P}/><circle cx="19.5" cy="18" r="2.2" fill={acc}/><path d="M20 11C22 9.5 25.5 10 27 13" stroke={acc} strokeWidth="1.8" fill="none"/></>,
    B: <><circle cx="22.5" cy="8.5" r="3.8" {...P}/><path d="M17 32L19.5 13.5 22.5 10.5 25.5 13.5 28 32 Q27.5 39.5 22.5 39.5 Q17.5 39.5 17 32Z" {...P}/><line x1="22.5" y1="4.7" x2="22.5" y2="12.3" stroke={acc} strokeWidth="2.5" strokeLinecap="round"/><circle cx="22.5" cy="4.2" r="2" {...P}/><line x1="17" y1="23" x2="28" y2="23" stroke={acc} strokeWidth="1.8"/></>,
    R: <><path d="M15.5 34L15.5 16H29.5V34 Q29 39.5 22.5 39.5 Q16 39.5 15.5 34Z" {...P}/><rect x="14" y="12" width="17" height="5" rx="1.5" {...P}/><rect x="14" y="8" width="5" height="6" rx="1.5" {...P}/><rect x="20" y="8" width="5" height="6" rx="1.5" {...P}/><rect x="26" y="8" width="5" height="6" rx="1.5" {...P}/></>,
    Q: <><path d="M12 31L15.5 12 22.5 21 29.5 12 33 31 Q32.5 39.5 22.5 39.5 Q12.5 39.5 12 31Z" {...P}/><circle cx="12.5" cy="10" r="3" {...P}/><circle cx="22.5" cy="8" r="3" {...P}/><circle cx="32.5" cy="10" r="3" {...P}/><circle cx="17.5" cy="9" r="2.2" {...P}/><circle cx="27.5" cy="9" r="2.2" {...P}/><path d="M15 23L22.5 27L30 23" stroke={acc} strokeWidth="1.5" fill="none"/></>,
    K: <><path d="M15.5 18L15 34 Q14.5 39.5 22.5 39.5 Q30.5 39.5 30 34L29.5 18Z" {...P}/><rect x="13.5" y="14" width="18" height="5" rx="2.5" {...P}/><rect x="20.5" y="4.5" width="4" height="12" rx="2" {...P}/><rect x="16.5" y="8.5" width="12" height="3.5" rx="1.8" {...P}/><circle cx="22.5" cy="20.5" r="2.5" fill={acc}/></>,
  };
  return <svg viewBox="0 0 45 45" style={{ width: "84%", height: "84%", display: "block", overflow: "visible" }}><defs><filter id="nf"><feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity=".28"/></filter></defs><g style={{ filter: "url(#nf)" }}>{shapes[t]}</g></svg>;
}

function PieceWood({ isW, t }) {
  const gid = isW ? `gw_${t}` : `gb_${t}`;
  const grad = isW ?
    <radialGradient id={gid} cx="35%" cy="25%" r="70%"><stop offset="0%" stopColor="#fff5dc"/><stop offset="45%" stopColor="#d4a040"/><stop offset="100%" stopColor="#7a4a10"/></radialGradient> :
    <radialGradient id={gid} cx="35%" cy="25%" r="70%"><stop offset="0%" stopColor="#3a5070"/><stop offset="50%" stopColor="#152030"/><stop offset="100%" stopColor="#050c18"/></radialGradient>;
  const f = `url(#${gid})`;
  const s = isW ? "#3a1a00" : "#607090";
  const sw = 1.8;
  const ring = isW ? "rgba(255,220,120,.35)" : "rgba(80,130,190,.3)";
  const hl = isW ? "rgba(255,255,200,.55)" : "rgba(130,190,255,.25)";
  const P = { fill: f, stroke: s, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  const shapes = {
    P: <><defs>{grad}</defs><ellipse cx="22.5" cy="38" rx="8.5" ry="2.2" fill={isW ? "rgba(100,60,0,.4)" : "rgba(0,0,0,.5)"}/><path d="M14 31.5 Q13 39 22.5 39 Q32 39 31 31.5Z" {...P}/><ellipse cx="22.5" cy="31.5" rx="9" ry="1.8" fill={ring}/><rect x="17.5" y="26" width="10" height="6.5" rx="2" {...P}/><circle cx="22.5" cy="19" r="7.5" {...P}/><ellipse cx="22.5" cy="18" rx="5" ry="3.5" fill={ring} opacity=".7"/><ellipse cx="20.5" cy="16.5" rx="2.8" ry="2" fill={hl} opacity=".7"/></>,
    N: <><defs>{grad}</defs><ellipse cx="22.5" cy="38.5" rx="9" ry="2.2" fill={isW ? "rgba(100,60,0,.4)" : "rgba(0,0,0,.5)"}/><path d="M14 33 Q13 39.5 22.5 39.5 Q32 39.5 31 33Z" {...P}/><ellipse cx="22.5" cy="33" rx="9" ry="2" fill={ring}/><path d="M15 33C14.5 23 16 14.5 20.5 11 22 9.8 24.5 9.5 26.5 11.5 30 15 28.5 22 25.5 25 24 26.5 23 27.5 23 33Z" {...P}/><ellipse cx="19.5" cy="12.5" rx="2.5" ry="1.8" fill={hl} opacity=".65"/><circle cx="18" cy="17.5" r="1.8" fill={s}/></>,
    B: <><defs>{grad}</defs><ellipse cx="22.5" cy="38.5" rx="9" ry="2.2" fill={isW ? "rgba(100,60,0,.4)" : "rgba(0,0,0,.5)"}/><path d="M14.5 32 Q13.5 39.5 22.5 39.5 Q31.5 39.5 30.5 32Z" {...P}/><ellipse cx="22.5" cy="32" rx="9" ry="2" fill={ring}/><path d="M16.5 32 L19 15.5 22.5 10 26 15.5 28.5 32Z" {...P}/><circle cx="22.5" cy="8.5" r="3.8" {...P}/><ellipse cx="22.5" cy="8" rx="2.5" ry="1.8" fill={ring} opacity=".7"/><line x1="22.5" y1="4.8" x2="22.5" y2="12" stroke={s} strokeWidth={sw}/><circle cx="22.5" cy="4.3" r="1.8" {...P}/></>,
    R: <><defs>{grad}</defs><ellipse cx="22.5" cy="38.5" rx="9.5" ry="2.2" fill={isW ? "rgba(100,60,0,.4)" : "rgba(0,0,0,.5)"}/><path d="M13 32 Q12 39.5 22.5 39.5 Q33 39.5 32 32Z" {...P}/><ellipse cx="22.5" cy="32" rx="10" ry="2.2" fill={ring}/><rect x="14.5" y="16" width="16" height="17" rx="1.5" {...P}/><rect x="13.5" y="12" width="18" height="5" rx="1.5" {...P}/><ellipse cx="22.5" cy="16.5" rx="9" ry="1.8" fill={ring}/><rect x="13.5" y="8" width="5" height="6" rx="1.5" {...P}/><rect x="20" y="8" width="5" height="6" rx="1.5" {...P}/><rect x="26.5" y="8" width="5" height="6" rx="1.5" {...P}/></>,
    Q: <><defs>{grad}</defs><ellipse cx="22.5" cy="39" rx="10" ry="2.2" fill={isW ? "rgba(100,60,0,.4)" : "rgba(0,0,0,.5)"}/><path d="M12.5 31 Q11.5 39.5 22.5 39.5 Q33.5 39.5 32.5 31Z" {...P}/><ellipse cx="22.5" cy="31" rx="10.5" ry="2.2" fill={ring}/><path d="M12.5 31 L15.5 11.5 22.5 20 29.5 11.5 32.5 31Z" {...P}/><circle cx="12.5" cy="10" r="3" {...P}/><circle cx="22.5" cy="8" r="3" {...P}/><circle cx="32.5" cy="10" r="3" {...P}/><ellipse cx="20.5" cy="8.5" rx="2.5" ry="1.8" fill={hl} opacity=".6"/></>,
    K: <><defs>{grad}</defs><ellipse cx="22.5" cy="39" rx="10" ry="2.2" fill={isW ? "rgba(100,60,0,.4)" : "rgba(0,0,0,.5)"}/><path d="M13 32.5 Q12 39.5 22.5 39.5 Q33 39.5 32 32.5Z" {...P}/><ellipse cx="22.5" cy="32.5" rx="10" ry="2.2" fill={ring}/><path d="M15.5 18 L15 32.5 H30 L29.5 18Z" {...P}/><rect x="13.5" y="14" width="18" height="5" rx="2.5" {...P}/><ellipse cx="22.5" cy="18.5" rx="9" ry="2" fill={ring}/><rect x="20.5" y="4.5" width="4" height="12" rx="2" {...P}/><rect x="16.5" y="8.5" width="12" height="3.5" rx="1.8" {...P}/><ellipse cx="20.5" cy="7.5" rx="2.8" ry="2" fill={hl} opacity=".7"/></>,
  };
  return <svg viewBox="0 0 45 45" style={{ width: "84%", height: "84%", display: "block", overflow: "visible" }}>{shapes[t]}</svg>;
}

function PieceSVG({ piece, style }) {
  if (!piece) return null;
  const isW = cl(piece) === "w";
  const t = tp(piece);
  if (style === "neo") return <PieceNeo isW={isW} t={t} />;
  if (style === "wood") return <PieceWood isW={isW} t={t} />;
  return <PieceClassic isW={isW} t={t} />;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SETTINGS & UTILITIES
   ═══════════════════════════════════════════════════════════════════════════════ */
const DEFS = { boardTheme: "classic", pieceStyle: "classic", sounds: true, showLegal: true, showCoords: true, autoQueen: false };
function loadSettings() {
  try {
    const s = localStorage.getItem("ct3");
    return s ? { ...DEFS, ...JSON.parse(s) } : DEFS;
  } catch { return DEFS; }
}
function saveSettings(s) {
  try { localStorage.setItem("ct3", JSON.stringify(s)); } catch { }
}

/* ─── Sound Engine (safe) ─── */
function useSound(enabled) {
  const acRef = useRef(null);
  const getAC = useCallback(() => {
    if (!acRef.current) {
      try {
        acRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { return null; }
    }
    if (acRef.current && acRef.current.state === "suspended") {
      acRef.current.resume().catch(e => console.warn("AudioContext resume failed", e));
    }
    return acRef.current;
  }, []);
  const wood = (ac, t0, f = 280, dur = .07, g = .62) => {
    const sr = ac.sampleRate;
    const len = Math.floor(sr * dur);
    const buf = ac.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * .17));
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = f;
    bp.Q.value = 2.8;
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = f * 3;
    const gn = ac.createGain();
    gn.gain.setValueAtTime(g, t0);
    gn.gain.exponentialRampToValueAtTime(.001, t0 + dur);
    src.connect(bp);
    bp.connect(lp);
    lp.connect(gn);
    gn.connect(ac.destination);
    src.start(t0);
    const o = ac.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(f * 1.6, t0);
    o.frequency.exponentialRampToValueAtTime(f * .75, t0 + dur * 2.4);
    const og = ac.createGain();
    og.gain.setValueAtTime(g * .11, t0);
    og.gain.exponentialRampToValueAtTime(.001, t0 + dur * 2.4);
    o.connect(og);
    og.connect(ac.destination);
    o.start(t0);
    o.stop(t0 + dur * 2.4);
  };
  return useCallback((type) => {
    if (!enabled) return;
    try {
      const ac = getAC();
      if (!ac) return;
      const t = ac.currentTime;
      if (type === "move") wood(ac, t, 268, .064, .50);
      else if (type === "capture") { wood(ac, t, 338, .074, .76); wood(ac, t + .054, 202, .054, .36); }
      else if (type === "check") { [[790, .32], [992, .2]].forEach(([f, g]) => { const o = ac.createOscillator(); o.type = "triangle"; const gg = ac.createGain(); o.frequency.value = f; gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(g, t + .008); gg.gain.exponentialRampToValueAtTime(.001, t + .62); o.connect(gg); gg.connect(ac.destination); o.start(t); o.stop(t + .65); }); }
      else if (type === "castle") { wood(ac, t, 272, .066, .58); wood(ac, t + .13, 254, .056, .42); }
      else if (type === "gameover") { [[261.6, 0], [329.6, .11], [392, .22], [523.3, .33]].forEach(([f, d]) => { const o = ac.createOscillator(); o.type = "triangle"; const g = ac.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(.16, t + d + .04); g.gain.exponentialRampToValueAtTime(.001, t + d + 1.5); o.connect(g); g.connect(ac.destination); o.start(t + d); o.stop(t + d + 1.6); }); }
    } catch (e) { console.warn("Sound error", e); }
  }, [enabled, getAC]);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ANALYSIS HELPERS
   ═══════════════════════════════════════════════════════════════════════════════ */
const TIME_MODES = [
  { id: "inf", label: "♾ Unlimited", secs: 0 },
  { id: "1", label: "⚡ Bullet 1'", secs: 60 },
  { id: "2", label: "⚡ Bullet 2'", secs: 120 },
  { id: "3", label: "🔥 Blitz 3'", secs: 180 },
  { id: "5", label: "🔥 Blitz 5'", secs: 300 },
  { id: "10", label: "♟ Rapid 10'", secs: 600 },
  { id: "15", label: "♟ Rapid 15'", secs: 900 }
];

const sqN = (r, c) => String.fromCharCode(97 + c) + (8 - r);
const eToW = e => Math.min(99, Math.max(1, Math.round(50 + 50 * (2 / (1 + Math.exp(-e / 400)) - 1))));
const fmtEval = e => e > 9000 ? "+M" + Math.ceil((50000 - e) / 2) : e < -9000 ? "-M" + Math.ceil((50000 + e) / 2) : (e >= 0 ? "+" : "") + (e / 100).toFixed(1);
const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function computeCPL(board, fr, fc, tr, tc, promo, ep, castling, movingColor) {
  const sign = movingColor === "w" ? 1 : -1;
  const cands = allLegal(board, movingColor, ep, castling).map(m => {
    const { board: nb } = applyMove(board, m[0], m[1], m[2], m[3], ep, castling, m[4]);
    return sign * evalFull(nb);
  });
  if (!cands.length) return 0;
  const bestScore = Math.max(...cands);
  const { board: nb } = applyMove(board, fr, fc, tr, tc, ep, castling, promo);
  const playedScore = sign * evalFull(nb);
  return Math.max(0, bestScore - playedScore);
}

function cplToAcc(avgCPL) {
  return Math.min(100, Math.max(0, Math.round(103.1668 * Math.exp(-0.04354 * avgCPL) - 3.1668)));
}

function playerAcc(moves, color) {
  const pm = moves.filter(m => cl(m.piece) === color);
  if (!pm.length) return null;
  return cplToAcc(pm.reduce((s, m) => s + (m.cpl || 0), 0) / pm.length);
}

function classifyMove(cpl, brilliant = false) {
  if (brilliant) return { label: "Brilliant", sym: "!!", clr: "#00BCD4" };
  if (cpl <= 5) return { label: "Best", sym: "✦", clr: "#4CAF50" };
  if (cpl <= 20) return { label: "Excellent", sym: "!", clr: "#8BC34A" };
  if (cpl <= 50) return { label: "Good", sym: "", clr: "#CDDC39" };
  if (cpl <= 100) return { label: "Inaccuracy", sym: "?!", clr: "#FF9800" };
  if (cpl <= 200) return { label: "Mistake", sym: "?", clr: "#FF5722" };
  return { label: "Blunder", sym: "??", clr: "#F44336" };
}

function buildNotation(board, fr, fc, tr, tc, captured, nb, promo) {
  const p = board[fr][fc];
  const t = tp(p);
  const c0 = cl(p);
  if (t === "K" && tc - fc === 2) return "O-O";
  if (t === "K" && fc - tc === 2) return "O-O-O";
  const pc = t === "P" ? "" : t;
  const fromF = t === "P" && captured ? String.fromCharCode(97 + fc) : "";
  const cap = captured ? "x" : "";
  const nc = opp(c0);
  const nm = allLegal(nb, nc, null, INIT_CAST());
  return `${pc}${fromF}${cap}${sqN(tr, tc)}${promo ? `=${promo}` : ""}${inCheck(nb, nc) ? (nm.length ? "+" : "#") : ""}`;
}

function posHash(board, turn, castling, ep) {
  return board.flat().map(p => p || ".").join("") + turn +
         (castling.wK ? "K" : "") + (castling.wQ ? "Q" : "") +
         (castling.bK ? "k" : "") + (castling.bQ ? "q" : "") +
         (ep ? ep.join(",") : "-");
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SETTINGS PANEL (unchanged – included from original)
   ═══════════════════════════════════════════════════════════════════════════════ */
function SettingsPanel({ settings, onSave, onClose }) {
  const [s, setS] = useState({ ...settings });
  const upd = (k, v) => setS(p => ({ ...p, [k]: v }));
  const pieceOpts = [
    { id: "classic", name: "Classic / Staunton", desc: "3D gradient tournament style" },
    { id: "neo", name: "Neo Flat", desc: "Modern bold minimalist" },
    { id: "wood", name: "Wood / 3D", desc: "Warm carved-piece texture" }
  ];
  const themeList = Object.entries(BOARD_THEMES);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.65)" }} />
      <div style={{ position: "relative", width: "min(100vw, 430px)", height: "100vh", background: "#0e1020", borderLeft: "1px solid #1e2234", display: "flex", flexDirection: "column", animation: "slideRight .28s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #1e2234", flexShrink: 0 }}>
          <span style={{ fontFamily: "Cinzel,serif", fontSize: 15, fontWeight: 700, color: "#c8a84b", letterSpacing: "1px" }}>⚙ Settings</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6a6080", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>
          <p style={{ fontFamily: "Cinzel,serif", fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#5a5468", marginBottom: 12 }}>Board Theme</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 24 }}>
            {themeList.map(([id, th]) => (
              <div key={id} onClick={() => upd("boardTheme", id)} style={{ cursor: "pointer", borderRadius: 8, overflow: "hidden", border: `2px solid ${s.boardTheme === id ? "#c8a84b" : "transparent"}`, boxShadow: s.boardTheme === id ? "0 0 12px rgba(200,168,75,.38)" : "none", transition: "all .18s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", aspectRatio: "1" }}>{[th.light, th.dark, th.dark, th.light].map((c, i) => <div key={i} style={{ background: c, aspectRatio: "1" }} />)}</div>
                <div style={{ background: "#1a1c28", padding: "3px 2px", textAlign: "center", fontFamily: "Crimson Pro,serif", fontSize: 8, color: s.boardTheme === id ? "#c8a84b" : "#5a5468", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{th.name}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "Cinzel,serif", fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#5a5468", marginBottom: 12 }}>Piece Style</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {pieceOpts.map(opt => (
              <div key={opt.id} onClick={() => upd("pieceStyle", opt.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: 10, cursor: "pointer", background: s.pieceStyle === opt.id ? "rgba(200,168,75,.1)" : "rgba(255,255,255,.02)", border: `2px solid ${s.pieceStyle === opt.id ? "#c8a84b" : "rgba(255,255,255,.05)"}`, transition: "all .18s" }}>
                <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                  {["K", "Q", "N"].map(t => (
                    <div key={t} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.04)", borderRadius: 4 }}>
                      <PieceSVG piece={"w" + t} style={opt.id} />
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Cinzel,serif", fontSize: 11, fontWeight: 600, color: s.pieceStyle === opt.id ? "#c8a84b" : "#b0a890", marginBottom: 2 }}>{opt.name}</div>
                  <div style={{ fontFamily: "Crimson Pro,serif", fontSize: 10, color: "#5a5468", fontStyle: "italic" }}>{opt.desc}</div>
                </div>
                {s.pieceStyle === opt.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c8a84b" }} />}
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "Cinzel,serif", fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "#5a5468", marginBottom: 12 }}>Options</p>
          {[["sounds", "🔊 Sound Effects", "Move, capture, check & game-end sounds"], ["showLegal", "💡 Legal Move Hints", "Dots on valid destination squares"], ["showCoords", "🔢 Coordinates", "Rank and file labels"], ["autoQueen", "♛ Auto-Queen", "Skip promotion dialog"]].map(([key, label, desc]) => (
            <div key={key} onClick={() => upd(key, !s[key])} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 6, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Crimson Pro,serif", fontSize: 12, color: "#c0b8a0", fontWeight: 600 }}>{label}</div>
                <div style={{ fontFamily: "Crimson Pro,serif", fontSize: 10, color: "#5a5468", fontStyle: "italic" }}>{desc}</div>
              </div>
              <div style={{ width: 40, height: 22, borderRadius: 11, background: s[key] ? "#c8a84b" : "#2a2838", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: s[key] ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 18px", borderTop: "1px solid #1e2234", flexShrink: 0 }}>
          <button onClick={() => { saveSettings(s); onSave(s); onClose(); }} style={{ width: "100%", background: "linear-gradient(135deg,#c8a84b,#8a6820)", color: "#0d0900", border: "none", borderRadius: 8, padding: "12px", fontFamily: "Cinzel,serif", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "2px", textTransform: "uppercase" }}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   INTRO SCREEN
   ═══════════════════════════════════════════════════════════════════════════════ */
function IntroScreen({ onEnter }) {
  const [ph, setPh] = useState(0);
  useEffect(() => {
    const ts = [200, 900, 1600].map((ms, i) => setTimeout(() => setPh(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  const T = "CHESS TRAINER";
  return (
    <div style={{ height: "100vh", background: "#07090f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", fontFamily: "Cinzel,Georgia,serif" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(200,168,75,.04)1px,transparent 1px),linear-gradient(90deg,rgba(200,168,75,.04)1px,transparent 1px)", backgroundSize: "58px 58px", animation: "fadeIn 2s ease" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 540, height: 540, background: "radial-gradient(circle,rgba(200,168,75,.07)0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontSize: 80, marginBottom: 14, opacity: ph >= 1 ? 1 : 0, animation: ph >= 1 ? "introK .85s cubic-bezier(.34,1.56,.64,1) forwards" : "none", filter: "drop-shadow(0 0 28px rgba(200,168,75,.65))", color: "#c8a84b" }}>♞</div>
      <div style={{ display: "flex", gap: 1.5, marginBottom: 10 }}>
        {T.split("").map((ch, i) => (
          <span key={i} style={{ fontFamily: "Cinzel,serif", fontSize: "clamp(18px,4.2vw,42px)", fontWeight: 900, color: i < 5 ? "#c8a84b" : "#e8dfc8", opacity: ph >= 2 ? 1 : 0, transform: ph >= 2 ? "none" : "translateY(16px)", transition: `opacity .38s ease ${i * .05}s,transform .42s cubic-bezier(.34,1.56,.64,1) ${i * .05}s`, textShadow: i < 5 ? "0 0 18px rgba(200,168,75,.5)" : "none" }}>{ch === " " ? "\u00A0" : ch}</span>
        ))}
      </div>
      <p style={{ fontFamily: "Crimson Pro,serif", fontSize: "clamp(10px,1.8vw,14px)", color: "#5a5060", letterSpacing: "5px", textTransform: "uppercase", marginBottom: 34, opacity: ph >= 2 ? 1 : 0, transition: "opacity .6s ease .75s" }}>25 Bots · Quiescence Search · Deep Analysis</p>
      <div style={{ width: "min(250px,55vw)", height: 1, background: "linear-gradient(90deg,transparent,#c8a84b,transparent)", marginBottom: 38, opacity: ph >= 2 ? 1 : 0, transition: "opacity .4s ease .6s" }} />
      <button onClick={onEnter} style={{ opacity: ph >= 3 ? 1 : 0, transform: ph >= 3 ? "none" : "translateY(14px)", transition: "opacity .5s ease,transform .5s ease", background: "transparent", border: "2px solid #c8a84b", borderRadius: 4, color: "#c8a84b", padding: "13px 44px", fontSize: 11, fontFamily: "Cinzel,serif", fontWeight: 700, letterSpacing: "4px", cursor: "pointer", textTransform: "uppercase" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,168,75,.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>Enter the Board</button>
      {[[{ top: 0, left: 0 }, { borderTop: "2px solid #c8a84b", borderLeft: "2px solid #c8a84b" }], [{ top: 0, right: 0 }, { borderTop: "2px solid #c8a84b", borderRight: "2px solid #c8a84b" }], [{ bottom: 0, left: 0 }, { borderBottom: "2px solid #c8a84b", borderLeft: "2px solid #c8a84b" }], [{ bottom: 0, right: 0 }, { borderBottom: "2px solid #c8a84b", borderRight: "2px solid #c8a84b" }]].map(([pos, brd], i) => (
        <div key={i} style={{ position: "absolute", ...pos, width: 44, height: 44, ...brd, margin: 14, opacity: .28 }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN APP COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function ChessApp() {
  const [screen, setScreen] = useState("intro");
  const [board, setBoard] = useState(INIT_BOARD());
  const [turn, setTurn] = useState("w");
  const [selSq, setSelSq] = useState(null);
  const [legal, setLegal] = useState([]);
  const [ep, setEp] = useState(null);
  const [castling, setCastling] = useState(INIT_CAST());
  const [lastMove, setLastMove] = useState(null);
  const [result, setResult] = useState(null);
  const [chkFlag, setChkFlag] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [history, setHistory] = useState([]);
  const [evalHist, setEvalHist] = useState([0]);
  const [bot, setBot] = useState(BOTS[5]);
  const [pColor, setPColor] = useState("w");
  const [showPromo, setShowPromo] = useState(null);
  const [gameTab, setGameTab] = useState("moves");
  const [timeMode, setTimeMode] = useState(TIME_MODES[0]);
  const [wTime, setWTime] = useState(0);
  const [bTime, setBTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [landSq, setLandSq] = useState(null);
  const [posHist, setPosHist] = useState([]);
  const [halfClock, setHalfClock] = useState(0);
  const [settings, setSettings] = useState(loadSettings);
  const [showSet, setShowSet] = useState(false);
  const [revIdx, setRevIdx] = useState(-1);
  const [vw, setVw] = useState(window.innerWidth);
  const mlRef = useRef(null);
  useEffect(() => {
    const f = () => setVw(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const mob = vw < 700;
  const playSound = useSound(settings.sounds);
  const th = BOARD_THEMES[settings.boardTheme] || BOARD_THEMES.classic;

  // Clock timer
  useEffect(() => {
    if (!timerOn || !timeMode.secs || result) return;
    const t = setInterval(() => {
      if (turn === "w") {
        setWTime(p => { if (p <= 1) { setResult("Black wins on time! ⏱"); setTimerOn(false); playSound("gameover"); return 0; } return p - 1; });
      } else {
        setBTime(p => { if (p <= 1) { setResult("White wins on time! ⏱"); setTimerOn(false); playSound("gameover"); return 0; } return p - 1; });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [timerOn, turn, result, timeMode, playSound]);

  function startGame(b, pc, tm) {
    const ib = INIT_BOARD();
    const ic = INIT_CAST();
    setBoard(ib);
    setTurn("w");
    setSelSq(null);
    setLegal([]);
    setEp(null);
    setCastling(ic);
    setLastMove(null);
    setResult(null);
    setChkFlag(false);
    setThinking(false);
    setHistory([]);
    setEvalHist([0]);
    setBot(b);
    setPColor(pc);
    setTimeMode(tm);
    setWTime(tm.secs);
    setBTime(tm.secs);
    setTimerOn(!!tm.secs);
    setPosHist([posHash(ib, "w", ic, null)]);
    setHalfClock(0);
    setScreen("game");
    setGameTab("moves");
    setLandSq(null);
    clearTables();
  }

  // Bot move
  useEffect(() => {
    if (screen !== "game" || turn === pColor || result) return;
    setThinking(true);
    const delay = 1400 + Math.random() * 700;
    const t = setTimeout(() => {
      const m = chooseBotMove(board, turn, ep, castling, bot);
      if (m) execMove(m[0], m[1], m[2], m[3], m[4]);
      setThinking(false);
    }, delay);
    return () => clearTimeout(t);
  }, [turn, screen, result, board, bot, pColor, ep, castling]);

  function execMove(fr, fc, tr, tc, promo) {
    const mc = cl(board[fr][fc]);
    const cpl = computeCPL(board, fr, fc, tr, tc, promo, ep, castling, mc);
    const prevEval = evalFull(board);
    const { board: nb, ep: nep, castling: nc, captured } = applyMove(board, fr, fc, tr, tc, ep, castling, promo);
    const ne = evalFull(nb);
    const capVal = captured ? PVAL[tp(captured)] || 0 : 0;
    const evalSwing = mc === "w" ? (ne - prevEval) : (prevEval - ne);
    const isBrill = cpl <= 5 && capVal >= 300 && evalSwing >= 150 && !!captured;
    const cls = classifyMove(cpl, isBrill);
    const notation = buildNotation(board, fr, fc, tr, tc, captured, nb, promo);
    const isCastle = tp(board[fr][fc]) === "K" && Math.abs(tc - fc) === 2;
    const newHalf = (captured || tp(board[fr][fc]) === "P") ? 0 : halfClock + 1;
    const newPos = posHash(nb, opp(mc), nc, nep);
    const newPosHist = [...posHist, newPos];
    if (captured) playSound("capture");
    else if (isCastle) playSound("castle");
    else playSound("move");
    const rec = { fr, fc, tr, tc, piece: board[fr][fc], captured, notation, classification: cls, eval: ne, cpl, board: nb, ep: nep, castling: nc };
    setBoard(nb);
    setEp(nep);
    setCastling(nc);
    setLastMove([fr, fc, tr, tc]);
    setLandSq(`${tr}-${tc}`);
    setSelSq(null);
    setLegal([]);
    setHistory(h => [...h, rec]);
    setEvalHist(e => [...e, ne]);
    setHalfClock(newHalf);
    setPosHist(newPosHist);
    if (newHalf >= 100) { setResult("Draw by 50-move rule! 🤝"); setTimerOn(false); return; }
    if (newPosHist.filter(p => p === newPos).length >= 3) { setResult("Draw by threefold repetition! 🤝"); setTimerOn(false); return; }
    const nt = opp(mc);
    const nm = allLegal(nb, nt, nep, nc);
    if (!nm.length) {
      const chk = inCheck(nb, nt);
      setResult(chk ? `${mc === "w" ? "White" : "Black"} wins by checkmate! ♟` : "Draw by stalemate! 🤝");
      setTimerOn(false);
      setChkFlag(false);
      playSound("gameover");
    } else {
      const chk = inCheck(nb, nt);
      setChkFlag(chk);
      setTurn(nt);
      if (chk) playSound("check");
    }
  }

  function handleSq(r, c) {
    if (thinking || result || screen !== "game" || turn !== pColor) return;
    const piece = board[r][c];
    if (selSq) {
      if (legal.some(m => m[2] === r && m[3] === c)) {
        const here = legal.filter(m => m[2] === r && m[3] === c);
        if (here[0][4] !== null && !settings.autoQueen) {
          setShowPromo({ fr: selSq[0], fc: selSq[1], tr: r, tc: c });
          return;
        }
        execMove(selSq[0], selSq[1], r, c, settings.autoQueen ? null : here[0][4]);
        return;
      }
      if (piece && cl(piece) === pColor) {
        setSelSq([r, c]);
        setLegal(legalMovesFor(board, r, c, ep, castling));
        return;
      }
      setSelSq(null);
      setLegal([]);
      return;
    }
    if (piece && cl(piece) === pColor) {
      setSelSq([r, c]);
      setLegal(legalMovesFor(board, r, c, ep, castling));
    }
  }

  function takeback() {
    if (history.length < 1 || result) return;
    const steps = turn === pColor ? Math.min(2, history.length) : Math.min(1, history.length);
    const nh = history.slice(0, -steps);
    const neh = evalHist.slice(0, -steps);
    if (!nh.length) {
      const ib = INIT_BOARD();
      const ic = INIT_CAST();
      setBoard(ib);
      setEp(null);
      setCastling(ic);
      setTurn("w");
      setLastMove(null);
      setChkFlag(false);
      setPosHist([posHash(ib, "w", ic, null)]);
      setHalfClock(0);
    } else {
      const last = nh[nh.length - 1];
      setBoard(last.board);
      setEp(last.ep);
      setCastling(last.castling);
      setTurn(opp(cl(last.piece)));
      setLastMove([last.fr, last.fc, last.tr, last.tc]);
      setChkFlag(inCheck(last.board, opp(cl(last.piece))));
    }
    setHistory(nh);
    setEvalHist(neh);
    setSelSq(null);
    setLegal([]);
    setResult(null);
    setLandSq(null);
    playSound("move");
  }

  useEffect(() => { if (mlRef.current) mlRef.current.scrollTop = mlRef.current.scrollHeight; }, [history]);

  const curEval = evalHist[evalHist.length - 1];
  const winPct = eToW(curEval);
  const flipped = pColor === "b";
  const wAcc = history.length ? playerAcc(history, "w") : null;
  const bAcc = history.length ? playerAcc(history, "b") : null;
  const myAcc = pColor === "w" ? wAcc : bAcc;
  const lastCls = history.length ? history[history.length - 1].classification : null;
  const botSide = opp(pColor);

  function Board({ brd, lm, clickable, legalMoves, sel, chk, curTurn, anim }) {
    const rows = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const cols = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gridTemplateRows: "repeat(8,1fr)", width: "100%", aspectRatio: "1/1", overflow: "hidden", borderRadius: 6 }}>
        {rows.flatMap(r => cols.map(c => {
          const piece = brd[r][c];
          const light = (r + c) % 2 === 1;
          const isSel = sel && sel[0] === r && sel[1] === c;
          const isLM = lm && (lm[0] === r && lm[1] === c || lm[2] === r && lm[3] === c);
          const isDot = settings.showLegal && legalMoves && legalMoves.some(m => m[2] === r && m[3] === c);
          const kChk = chk && piece === curTurn + "K";
          const isAnim = anim === `${r}-${c}`;
          let bg = light ? th.light : th.dark;
          if (isLM) bg = light ? th.lm : th.lmD;
          if (isSel) bg = light ? th.sel : th.selD;
          return (
            <div key={`${r}-${c}`} onClick={clickable ? () => handleSq(r, c) : undefined}
              style={{ background: bg, aspectRatio: "1/1", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", cursor: clickable ? "pointer" : "default", animation: kChk ? "checkFlash .9s infinite" : "none" }}>
              {isDot && (piece ? <div style={{ position: "absolute", inset: 3, border: "3px solid rgba(0,0,0,.22)", borderRadius: 3, pointerEvents: "none", zIndex: 1 }} /> : <div style={{ width: "30%", height: "30%", borderRadius: "50%", background: th.dot, pointerEvents: "none", zIndex: 1 }} />)}
              {piece && <div style={{ position: "relative", zIndex: 2, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", transform: isSel ? "scale(1.1) translateY(-2px)" : "scale(1)", transition: "transform .1s ease", animation: isAnim ? "drop .28s cubic-bezier(.34,1.56,.64,1) forwards" : "none", filter: cl(piece) === "w" ? "drop-shadow(0 3px 5px rgba(0,0,0,.9)) drop-shadow(0 1px 2px rgba(0,0,0,.5))" : "drop-shadow(0 3px 5px rgba(0,0,0,.82))" }}>
                <PieceSVG piece={piece} style={settings.pieceStyle} />
              </div>}
              {settings.showCoords && c === (flipped ? 7 : 0) && <span style={{ position: "absolute", top: 1, left: 2, fontSize: 9, fontWeight: 800, color: light ? th.dark : th.light, fontFamily: "monospace", pointerEvents: "none", opacity: .72 }}>{8 - r}</span>}
              {settings.showCoords && r === (flipped ? 0 : 7) && <span style={{ position: "absolute", bottom: 1, right: 2, fontSize: 9, fontWeight: 800, color: light ? th.dark : th.light, fontFamily: "monospace", pointerEvents: "none", opacity: .72 }}>{String.fromCharCode(97 + c)}</span>}
            </div>
          );
        }))}
      </div>
    );
  }

  function EvalBar({ wp, ev }) {
    return (
      <div style={{ width: "100%", marginBottom: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, padding: "0 2px" }}>
          <span style={{ fontFamily: "Crimson Pro,serif", fontSize: 11, color: "#c0b8a0" }}>♔ <b style={{ color: "#e8dfc8" }}>{wp}%</b></span>
          <span style={{ fontFamily: "Cinzel,monospace", fontSize: 13, fontWeight: 700, color: ev > 50 ? "#f0ead0" : ev < -50 ? "#6080b0" : "#c8a84b", background: "rgba(255,255,255,.04)", padding: "2px 10px", borderRadius: 4, border: "1px solid rgba(255,255,255,.06)" }}>{fmtEval(ev)}</span>
          <span style={{ fontFamily: "Crimson Pro,serif", fontSize: 11, color: "#4a5070" }}><b style={{ color: "#5a6090" }}>{100 - wp}%</b> ♚</span>
        </div>
        <div style={{ width: "100%", height: 15, borderRadius: 7, overflow: "hidden", background: "#0c0e18", border: "1px solid #1c1e2c", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${wp}%`, background: "linear-gradient(90deg,#c89a28,#e8d888,#c8a84b)", transition: "width .6s cubic-bezier(.4,0,.2,1)", borderRadius: "7px 0 0 7px", boxShadow: "2px 0 8px rgba(200,168,75,.32)" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${100 - wp}%`, background: "linear-gradient(90deg,#1a2030,#0d1020)", transition: "width .6s cubic-bezier(.4,0,.2,1)", borderRadius: "0 7px 7px 0" }} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(200,168,75,.22)", zIndex: 2 }} />
        </div>
      </div>
    );
  }

  function Clock({ secs, active, low }) {
    if (!timeMode.secs) return null;
    return <div style={{ fontFamily: "Cinzel,monospace", fontSize: 17, fontWeight: 700, padding: "4px 12px", borderRadius: 6, border: `1px solid ${active ? "rgba(200,168,75,.38)" : "rgba(255,255,255,.05)"}`, background: active ? "rgba(200,168,75,.09)" : "rgba(0,0,0,.25)", color: low ? "#f44336" : active ? "#c8a84b" : "#4a4058", animation: low && active ? "clockLow .5s infinite" : "none", letterSpacing: "2px", flexShrink: 0 }}>{fmtTime(secs)}</div>;
  }

  function MoveList({ hist, active, onNav }) {
    return (
      <div style={{ flex: 1, overflowY: "auto", padding: "5px 3px" }}>
        {Array.from({ length: Math.ceil(hist.length / 2) }, (_, i) => {
          const wm = hist[i * 2];
          const bm = hist[i * 2 + 1];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
              <span style={{ width: 20, fontSize: 9, color: "#3a3050", textAlign: "right", paddingRight: 4, flexShrink: 0, fontFamily: "Cinzel,monospace" }}>{i + 1}.</span>
              {[wm, bm].map((mv, j) => mv ? (
                <div key={j} onClick={onNav ? () => onNav(i * 2 + j) : undefined}
                  style={{ flex: 1, padding: "3px 5px", borderRadius: 4, cursor: onNav ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "space-between", background: active === i * 2 + j ? `${mv.classification?.clr || "#c8a84b"}22` : "transparent", transition: "background .12s" }}>
                  <span style={{ fontSize: 11, color: active === i * 2 + j ? (mv.classification?.clr || "#c8a84b") : "#a09080", fontFamily: "Crimson Pro,monospace" }}>{mv.notation}</span>
                  {mv.classification?.sym && <span style={{ fontSize: 9, color: mv.classification.clr, fontWeight: 800, marginLeft: 2 }}>{mv.classification.sym}</span>}
                </div>
              ) : <div key={j} style={{ flex: 1 }} />)}
            </div>
          );
        })}
      </div>
    );
  }

  function PCard({ side, active }) {
    const isBot = side === botSide;
    const acc = side === "w" ? wAcc : bAcc;
    const secs = side === "w" ? wTime : bTime;
    const low = timeMode.secs && secs < 10;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 11px", background: active ? "rgba(200,168,75,.07)" : "rgba(255,255,255,.02)", border: `1px solid ${active ? "rgba(200,168,75,.24)" : "rgba(255,255,255,.05)"}`, borderRadius: 10, transition: "all .3s", flexShrink: 0 }}>
        <span style={{ fontSize: 19, flexShrink: 0 }}>{isBot ? bot.em : (side === "w" ? "♔" : "♚")}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "Cinzel,serif", fontSize: 11, fontWeight: 700, color: isBot ? bot.clr : "#d0c8b0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isBot ? bot.name : "You"}</div>
          <div style={{ fontSize: 9, color: "#4a4060", fontFamily: "Crimson Pro,serif" }}>{isBot ? `ELO ${bot.elo} · ${bot.tier}` : (side === "w" ? "White" : "Black")}</div>
        </div>
        {acc !== null && <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "Cinzel,serif", color: acc >= 80 ? "#4CAF50" : acc >= 60 ? "#FF9800" : "#f44336", flexShrink: 0 }}>{acc}%</div>}
        <Clock secs={secs} active={active} low={low} />
        {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8a84b", flexShrink: 0, boxShadow: "0 0 9px #c8a84b", animation: thinking && isBot ? "pulse .8s infinite" : "none" }} />}
      </div>
    );
  }

  // Menu state
  const [menuBot, setMenuBot] = useState(BOTS[5]);
  const [menuColor, setMenuColor] = useState("w");
  const [menuTime, setMenuTime] = useState(TIME_MODES[0]);
  const [filterTier, setFilterTier] = useState(null);
  const tiers = [...new Set(BOTS.map(b => b.tier))];

  if (screen === "intro") return <><style>{GCSS}</style><IntroScreen onEnter={() => setScreen("menu")} /></>;

  // Menu screen
  if (screen === "menu") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#080a12 0%,#0f1420 55%,#0c1018 100%)", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 12px 32px", fontFamily: "Cinzel,Georgia,serif", color: "#e0d8c8", overflowY: "auto" }}>
      <style>{GCSS}</style>
      {showSet && <SettingsPanel settings={settings} onSave={s => { setSettings(s); }} onClose={() => setShowSet(false)} />}
      <div style={{ width: "100%", maxWidth: 660, display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button onClick={() => setShowSet(true)} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, color: "#8a8070", padding: "7px 14px", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: 10, transition: "all .18s" }} onMouseEnter={e => { e.currentTarget.style.color = "#c8a84b"; }} onMouseLeave={e => { e.currentTarget.style.color = "#8a8070"; }}>⚙ Settings</button>
      </div>
      <div style={{ textAlign: "center", marginBottom: 24, animation: "fadeUp .65s ease" }}>
        <div style={{ fontSize: 44, animation: "bob 3.5s ease-in-out infinite", display: "inline-block", marginBottom: 4, filter: "drop-shadow(0 0 22px rgba(200,168,75,.55))", color: "#c8a84b" }}>♞</div>
        <h1 style={{ fontFamily: "Cinzel,serif", fontSize: "clamp(20px,4.5vw,38px)", fontWeight: 900, color: "#f0e8d0", textShadow: "0 0 36px rgba(200,168,75,.22)", letterSpacing: "2px" }}>CHESS TRAINER</h1>
        <div style={{ width: 100, height: 1, background: "linear-gradient(90deg,transparent,#c8a84b,transparent)", margin: "8px auto" }} />
        <p style={{ fontFamily: "Crimson Pro,serif", fontSize: 11, color: "#4a4858", letterSpacing: "4px", textTransform: "uppercase" }}>25 Bots · Quiescence Engine · CPL Analysis</p>
      </div>
      <div style={{ width: "100%", maxWidth: 660, marginBottom: 10, animation: "fadeUp .65s ease .05s both" }}>
        <p style={{ fontFamily: "Cinzel,serif", fontSize: 8, letterSpacing: "3px", textTransform: "uppercase", color: "#4a4858", marginBottom: 7 }}>Filter by Level</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {[null, ...tiers].map(t => <div key={t || "all"} onClick={() => setFilterTier(t)} style={{ padding: "4px 11px", borderRadius: 20, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "Cinzel,serif", background: filterTier === t ? "rgba(200,168,75,.17)" : "rgba(255,255,255,.03)", border: `1px solid ${filterTier === t ? "#c8a84b" : "rgba(255,255,255,.07)"}`, color: filterTier === t ? "#c8a84b" : "#6a6050", transition: "all .18s" }}>{t || "All Levels"}</div>)}
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: 660, background: "rgba(255,255,255,.018)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: "13px 11px", marginBottom: 13, animation: "fadeUp .65s ease .1s both" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(125px,1fr))", gap: 7 }}>
          {(filterTier ? BOTS.filter(b => b.tier === filterTier) : BOTS).map(b => (
            <div key={b.id} onClick={() => setMenuBot(b)} style={{ padding: "10px 8px", borderRadius: 10, cursor: "pointer", textAlign: "center", background: menuBot.id === b.id ? `linear-gradient(135deg,${b.clr}22,${b.clr}0d)` : "rgba(255,255,255,.02)", border: `2px solid ${menuBot.id === b.id ? b.clr : "rgba(255,255,255,.04)"}`, transition: "all .18s", boxShadow: menuBot.id === b.id ? `0 4px 18px ${b.clr}28` : "none" }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{b.em}</div>
              <div style={{ fontFamily: "Cinzel,serif", fontSize: 10, fontWeight: 700, color: menuBot.id === b.id ? b.clr : "#b0a890", marginBottom: 1 }}>{b.name}</div>
              <div style={{ fontSize: 9, color: menuBot.id === b.id ? b.clr + "99" : "#3a3040", fontFamily: "Crimson Pro,monospace" }}>ELO {b.elo}</div>
              <div style={{ fontSize: 7, color: menuBot.id === b.id ? b.clr + "77" : "#2a2030", marginTop: 2, textTransform: "uppercase", letterSpacing: ".5px" }}>{b.tier}</div>
            </div>
          ))}
        </div>
        {menuBot && <div style={{ marginTop: 9, padding: "8px 12px", background: "rgba(255,255,255,.02)", borderRadius: 8, fontFamily: "Crimson Pro,serif", fontSize: 11, color: "#6a6050", textAlign: "center", fontStyle: "italic" }}>{menuBot.em} {menuBot.name} — {menuBot.desc}</div>}
        {menuBot && <div style={{ marginTop: 6, display: "flex", gap: 7, justifyContent: "center" }}>
          {[["Depth", menuBot.depth + " ply"], ["Blunder", Math.round(menuBot.blunder * 100) + "%"], ["Sub-opt", Math.round(menuBot.subOpt * 100) + "%"]].map(([k, v]) => (
            <div key={k} style={{ background: "rgba(255,255,255,.03)", borderRadius: 6, padding: "4px 10px", textAlign: "center" }}>
              <div style={{ fontFamily: "Crimson Pro,serif", fontSize: 9, color: "#5a5060" }}>{k}</div>
              <div style={{ fontFamily: "Cinzel,serif", fontSize: 11, fontWeight: 700, color: "#c8a84b" }}>{v}</div>
            </div>
          ))}
        </div>}
      </div>
      <div style={{ width: "100%", maxWidth: 660, background: "rgba(255,255,255,.018)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: "13px 11px", marginBottom: 13, animation: "fadeUp .65s ease .15s both" }}>
        <p style={{ fontFamily: "Cinzel,serif", fontSize: 8, letterSpacing: "3px", textTransform: "uppercase", color: "#4a4858", marginBottom: 9 }}>Time Control</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(105px,1fr))", gap: 6 }}>
          {TIME_MODES.map(tm => <div key={tm.id} onClick={() => setMenuTime(tm)} style={{ padding: "8px 6px", borderRadius: 9, cursor: "pointer", textAlign: "center", background: menuTime.id === tm.id ? "rgba(200,168,75,.13)" : "rgba(255,255,255,.02)", border: `2px solid ${menuTime.id === tm.id ? "#c8a84b" : "rgba(255,255,255,.04)"}`, transition: "all .18s" }}><div style={{ fontFamily: "Cinzel,serif", fontSize: 10, fontWeight: 600, color: menuTime.id === tm.id ? "#c8a84b" : "#7a7060" }}>{tm.label}</div></div>)}
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: 660, background: "rgba(255,255,255,.018)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: "13px 11px", marginBottom: 22, animation: "fadeUp .65s ease .2s both" }}>
        <p style={{ fontFamily: "Cinzel,serif", fontSize: 8, letterSpacing: "3px", textTransform: "uppercase", color: "#4a4858", marginBottom: 9 }}>Play As</p>
        <div style={{ display: "flex", gap: 9 }}>
          {[{ v: "w", l: "White", s: "♔" }, { v: "b", l: "Black", s: "♚" }, { v: "r", l: "Random", s: "🎲" }].map(o => (
            <div key={o.v} onClick={() => setMenuColor(o.v)} style={{ flex: 1, padding: "12px 6px", borderRadius: 10, cursor: "pointer", textAlign: "center", background: menuColor === o.v ? "rgba(200,168,75,.12)" : "rgba(255,255,255,.02)", border: `2px solid ${menuColor === o.v ? "#c8a84b" : "rgba(255,255,255,.04)"}`, transition: "all .18s" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{o.s}</div>
              <div style={{ fontFamily: "Cinzel,serif", fontSize: 10, color: menuColor === o.v ? "#c8a84b" : "#6a6050", fontWeight: 600 }}>{o.l}</div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => { const pc = menuColor === "r" ? (Math.random() < .5 ? "w" : "b") : menuColor; startGame(menuBot, pc, menuTime); }}
        style={{ background: "linear-gradient(135deg,#c8a84b,#8a6820)", color: "#0d0900", border: "none", borderRadius: 4, padding: "14px 46px", fontFamily: "Cinzel,serif", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "3px", textTransform: "uppercase", boxShadow: "0 8px 28px rgba(200,168,75,.32)", transition: "all .22s", animation: "fadeUp .65s ease .25s both" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 14px 44px rgba(200,168,75,.48)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(200,168,75,.32)"; }}>Begin Game</button>
    </div>
  );

  // Review screen
  if (screen === "review") {
    const rBoard = revIdx < 0 ? INIT_BOARD() : history[revIdx]?.board || INIT_BOARD();
    const rLM = revIdx >= 0 ? [history[revIdx]?.fr, history[revIdx]?.fc, history[revIdx]?.tr, history[revIdx]?.tc] : null;
    const rEval = revIdx < 0 ? 0 : evalHist[revIdx + 1] || 0;
    const rWp = eToW(rEval);
    const maxE = Math.max(...evalHist.map(Math.abs), 200);
    const pts = evalHist.map((e, i) => { const x = (i / (evalHist.length - 1 || 1)) * 100; const y = 50 - ((Math.max(-maxE, Math.min(maxE, e)) / maxE) * 44); return [x, y]; });
    const rows = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const cols = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    return (
      <div style={{ height: "100vh", background: "#080a12", color: "#e0d8c8", fontFamily: "Cinzel,Georgia,serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <style>{GCSS}</style>
        {showSet && <SettingsPanel settings={settings} onSave={setSettings} onClose={() => setShowSet(false)} />}
        <div style={{ background: "#0d0f1a", borderBottom: "1px solid #1c1e2c", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 17, color: "#c8a84b" }}>♞</span>
            <span style={{ fontFamily: "Cinzel,serif", fontWeight: 700, fontSize: 13, color: "#c8a84b" }}>Game Review</span>
            {result && <span style={{ fontFamily: "Crimson Pro,serif", fontSize: 10, color: "#4a4858", borderLeft: "1px solid #1c1e2c", paddingLeft: 8 }}>{result}</span>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setShowSet(true)} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 7, color: "#8a8070", padding: "5px 10px", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: 9 }}>⚙</button>
            <button onClick={() => setScreen("menu")} style={{ background: "linear-gradient(135deg,#c8a84b,#8a6820)", color: "#0d0900", border: "none", borderRadius: 6, padding: "7px 15px", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: 10, fontWeight: 700 }}>New Game</button>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {!mob && <div style={{ width: 196, background: "#0d0f1a", borderRight: "1px solid #1c1e2c", padding: "13px", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {[{ l: "♔ White", acc: wAcc, c: "w" }, { l: `${bot.em} ${bot.name}`, acc: bAcc, c: "b", clr: bot.clr }].map((x, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.03)", border: "1px solid #1c1e2c", borderRadius: 10, padding: "12px" }}>
                <div style={{ fontFamily: "Crimson Pro,serif", fontSize: 10, color: "#6a6050", marginBottom: 6 }}>{x.l}</div>
                <div style={{ fontFamily: "Cinzel,serif", fontSize: 26, fontWeight: 900, color: x.acc >= 80 ? "#4CAF50" : x.acc >= 60 ? "#FF9800" : "#f44336", lineHeight: 1 }}>{x.acc ?? 0}%</div>
                <div style={{ fontFamily: "Crimson Pro,serif", fontSize: 9, color: "#4a4060", marginBottom: 8 }}>Accuracy</div>
                <div style={{ height: 4, background: "#1c1e2c", borderRadius: 2 }}><div style={{ height: "100%", width: `${x.acc ?? 0}%`, background: x.acc >= 80 ? "#4CAF50" : x.acc >= 60 ? "#FF9800" : "#f44336", borderRadius: 2, transition: "width .6s" }} /></div>
                <div style={{ marginTop: 10 }}>
                  {[["💎", "Brilliant", "#00BCD4"], ["✦", "Best", "#4CAF50"], ["✨", "Excellent", "#8BC34A"], ["⚠️", "Inaccuracy", "#FF9800"], ["❗", "Mistake", "#FF5722"], ["💥", "Blunder", "#F44336"]].map(([em, label, clr]) => {
                    const n = history.filter(m => cl(m.piece) === x.c && m.classification?.label === label).length;
                    return n > 0 ? <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><span style={{ fontFamily: "Crimson Pro,serif", fontSize: 10, color: "#7a7060" }}>{em} {label}</span><span style={{ fontFamily: "Cinzel,serif", fontSize: 11, fontWeight: 700, color: clr }}>{n}</span></div> : null;
                  })}
                </div>
                <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid #1c1e2c" }}>
                  <div style={{ fontFamily: "Crimson Pro,serif", fontSize: 9, color: "#5a5060", marginBottom: 2 }}>Avg CPL</div>
                  <div style={{ fontFamily: "Cinzel,serif", fontSize: 16, fontWeight: 800, color: "#c8a84b" }}>{(() => { const pm = history.filter(m => cl(m.piece) === x.c); return pm.length ? Math.round(pm.reduce((s, m) => s + (m.cpl || 0), 0) / pm.length) : 0; })()}</div>
                </div>
              </div>
            ))}
          </div>}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ height: 88, background: "#0d0f1a", borderBottom: "1px solid #1c1e2c", padding: "8px 14px", flexShrink: 0 }}>
              <svg width="100%" height="72" style={{ display: "block", cursor: "pointer" }}>
                <rect width="100%" height="100%" fill="#080a12" />
                <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#1c1e2c" strokeWidth="1" />
                <path d={`M${pts[0]?.[0]}% 50 ${pts.map(([x, y]) => `L${x}% ${y}`).join(" ")} L${pts[pts.length - 1]?.[0]}% 50 Z`} fill="rgba(200,168,75,.09)" />
                <polyline points={pts.map(([x, y]) => `${x}% ${y}`).join(" ")} fill="none" stroke="#c8a84b" strokeWidth="1.8" />
                {revIdx >= 0 && pts[revIdx + 1] && <circle cx={`${pts[revIdx + 1][0]}%`} cy={pts[revIdx + 1][1]} r="5" fill="#c8a84b" style={{ filter: "drop-shadow(0 0 6px #c8a84b)" }} />}
                {pts.map((_, i) => i > 0 && <rect key={i} x={`${(i / (pts.length || 1)) * 100}%`} y="0" width={`${100 / (pts.length || 1)}%`} height="72" fill="transparent" onClick={() => setRevIdx(i - 1)} />)}
              </svg>
            </div>
            <div style={{ padding: "6px 14px 4px", background: "#0d0f1a", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontFamily: "Crimson Pro,serif", fontSize: 10, color: "#c0b8a0" }}>♔ <b>{rWp}%</b></span>
                <span style={{ fontFamily: "Cinzel,serif", fontSize: 12, fontWeight: 700, color: "#c8a84b" }}>{fmtEval(rEval)}</span>
                <span style={{ fontFamily: "Crimson Pro,serif", fontSize: 10, color: "#5a6080" }}><b>{100 - rWp}%</b> ♚</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, overflow: "hidden", background: "#0c0e18", border: "1px solid #1c1e2c", position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${rWp}%`, background: "linear-gradient(90deg,#c89a28,#e8d888)", transition: "width .5s", borderRadius: "5px 0 0 5px" }} />
                <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${100 - rWp}%`, background: "#1a2030", transition: "width .5s", borderRadius: "0 5px 5px 0" }} />
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(200,168,75,.2)" }} />
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", overflow: "hidden" }}>
              <div style={{ width: "min(calc(100vh - 270px),460px)", aspectRatio: "1/1", borderRadius: 8, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.8)", border: "2px solid rgba(200,168,75,.12)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gridTemplateRows: "repeat(8,1fr)", width: "100%", height: "100%" }}>
                  {rows.flatMap(r => cols.map(c => {
                    const piece = rBoard[r][c];
                    const light = (r + c) % 2 === 1;
                    const isLM = rLM && (rLM[0] === r && rLM[1] === c || rLM[2] === r && rLM[3] === c);
                    let bg = light ? th.light : th.dark;
                    if (isLM) bg = light ? th.lm : th.lmD;
                    return <div key={`${r}-${c}`} style={{ background: bg, aspectRatio: "1/1", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {piece && <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", filter: cl(piece) === "w" ? "drop-shadow(0 2px 4px rgba(0,0,0,.9))" : "drop-shadow(0 2px 4px rgba(0,0,0,.7))" }}><PieceSVG piece={piece} style={settings.pieceStyle} /></div>}
                      {settings.showCoords && c === (flipped ? 7 : 0) && <span style={{ position: "absolute", top: 1, left: 2, fontSize: 8, fontWeight: 800, color: light ? th.dark : th.light, fontFamily: "monospace", opacity: .7 }}>{8 - r}</span>}
                      {settings.showCoords && r === (flipped ? 0 : 7) && <span style={{ position: "absolute", bottom: 1, right: 2, fontSize: 8, fontWeight: 800, color: light ? th.dark : th.light, fontFamily: "monospace", opacity: .7 }}>{String.fromCharCode(97 + c)}</span>}
                    </div>;
                  }))}
                </div>
              </div>
            </div>
            <div style={{ height: 48, background: "#0d0f1a", borderTop: "1px solid #1c1e2c", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flexShrink: 0 }}>
              {[["⏮", () => setRevIdx(-1)], ["◀", () => setRevIdx(i => Math.max(-1, i - 1))], ["▶", () => setRevIdx(i => Math.min(history.length - 1, i + 1))], ["⏭", () => setRevIdx(history.length - 1)]].map(([l, fn]) => (
                <button key={l} onClick={fn} style={{ background: "#181a26", border: "1px solid #282a3a", borderRadius: 7, color: "#c8a84b", padding: "7px 15px", cursor: "pointer", fontSize: 13, fontFamily: "Cinzel,monospace", transition: "background .15s" }} onMouseEnter={e => { e.currentTarget.style.background = "#222436"; }} onMouseLeave={e => { e.currentTarget.style.background = "#181a26"; }}>{l}</button>
              ))}
              <span style={{ fontFamily: "Crimson Pro,serif", color: "#3a3050", fontSize: 11, marginLeft: 7 }}>Move {revIdx + 1} / {history.length}</span>
            </div>
          </div>
          {!mob && <div style={{ width: 196, background: "#0d0f1a", borderLeft: "1px solid #1c1e2c", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "9px 13px", borderBottom: "1px solid #1c1e2c", fontFamily: "Cinzel,serif", fontSize: 8, letterSpacing: "3px", color: "#3a3050", textTransform: "uppercase" }}>Annotated Moves</div>
            <MoveList hist={history} active={revIdx} onNav={setRevIdx} />
          </div>}
        </div>
      </div>
    );
  }

  // Game screen (desktop / mobile)
  return (
    <div style={{ height: "100vh", background: "#080a12", color: "#e0d8c8", fontFamily: "Cinzel,Georgia,serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{GCSS}</style>
      {showSet && <SettingsPanel settings={settings} onSave={s => { setSettings(s); }} onClose={() => setShowSet(false)} />}
      <div style={{ background: "#0d0f1a", borderBottom: "1px solid #1c1e2c", padding: "7px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 15, color: "#c8a84b" }}>♞</span>
          <span style={{ fontFamily: "Cinzel,serif", fontWeight: 900, fontSize: 12, color: "#c8a84b", letterSpacing: "2px" }}>CHESS TRAINER</span>
          {!mob && <span style={{ fontFamily: "Crimson Pro,serif", fontSize: 9, color: "#2e2a38", borderLeft: "1px solid #1c1e2c", paddingLeft: 8 }}>{bot.em} {bot.name} · ELO {bot.elo} · Depth {bot.depth}</span>}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={() => setShowSet(true)} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 7, color: "#6a6080", padding: "5px 10px", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: 10 }}>⚙</button>
          {history.length > 1 && !result && <button onClick={takeback} style={{ background: "#181a26", border: "1px solid #282a3a", borderRadius: 7, color: "#a09080", padding: "5px 10px", cursor: "pointer", fontSize: 10, fontFamily: "Cinzel,serif", transition: "all .18s" }} onMouseEnter={e => { e.currentTarget.style.color = "#c8a84b"; }} onMouseLeave={e => { e.currentTarget.style.color = "#a09080"; }}>↩ Takeback</button>}
          {result && <button onClick={() => { setRevIdx(-1); setScreen("review"); }} style={{ background: "linear-gradient(135deg,#c8a84b,#8a6820)", color: "#0d0900", border: "none", borderRadius: 7, padding: "5px 11px", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: 10, fontWeight: 700 }}>📊 Review</button>}
          <button onClick={() => setScreen("menu")} style={{ background: "#181a26", border: "1px solid #1c1e2c", borderRadius: 7, color: "#6a6050", padding: "5px 10px", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: 10 }}>Menu</button>
        </div>
      </div>
      {result && <div style={{ background: "rgba(200,168,75,.08)", borderBottom: "1px solid rgba(200,168,75,.18)", padding: "7px 14px", textAlign: "center", animation: "slideDown .4s ease,winPulse 2s infinite", flexShrink: 0 }}><span style={{ fontFamily: "Cinzel,serif", fontSize: 12, fontWeight: 700, color: "#c8a84b" }}>{result}</span><span style={{ fontFamily: "Crimson Pro,serif", fontSize: 10, color: "#6a5a40", marginLeft: 10 }}>Tap Review to analyse</span></div>}
      {mob ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "5px 10px", flexShrink: 0 }}><PCard side={botSide} active={turn === botSide && !result} /></div>
          <div style={{ padding: "3px 10px 2px", flexShrink: 0 }}><EvalBar wp={winPct} ev={curEval} /></div>
          {chkFlag && !result && <div style={{ padding: "2px 10px", flexShrink: 0 }}><div style={{ background: "rgba(244,67,54,.12)", border: "1px solid rgba(244,67,54,.35)", borderRadius: 5, padding: "3px", textAlign: "center", animation: "pulse .7s infinite" }}><span style={{ fontFamily: "Cinzel,serif", fontSize: 10, fontWeight: 700, color: "#f44336" }}>CHECK!</span></div></div>}
          <div style={{ flexShrink: 0, padding: "4px 10px", position: "relative" }}>
            <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 8, overflow: "hidden", boxShadow: "0 10px 48px rgba(0,0,0,.8)", border: "2px solid rgba(200,168,75,.1)" }}>
              <Board brd={board} lm={lastMove} clickable={true} legalMoves={legal} sel={selSq} chk={chkFlag} curTurn={turn} anim={landSq} />
            </div>
            {lastCls?.sym && <div style={{ position: "absolute", top: 10, right: 16, background: "rgba(8,10,18,.92)", border: `1px solid ${lastCls.clr}55`, borderRadius: 7, padding: "4px 9px", zIndex: 5, animation: "slideDown .28s ease" }}><span style={{ fontFamily: "Cinzel,serif", fontSize: 10, fontWeight: 700, color: lastCls.clr }}>{lastCls.sym} {lastCls.label}</span></div>}
          </div>
          <div style={{ padding: "4px 10px 3px", flexShrink: 0 }}><PCard side={pColor} active={turn === pColor && !result} /></div>
          <div style={{ display: "flex", padding: "3px 10px 0", gap: 5, flexShrink: 0 }}>
            {[["moves", "Moves"], ["stats", "Stats"]].map(([v, l]) => <div key={v} onClick={() => setGameTab(v)} style={{ flex: 1, padding: "5px", textAlign: "center", borderRadius: "7px 7px 0 0", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: 10, fontWeight: 600, background: gameTab === v ? "#0d0f1a" : "transparent", border: gameTab === v ? "1px solid #1c1e2c" : "1px solid transparent", borderBottom: "none", color: gameTab === v ? "#c8a84b" : "#3a3050" }}>{l}</div>)}
          </div>
          <div style={{ flex: 1, background: "#0d0f1a", borderTop: "1px solid #1c1e2c", overflow: "hidden", margin: "0 10px", borderRadius: "0 0 8px 8px", display: "flex", flexDirection: "column" }}>
            {gameTab === "moves" ? <div ref={mlRef} style={{ flex: 1, overflowY: "auto", padding: "4px" }}><MoveList hist={history} active={history.length - 1} onNav={null} /></div>
              : <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginBottom: 8 }}>
                  {[["💎", "Brilliant", "#00BCD4"], ["✦", "Best", "#4CAF50"], ["💥", "Blunder", "#F44336"], ["❗", "Mistake", "#FF5722"], ["⚠️", "Inaccuracy", "#FF9800"], ["✨", "Excellent", "#8BC34A"]].map(([em, label, clr]) => (
                    <div key={label} style={{ background: "rgba(255,255,255,.02)", border: "1px solid #1c1e2c", borderRadius: 7, padding: "7px 4px", textAlign: "center" }}>
                      <div style={{ fontSize: 13 }}>{em}</div>
                      <div style={{ fontFamily: "Cinzel,serif", fontSize: 18, fontWeight: 800, color: history.filter(m => m.classification?.label === label && cl(m.piece) === pColor).length > 0 ? clr : "#2a2030" }}>{history.filter(m => m.classification?.label === label && cl(m.piece) === pColor).length}</div>
                      <div style={{ fontSize: 7, color: "#3a3050", marginTop: 1 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid #1c1e2c", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Cinzel,serif", fontSize: 8, color: "#3a3050", marginBottom: 2, letterSpacing: "2px" }}>ACCURACY</div>
                  <div style={{ fontFamily: "Cinzel,serif", fontSize: 30, fontWeight: 800, color: myAcc >= 80 ? "#4CAF50" : myAcc >= 60 ? "#FF9800" : "#f44336" }}>{myAcc ?? "-"}%</div>
                </div>
              </div>}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ width: 190, background: "#0d0f1a", borderRight: "1px solid #1c1e2c", display: "flex", flexDirection: "column", padding: "10px", gap: 8, flexShrink: 0 }}>
            <PCard side={botSide} active={turn === botSide && !result} />
            <PCard side={pColor} active={turn === pColor && !result} />
            {chkFlag && !result && <div style={{ background: "rgba(244,67,54,.1)", border: "1px solid rgba(244,67,54,.28)", borderRadius: 7, padding: "5px", textAlign: "center", animation: "pulse .8s infinite" }}><span style={{ fontFamily: "Cinzel,serif", fontSize: 10, fontWeight: 700, color: "#f44336" }}>CHECK!</span></div>}
            {history.length > 3 && <div style={{ flex: 1, background: "rgba(255,255,255,.02)", border: "1px solid #1c1e2c", borderRadius: 8, padding: "9px", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ fontFamily: "Cinzel,serif", fontSize: 8, letterSpacing: "3px", color: "#3a3050", textTransform: "uppercase", marginBottom: 7 }}>Your Stats</div>
              {[["💎", "Brilliant", "#00BCD4"], ["✦", "Best", "#4CAF50"], ["💥", "Blunder", "#F44336"], ["❗", "Mistake", "#FF5722"], ["⚠️", "Inaccuracy", "#FF9800"]].map(([em, label, clr]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontFamily: "Crimson Pro,serif", fontSize: 10, color: "#6a6050" }}>{em} {label}</span>
                  <span style={{ fontFamily: "Cinzel,serif", fontSize: 11, fontWeight: 700, color: history.filter(m => m.classification?.label === label && cl(m.piece) === pColor).length > 0 ? clr : "#2a2030" }}>{history.filter(m => m.classification?.label === label && cl(m.piece) === pColor).length}</span>
                </div>
              ))}
              {myAcc !== null && <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid #1c1e2c" }}>
                <div style={{ fontFamily: "Cinzel,serif", fontSize: 8, color: "#3a3050", marginBottom: 2, letterSpacing: "2px" }}>ACCURACY</div>
                <div style={{ fontFamily: "Cinzel,serif", fontSize: 24, fontWeight: 800, color: myAcc >= 80 ? "#4CAF50" : myAcc >= 60 ? "#FF9800" : "#f44336" }}>{myAcc}%</div>
              </div>}
            </div>}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 12px", overflow: "hidden", gap: 5 }}>
            <div style={{ width: "min(calc(100vh - 140px),555px)" }}><EvalBar wp={winPct} ev={curEval} /></div>
            <div style={{ width: "min(calc(100vh - 140px),555px)", flexShrink: 0, borderRadius: 8, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.9)", border: "2px solid rgba(200,168,75,.11)", animation: "boardIn .75s cubic-bezier(.34,1.2,.64,1) forwards", position: "relative" }}>
              <Board brd={board} lm={lastMove} clickable={true} legalMoves={legal} sel={selSq} chk={chkFlag} curTurn={turn} anim={landSq} />
              {lastCls?.sym && <div style={{ position: "absolute", top: 9, right: 9, background: "rgba(8,10,18,.91)", border: `1px solid ${lastCls.clr}55`, borderRadius: 8, padding: "5px 11px", backdropFilter: "blur(8px)", zIndex: 5, animation: "slideDown .28s ease" }}><div style={{ fontFamily: "Cinzel,serif", fontSize: 11, fontWeight: 700, color: lastCls.clr }}>{lastCls.sym} {lastCls.label}</div></div>}
            </div>
          </div>
          <div style={{ width: 190, background: "#0d0f1a", borderLeft: "1px solid #1c1e2c", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "8px 13px", borderBottom: "1px solid #1c1e2c", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "Cinzel,serif", fontSize: 8, letterSpacing: "3px", color: "#3a3050", textTransform: "uppercase" }}>Moves</span>
              <span style={{ fontFamily: "Cinzel,serif", fontSize: 12, fontWeight: 800, color: "#c8a84b" }}>{fmtEval(curEval)}</span>
            </div>
            <div ref={mlRef} style={{ flex: 1, overflowY: "auto" }}><MoveList hist={history} active={history.length - 1} onNav={null} /></div>
          </div>
        </div>
      )}
      {showPromo && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div style={{ background: "linear-gradient(135deg,#12151f,#0d0f1a)", border: "1px solid rgba(200,168,75,.3)", borderRadius: 16, padding: "24px", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,.9)" }}>
          <div style={{ fontFamily: "Cinzel,serif", fontSize: 10, color: "#6a6050", marginBottom: 14, letterSpacing: "3px", textTransform: "uppercase" }}>Promote Pawn</div>
          <div style={{ display: "flex", gap: 10 }}>
            {["Q", "R", "B", "N"].map(t => (
              <div key={t} onClick={() => { execMove(showPromo.fr, showPromo.fc, showPromo.tr, showPromo.tc, t); setShowPromo(null); }}
                style={{ width: 66, height: 66, background: "rgba(200,168,75,.08)", border: "1px solid rgba(200,168,75,.22)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .18s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,168,75,.22)"; e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(200,168,75,.08)"; e.currentTarget.style.transform = "scale(1)"; }}>
                <PieceSVG piece={pColor + t} style={settings.pieceStyle} />
              </div>
            ))}
          </div>
        </div>
      </div>}
    </div>
  );
}