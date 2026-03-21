import React, { useState, useEffect, useRef, useCallback } from "react";

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────── */
const GCSS=`
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#3a3050;border-radius:4px}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes introK{0%{opacity:0;transform:translateY(55px)scale(0.5)}65%{transform:translateY(-6px)scale(1.06)}100%{opacity:1;transform:translateY(0)scale(1)}}
@keyframes checkRing{0%,100%{box-shadow:inset 0 0 0 0 #f44336}50%{box-shadow:inset 0 0 26px #f44336,0 0 14px #f4433666}}
@keyframes clockLow{0%,100%{color:#f44336}50%{color:#ff8080}}
@keyframes boardIn{0%{opacity:0;transform:perspective(500px)rotateX(15deg)scale(0.9)}100%{opacity:1;transform:none}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes modalPop{0%{opacity:0;transform:scale(0.85) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes winGlow{0%,100%{box-shadow:0 0 16px rgba(200,168,75,0.22)}50%{box-shadow:0 0 42px rgba(200,168,75,0.58)}}
@keyframes pieceDrop{0%{transform:scale(0.68)translateY(-14px);opacity:0.5}65%{transform:scale(1.08)translateY(2px)}100%{transform:scale(1)translateY(0);opacity:1}}
`;

/* ─── CHESS ENGINE & HELPERS ────────────────────────────────────────── */
const sqN = (r, c) => String.fromCharCode(97 + c) + (8 - r);
const nameSq = (s) => [8 - parseInt(s[1]), s.charCodeAt(0) - 97];
const cl = p => p ? p[0] : null;
const tp = p => p ? p[1] : null;
const opp = c => c === "w" ? "b" : "w";
const cpB = b => b.map(r => [...r]);
const IB = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

const PVAL = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

const PST = {
  P: [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
  N: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
  B: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
  R: [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
  Q: [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
  K_MG: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]],
  K_EG: [[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]]
};

const INIT_BOARD = () => [
  ["bR","bN","bB","bQ","bK","bB","bN","bR"], ["bP","bP","bP","bP","bP","bP","bP","bP"],
  [null,null,null,null,null,null,null,null], [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null], [null,null,null,null,null,null,null,null],
  ["wP","wP","wP","wP","wP","wP","wP","wP"], ["wR","wN","wB","wQ","wK","wB","wN","wR"],
];
const INIT_CAST = () => ({ wK: true, wQ: true, bK: true, bQ: true });

/* ─── OPENING BOOK ──────────────────────────────────────────────────── */
const OPENINGS = {
  "": ["e2e4","d2d4","c2c4","g1f3"],
  "e2e4": ["c7c5","e7e5","e7e6","c7c6"],
  "d2d4": ["d7d5","g8f6","e7e6"],
  "c2c4": ["e7e5","c7c5","g8f6"],
  "g1f3": ["d7d5","g8f6","c7c5"],
  "e2e4 c7c5": ["g1f3","b1c3","c2c3"],
  "e2e4 c7c5 g1f3": ["d7d6","b8c6","e7e6"],
  "e2e4 c7c5 g1f3 d7d6": ["d2d4","f1b5"],
  "e2e4 c7c5 g1f3 d7d6 d2d4": ["c5d4"],
  "e2e4 c7c5 g1f3 d7d6 d2d4 c5d4": ["f3d4"],
  "e2e4 e7e5": ["g1f3","b1c3","f1c4"],
  "e2e4 e7e5 g1f3": ["b8c6","g8f6","d7d6"],
  "e2e4 e7e5 g1f3 b8c6": ["f1b5","f1c4","d2d4"],
  "e2e4 e7e6": ["d2d4","d2d3"],
  "e2e4 c7c6": ["d2d4","b1c3"],
  "d2d4 d7d5": ["c2c4","g1f3","c1f4"],
  "d2d4 g8f6": ["c2c4","g1f3","c1g5"],
};

function atkMoves(board, r, c) {
  const p = board[r][c]; if (!p) return [];
  const c0 = cl(p), t = tp(p), ms = [];
  const add = (tr, tc) => { if (!IB(tr, tc)) return false; const x = board[tr][tc]; if (x && cl(x) === c0) return false; ms.push([tr, tc]); return !x; };
  if (t === "P") { const d = c0 === "w" ? -1 : 1; if (IB(r + d, c - 1)) ms.push([r + d, c - 1]); if (IB(r + d, c + 1)) ms.push([r + d, c + 1]); }
  else if (t === "N") { [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => add(r + dr, c + dc)); }
  else if (t === "B") { [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => { let nr = r + dr, nc = c + dc; while (IB(nr, nc)) { if (!add(nr, nc)) break; nr += dr; nc += dc; } }); }
  else if (t === "R") { [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => { let nr = r + dr, nc = c + dc; while (IB(nr, nc)) { if (!add(nr, nc)) break; nr += dr; nc += dc; } }); }
  else if (t === "Q") { [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => { let nr = r + dr, nc = c + dc; while (IB(nr, nc)) { if (!add(nr, nc)) break; nr += dr; nc += dc; } }); }
  else if (t === "K") { [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => add(r + dr, c + dc)); }
  return ms;
}

function isAttacked(board, r, c, byColor) {
  for (let rr = 0; rr < 8; rr++) for (let cc = 0; cc < 8; cc++) {
    const p = board[rr][cc]; if (p && cl(p) === byColor && atkMoves(board, rr, cc).some(([mr, mc]) => mr === r && mc === c)) return true;
  }
  return false;
}

function pseudoMoves(board, r, c, ep, castling) {
  const p = board[r][c]; if (!p) return [];
  const c0 = cl(p), t = tp(p), ms = [];
  const add = (tr, tc) => { if (!IB(tr, tc)) return false; const x = board[tr][tc]; if (x && cl(x) === c0) return false; ms.push([tr, tc]); return !x; };
  if (t === "P") {
    const d = c0 === "w" ? -1 : 1, sr = c0 === "w" ? 6 : 1;
    if (IB(r + d, c) && !board[r + d][c]) { ms.push([r + d, c]); if (r === sr && !board[r + 2 * d][c]) ms.push([r + 2 * d, c]); }
    for (const dc of [-1, 1]) if (IB(r + d, c + dc)) { const x = board[r + d][c + dc]; if (x && cl(x) !== c0) ms.push([r + d, c + dc]); if (ep && ep[0] === r + d && ep[1] === c + dc) ms.push([r + d, c + dc]); }
  }
  else if (t === "N") { [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => add(r + dr, c + dc)); }
  else if (t === "B") { [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => { let nr = r + dr, nc = c + dc; while (IB(nr, nc)) { if (!add(nr, nc)) break; nr += dr; nc += dc; } }); }
  else if (t === "R") { [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => { let nr = r + dr, nc = c + dc; while (IB(nr, nc)) { if (!add(nr, nc)) break; nr += dr; nc += dc; } }); }
  else if (t === "Q") { [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => { let nr = r + dr, nc = c + dc; while (IB(nr, nc)) { if (!add(nr, nc)) break; nr += dr; nc += dc; } }); }
  else if (t === "K") {
    [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => add(r + dr, c + dc));
    const row = c0 === "w" ? 7 : 0;
    if (r === row && c === 4) {
      if (castling[c0 + "K"] && !board[row][5] && !board[row][6] && !isAttacked(board, row, 4, opp(c0)) && !isAttacked(board, row, 5, opp(c0)) && !isAttacked(board, row, 6, opp(c0))) ms.push([row, 6]);
      if (castling[c0 + "Q"] && !board[row][3] && !board[row][2] && !board[row][1] && !isAttacked(board, row, 4, opp(c0)) && !isAttacked(board, row, 3, opp(c0)) && !isAttacked(board, row, 2, opp(c0))) ms.push([row, 2]);
    }
  }
  return ms;
}

function findKing(board, c0) { for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === c0 + "K") return [r, c]; return [0, 0]; }
function inCheck(board, c0) { const [kr, kc] = findKing(board, c0); return isAttacked(board, kr, kc, opp(c0)); }

function applyMove(board, fr, fc, tr, tc, ep, castling, promo = null) {
  const nb = cpB(board), p = nb[fr][fc], c0 = cl(p), t = tp(p), nc = { ...castling }; let nep = null;
  const captured = nb[tr][tc]; nb[tr][tc] = p; nb[fr][fc] = null;
  if (t === "P" && ep && tr === ep[0] && tc === ep[1]) nb[c0 === "w" ? tr + 1 : tr - 1][tc] = null;
  if (t === "P" && Math.abs(tr - fr) === 2) nep = [(fr + tr) / 2, tc];
  if (t === "K") { if (tc - fc === 2) { nb[fr][5] = nb[fr][7]; nb[fr][7] = null; } if (fc - tc === 2) { nb[fr][3] = nb[fr][0]; nb[fr][0] = null; } nc[c0 + "K"] = false; nc[c0 + "Q"] = false; }
  if (t === "R") { if (fr === 7 && fc === 7) nc.wK = false; if (fr === 7 && fc === 0) nc.wQ = false; if (fr === 0 && fc === 7) nc.bK = false; if (fr === 0 && fc === 0) nc.bQ = false; }
  if (tr === 7 && tc === 7) nc.wK = false; if (tr === 7 && tc === 0) nc.wQ = false; if (tr === 0 && tc === 7) nc.bK = false; if (tr === 0 && tc === 0) nc.bQ = false;
  if (t === "P" && (tr === 0 || tr === 7)) nb[tr][tc] = c0 + (promo || "Q");
  return { board: nb, ep: nep, castling: nc, captured };
}

/* ─── ENGINE OPTIMIZATION: MOVE ORDERING (MVV-LVA) ─────────────────── */
function scoreMove(board, m) {
  let score = 0;
  const captured = board[m[2]][m[3]];
  // MVV-LVA score
  if (captured) score = 10 * PVAL[tp(captured)] - PVAL[tp(board[m[0]][m[1]])];
  // En-passant bonus
  if (!captured && tp(board[m[0]][m[1]]) === "P" && m[1] !== m[3]) score = 10 * PVAL.P - PVAL.P;
  if (m[4]) score += PVAL[m[4]]; // Promotion
  return score;
}

function legalMovesFor(board, r, c, ep, castling) {
  const p = board[r][c]; if (!p) return []; const c0 = cl(p), out = [];
  for (const [tr, tc] of pseudoMoves(board, r, c, ep, castling)) {
    const isPromo = tp(p) === "P" && (tr === 0 || tr === 7);
    for (const promo of (isPromo ? ["Q", "R", "B", "N"] : [null])) {
      const { board: nb } = applyMove(board, r, c, tr, tc, ep, castling, promo);
      if (!inCheck(nb, c0)) out.push([r, c, tr, tc, promo]);
    }
  }
  return out;
}

function allLegal(board, c0, ep, castling) {
  const ms = []; 
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (board[r][c] && cl(board[r][c]) === c0) legalMovesFor(board, r, c, ep, castling).forEach(m => ms.push(m)); 
  }
  return ms.sort((a, b) => scoreMove(board, b) - scoreMove(board, a));
}

// Dedicated fast capture generator for Quiescence Search
function allLegalCaptures(board, c0, ep, castling) {
  const ms = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (board[r][c] && cl(board[r][c]) === c0) {
      for (const [tr, tc] of pseudoMoves(board, r, c, ep, castling)) {
        const isEP = tp(board[r][c]) === "P" && ep && tr === ep[0] && tc === ep[1];
        if (board[tr][tc] || isEP) { // Must be a capture
          const isPromo = tp(board[r][c]) === "P" && (tr === 0 || tr === 7);
          const { board: nb } = applyMove(board, r, c, tr, tc, ep, castling, isPromo ? "Q" : null);
          if (!inCheck(nb, c0)) ms.push([r, c, tr, tc, isPromo ? "Q" : null]);
        }
      }
    }
  }
  return ms.sort((a, b) => scoreMove(board, b) - scoreMove(board, a));
}

function isInsufficientMaterial(board) {
  const pieces = [];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(board[r][c]) pieces.push(board[r][c]);
  if(pieces.length === 2) return true; // King vs King
  if(pieces.length === 3 && pieces.some(p => tp(p) === "N" || tp(p) === "B")) return true; // K+N or K+B vs K
  return false;
}

/* ─── TAPERED EVALUATION ────────────────────────────────────────────── */
function evalBoard(board) {
  let s = 0, phase = 0; 
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c]; if (!p) continue;
    const t = tp(p);
    if(t === "N" || t === "B") phase += 1;
    else if(t === "R") phase += 2;
    else if(t === "Q") phase += 4;
  }
  const egWeight = Math.max(0, Math.min(1, 1 - (phase / 24)));
  const mgWeight = 1 - egWeight;

  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c]; if (!p) continue;
    const c0 = cl(p), t = tp(p), pr = c0 === "w" ? r : 7 - r;
    const val = PVAL[t];
    let pstVal = 0;
    if (t === "K") pstVal = (PST.K_MG[pr][c] * mgWeight) + (PST.K_EG[pr][c] * egWeight);
    else pstVal = PST[t] ? PST[t][pr][c] : 0;
    s += (c0 === "w" ? 1 : -1) * (val + pstVal);
  }
  return s;
}

/* ─── MATERIAL TRACKER UI HELPER ────────────────────────────────────── */
function getMaterialDiff(board) {
  // Added K:0 to prevent NaN errors
  const counts = { w: { P:0,N:0,B:0,R:0,Q:0,K:0 }, b: { P:0,N:0,B:0,R:0,Q:0,K:0 } };
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
      const p = board[r][c];
      if(p) counts[cl(p)][tp(p)]++;
  }
  const diff = { w: [], b: [] };
  let wScore = 0, bScore = 0;
  ['Q','R','B','N','P'].forEach(t => {
      const w = counts.w[t], b = counts.b[t];
      if(w>b) { for(let i=0;i<w-b;i++) diff.w.push("w"+t); wScore += (w-b)*PVAL[t]; }
      if(b>w) { for(let i=0;i<b-w;i++) diff.b.push("b"+t); bScore += (b-w)*PVAL[t]; }
  });
  return { wPieces: diff.w, bPieces: diff.b, score: Math.round((wScore - bScore)/100) };
}

/* ─── BOT DIFFICULTY & QUIESCENCE MINIMAX ───────────────────────────── */
function gaussNoise(sigma) {
  if (sigma <= 0) return 0;
  const u1 = Math.max(1e-10, Math.random()), u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * sigma;
}

function biasedEval(board, matBias, posBias, noiseSigma) {
  let s = 0, phase = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c]; if (!p) continue;
    const t = tp(p);
    if(t === "N" || t === "B") phase += 1; else if(t === "R") phase += 2; else if(t === "Q") phase += 4;
  }
  const egWeight = Math.max(0, Math.min(1, 1 - (phase / 24)));
  const mgWeight = 1 - egWeight;

  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c]; if (!p) continue;
    const c0 = cl(p), t = tp(p), pr = c0 === "w" ? r : 7 - r;
    const matVal = PVAL[t] * matBias;
    let pstVal = 0;
    if (t === "K") pstVal = (PST.K_MG[pr][c] * mgWeight) + (PST.K_EG[pr][c] * egWeight);
    else pstVal = PST[t] ? PST[t][pr][c] : 0;
    pstVal *= posBias;
    const noise = noiseSigma > 0 ? gaussNoise(noiseSigma * 0.4) : 0;
    s += (c0 === "w" ? 1 : -1) * (matVal + pstVal + noise);
  }
  return s;
}

// Solves the Horizon Effect by playing out all captures at depth 0
function quiescence(board, alpha, beta, max, ep, castling, matBias, posBias, noise, qDepth = 0) {
  const stand_pat = biasedEval(board, matBias, posBias, noise);
  if (qDepth > 4) return stand_pat; // Hard cap QS
  
  if (max) {
    if (stand_pat >= beta) return beta;
    if (alpha < stand_pat) alpha = stand_pat;
  } else {
    if (stand_pat <= alpha) return alpha;
    if (beta > stand_pat) beta = stand_pat;
  }

  const ms = allLegalCaptures(board, max ? "w" : "b", ep, castling);
  for (const m of ms) {
    const { board: nb, ep: ne, castling: nc } = applyMove(board, m[0], m[1], m[2], m[3], ep, castling, m[4]);
    const score = quiescence(nb, alpha, beta, !max, ne, nc, matBias, posBias, noise, qDepth + 1);
    if (max) {
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    } else {
      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
  }
  return max ? alpha : beta;
}

function biasedMinimax(board, depth, alpha, beta, max, ep, castling, matBias, posBias, noise) {
  const c0 = max ? "w" : "b";
  if (depth === 0) return quiescence(board, alpha, beta, max, ep, castling, matBias, posBias, noise);
  
  const ms = allLegal(board, c0, ep, castling);
  if (!ms.length) return inCheck(board, c0) ? (max ? -50000 : 50000) : 0;
  
  if (max) {
    let best = -Infinity;
    for (const [fr, fc, tr, tc, promo] of ms) {
      const { board: nb, ep: ne, castling: nc } = applyMove(board, fr, fc, tr, tc, ep, castling, promo);
      best = Math.max(best, biasedMinimax(nb, depth - 1, alpha, beta, false, ne, nc, matBias, posBias, noise));
      alpha = Math.max(alpha, best); if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const [fr, fc, tr, tc, promo] of ms) {
    const { board: nb, ep: ne, castling: nc } = applyMove(board, fr, fc, tr, tc, ep, castling, promo);
    best = Math.min(best, biasedMinimax(nb, depth - 1, alpha, beta, true, ne, nc, matBias, posBias, noise));
    beta = Math.min(beta, best); if (beta <= alpha) break;
  }
  return best;
}

function eloToParams(elo) {
  const pts = [
    [400, { depth: 1, blunder: 0.80, noise: 310, mat: 1.6, pos: 0.06, book: 0.0 }],
    [800, { depth: 1, blunder: 0.38, noise: 195, mat: 1.35, pos: 0.24, book: 0.1 }],
    [1200, { depth: 2, blunder: 0.11, noise: 90, mat: 1.1, pos: 0.52, book: 0.4 }],
    [1600, { depth: 3, blunder: 0.03, noise: 26, mat: 1.0, pos: 0.82, book: 0.7 }],
    [2000, { depth: 3, blunder: 0.005, noise: 4, mat: 1.0, pos: 0.96, book: 0.9 }],
    [2800, { depth: 4, blunder: 0, noise: 0, mat: 1.0, pos: 1.0, book: 1.0 }]
  ];
  let lo = 0, hi = pts.length - 1;
  const clamped = Math.max(400, Math.min(2800, elo));
  while (lo < hi - 1) { const mid = (lo + hi) >> 1; if (pts[mid][0] <= clamped) lo = mid; else hi = mid; }
  const t = (clamped - pts[lo][0]) / (pts[hi][0] - pts[lo][0]), a = pts[lo][1], b = pts[hi][1];
  return { 
    depth: Math.round(a.depth + (b.depth - a.depth) * t), 
    blunder: a.blunder + (b.blunder - a.blunder) * t, 
    noise: a.noise + (b.noise - a.noise) * t,
    mat: a.mat + (b.mat - a.mat) * t,
    pos: a.pos + (b.pos - a.pos) * t,
    book: a.book + (b.book - a.book) * t
  };
}

function chooseBotMove(board, turn, ep, castling, elo, historyStr) {
  const ms = allLegal(board, turn, ep, castling);
  if (!ms.length) return null;
  const { depth, blunder, noise, mat, pos, book } = eloToParams(elo);
  const mx = turn === "w";

  if (Math.random() < book && OPENINGS[historyStr]) {
    const bookMoves = OPENINGS[historyStr];
    const target = bookMoves[Math.floor(Math.random() * bookMoves.length)];
    const [fr, fc] = nameSq(target.substring(0, 2));
    const [tr, tc] = nameSq(target.substring(2, 4));
    const promo = target.length === 5 ? target[4].toUpperCase() : null;
    const found = ms.find(m => m[0]===fr && m[1]===fc && m[2]===tr && m[3]===tc && m[4]===promo);
    if (found) return found;
  }

  if (Math.random() < blunder) return ms[Math.floor(Math.random() * ms.length)];

  let bestScore = mx ? -Infinity : Infinity;
  let bestMove = ms[0];
  let alpha = -Infinity;
  let beta = Infinity;

  const band = [];
  const tol = Math.max(3, noise * 0.15);

  for (const m of ms) {
    const { board: nb, ep: ne, castling: nc } = applyMove(board, m[0], m[1], m[2], m[3], ep, castling, m[4]);
    const score = biasedMinimax(nb, depth - 1, alpha, beta, !mx, ne, nc, mat, pos, noise);
    
    if (mx) {
      if (score > bestScore - tol) band.push({ m, score });
      if (score > bestScore) { bestScore = score; bestMove = m; }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (score < bestScore + tol) band.push({ m, score });
      if (score < bestScore) { bestScore = score; bestMove = m; }
      beta = Math.min(beta, bestScore);
    }
  }

  const validBand = band.filter(s => Math.abs(s.score - bestScore) <= tol);
  return validBand.length ? validBand[Math.floor(Math.random() * validBand.length)].m : bestMove;
}

// ═══════════════════════════════════════════════════════════
//  CLASSIFICATION & STATS
// ═══════════════════════════════════════════════════════════
function calcCPL(boardBefore, fr, fc, tr, tc, ep, castling, promo, mc) {
  const cands = allLegal(boardBefore, mc, ep, castling);
  if (!cands.length) return 0;
  
  // Tactical scan (Depth 1) to prevent false-flagging brilliant sacrifices
  const evals = cands.map(m => { 
      const { board: ab, ep: aep, castling: acast } = applyMove(boardBefore, m[0], m[1], m[2], m[3], ep, castling, m[4]); 
      return quiescence(ab, -Infinity, Infinity, mc !== "w", aep, acast, 1.0, 1.0, 0); 
  });
  
  const bestEval = mc === "w" ? Math.max(...evals) : Math.min(...evals);
  
  const { board: nb, ep: nep, castling: ncast } = applyMove(boardBefore, fr, fc, tr, tc, ep, castling, promo);
  const playedEval = quiescence(nb, -Infinity, Infinity, mc !== "w", nep, ncast, 1.0, 1.0, 0);
  
  const sign = mc === "w" ? 1 : -1;
  return Math.max(0, sign * (bestEval - playedEval));
}

function classifyMove(cpl, brilliant = false) {
  if (brilliant) return { label: "Brilliant", sym: "!!", clr: "#00BCD4" };
  if (cpl < 5) return { label: "Best", sym: "✦", clr: "#4CAF50" };
  if (cpl < 20) return { label: "Excellent", sym: "!", clr: "#8BC34A" };
  if (cpl < 50) return { label: "Good", sym: "", clr: "#CDDC39" };
  if (cpl < 100) return { label: "Inaccuracy", sym: "?!", clr: "#FF9800" };
  if (cpl < 200) return { label: "Mistake", sym: "?", clr: "#FF5722" };
  return { label: "Blunder", sym: "??", clr: "#F44336" };
}

function buildNotation(board, fr, fc, tr, tc, captured, nb, promo) {
  const p = board[fr][fc], t = tp(p), c0 = cl(p);
  if (t === "K" && tc - fc === 2) return "O-O"; 
  if (t === "K" && fc - tc === 2) return "O-O-O";
  const piece = t === "P" ? "" : t, fromF = t === "P" && captured ? String.fromCharCode(97 + fc) : "", cap = captured ? "x" : "", to = sqN(tr, tc);
  const promoStr = promo ? `=${promo}` : "";
  const nextC = opp(c0), nextMs = allLegal(nb, nextC, null, INIT_CAST());
  return `${piece}${fromF}${cap}${to}${promoStr}${inCheck(nb, nextC) ? (nextMs.length === 0 ? "#" : "+") : ""}`;
}

function calcAccuracy(moves, playerColor) {
  const pm = moves.filter(m => cl(m.piece) === playerColor);
  if (!pm.length) return 100;
  const avg = pm.reduce((s, m) => s + (m.cpl || 0), 0) / pm.length;
  return Math.min(100, Math.max(0, Math.round(103.1668 * Math.exp(-0.04354 * avg) - 3.1668)));
}

function formatEval(e) {
  if (e > 9000) return "+M" + Math.ceil((50000 - e) / 2);
  if (e < -9000) return "-M" + Math.ceil((50000 + e) / 2);
  return (e >= 0 ? "+" : "") + (e / 100).toFixed(1);
}

const evalToW = e => Math.min(99, Math.max(1, Math.round(50 + 50 * (2 / (1 + Math.exp(-e / 400)) - 1))));

/* ─── SOUND ENGINE ──────────────────────────────────────────────────── */
function useSound(enabled){
  const acRef=useRef(null);
  const getAC=()=>{
    if(!acRef.current)acRef.current=new(window.AudioContext||window.webkitAudioContext)();
    if(acRef.current.state==="suspended")acRef.current.resume();
    return acRef.current;
  };
  const thock=(ac,t0,freq,dur,gain)=>{
    const sr=ac.sampleRate,len=Math.floor(sr*dur),buf=ac.createBuffer(1,len,sr),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(len*0.25));
    const src=ac.createBufferSource();src.buffer=buf;
    const bp=ac.createBiquadFilter();bp.type="bandpass";bp.frequency.value=freq;bp.Q.value=1.5;
    const g=ac.createGain();g.gain.setValueAtTime(gain,t0);g.gain.exponentialRampToValueAtTime(0.001,t0+dur);
    src.connect(bp);bp.connect(g);g.connect(ac.destination);src.start(t0);
    const osc=ac.createOscillator();osc.type="sine";
    osc.frequency.setValueAtTime(freq*0.8,t0);osc.frequency.exponentialRampToValueAtTime(freq*0.5,t0+dur*2.0);
    const og=ac.createGain();og.gain.setValueAtTime(gain*0.15,t0);og.gain.exponentialRampToValueAtTime(0.001,t0+dur*2.0);
    osc.connect(og);og.connect(ac.destination);osc.start(t0);osc.stop(t0+dur*2.0);
  };
  return useCallback((type)=>{
    if(!enabled)return;
    try{
      const ac=getAC(),t=ac.currentTime;
      if(type==="move")        {thock(ac,t,300,0.06,0.6);}
      else if(type==="capture"){thock(ac,t,400,0.07,0.9); thock(ac,t+0.04,200,0.05,0.4);}
      else if(type==="castle") {thock(ac,t,320,0.06,0.7); thock(ac,t+0.1,280,0.06,0.5);}
      else if(type==="gameover"){[[261.6,0],[329.6,.11],[392,.22],[523.3,.33]].forEach(([f,d])=>{const o=ac.createOscillator();o.type="triangle";const g=ac.createGain();o.frequency.value=f;g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(0.17,t+d+0.042);g.gain.exponentialRampToValueAtTime(0.001,t+d+1.6);o.connect(g);g.connect(ac.destination);o.start(t+d);o.stop(t+d+1.7);});}
    }catch(e){}
  },[enabled]);
}

// ═══════════════════════════════════════════════════════════
//  BOTS & THEMES
// ═══════════════════════════════════════════════════════════
const BOTS=[
  {id:0, name:"BlunderKid A",  elo:400,  em:"🐣",clr:"#ef9a9a",tier:"Beginner",    desc:"Completely random — drops pieces every turn"},
  {id:1, name:"BlunderKid B",  elo:500,  em:"🐣",clr:"#ef9a9a",tier:"Beginner",    desc:"Still chaotic, occasional lucky saves"},
  {id:2, name:"RookieRobin A", elo:600,  em:"🐤",clr:"#FFCC80",tier:"Novice",      desc:"Basic piece safety, misses all forks"},
  {id:3, name:"RookieRobin B", elo:700,  em:"🐤",clr:"#FFCC80",tier:"Novice",      desc:"Develops pieces slowly, no tactics"},
  {id:4, name:"RookieRobin C", elo:750,  em:"🐤",clr:"#FFCC80",tier:"Novice",      desc:"Aware of pins, still overlooks skewers"},
  {id:5, name:"PawnPusher A",  elo:800,  em:"🐥",clr:"#FFB74D",tier:"Club Beg.",   desc:"Pushes pawns, misses 2-move combos"},
  {id:6, name:"PawnPusher B",  elo:900,  em:"🐥",clr:"#FFB74D",tier:"Club Beg.",   desc:"Sees one-movers, patchy development"},
  {id:7, name:"PawnPusher C",  elo:950,  em:"🐥",clr:"#FFB74D",tier:"Club Beg.",   desc:"Castles occasionally, weak endgame"},
  {id:8, name:"TacticSpy A",   elo:1000, em:"🦉",clr:"#FFA726",tier:"Class E",     desc:"Spots hanging pieces reliably"},
  {id:9, name:"TacticSpy B",   elo:1100, em:"🦉",clr:"#FFA726",tier:"Class E",     desc:"Finds basic forks and simple pins"},
  {id:10,name:"TacticSpy C",   elo:1200, em:"🦉",clr:"#FFA726",tier:"Class E",     desc:"Consistent 1-move tactics, weak endgame"},
  {id:11,name:"ClubPlayer A",  elo:1300, em:"♟", clr:"#A5D6A7",tier:"Class D",     desc:"Controls open files, pawn structure basics"},
  {id:12,name:"ClubPlayer B",  elo:1450, em:"♟", clr:"#A5D6A7",tier:"Class D",     desc:"Castles early, semi-solid middlegame"},
  {id:13,name:"PosMind A",     elo:1550, em:"🦅",clr:"#66BB6A",tier:"Class C",     desc:"Outpost knights, piece coordination"},
  {id:14,name:"PosMind B",     elo:1650, em:"🦅",clr:"#66BB6A",tier:"Class C",     desc:"Solid positional play, rare blunders"},
  {id:15,name:"PosMind C",     elo:1750, em:"🦅",clr:"#66BB6A",tier:"Class C",     desc:"Understands pawn majorities"},
  {id:16,name:"ExpertA",       elo:1850, em:"🏅",clr:"#42A5F5",tier:"Expert",      desc:"Long-range planning, prophylaxis"},
  {id:17,name:"ExpertB",       elo:2000, em:"🏅",clr:"#42A5F5",tier:"Expert",      desc:"Deep calculation, essentially blunder-free"},
  {id:18,name:"FM-Rook A",     elo:2100, em:"🎓",clr:"#CE93D8",tier:"FIDE Master", desc:"FM strength — all endgame types"},
  {id:19,name:"FM-Rook B",     elo:2250, em:"🎓",clr:"#CE93D8",tier:"FIDE Master", desc:"Sharp tactical play, opening prep"},
  {id:20,name:"IM-Knight A",   elo:2350, em:"🧑‍🏫",clr:"#AB47BC",tier:"Intl Master","desc":"Dynamic sacrifices, complex positions"},
  {id:21,name:"IM-Knight B",   elo:2450, em:"🧑‍🏫",clr:"#AB47BC",tier:"Intl Master","desc":"GM threshold — near-flawless play"},
  {id:22,name:"GM-Dragon A",   elo:2600, em:"👑",clr:"#FFD54F",tier:"Grandmaster", desc:"GM strength with theoretical depth"},
  {id:23,name:"GM-Dragon B",   elo:2750, em:"👑",clr:"#FFD54F",tier:"Grandmaster", desc:"Super-GM level, deep opening prep"},
  {id:24,name:"EliteEngine",   elo:2800, em:"🤖",clr:"#e040fb",tier:"Super GM",    desc:"2800 FIDE — near engine-level play"},
];

const TIME_MODES=[
  {id:"inf",label:"♾ Unlimited", secs:0},
  {id:"1",  label:"⚡ Bullet 1'", secs:60},
  {id:"2",  label:"⚡ Bullet 2'", secs:120},
  {id:"3",  label:"🔥 Blitz 3'",  secs:180},
  {id:"5",  label:"🔥 Blitz 5'",  secs:300},
  {id:"10", label:"♟ Rapid 10'", secs:600},
  {id:"15", label:"♟ Rapid 15'", secs:900},
];

const BOARD_THEMES={
  classic:  {name:"Classic Wood",  light:"#f0d9b5",dark:"#b58863",sel:"#f6f669",selD:"#d6d649",lm:"#cdd26a",dmLM:"#aaa23a",dot:"rgba(0,0,0,0.19)"},
  green:    {name:"Tournament",    light:"#eeeed2",dark:"#769656",sel:"#f0f04a",selD:"#d0d03a",lm:"#baca2b",dmLM:"#9a8a1b",dot:"rgba(0,0,0,0.17)"},
  ocean:    {name:"Ocean",         light:"#dce8f0",dark:"#4a7aac",sel:"#a8d8f0",selD:"#88b8d0",lm:"#60b8e0",dmLM:"#4098c0",dot:"rgba(0,0,50,0.18)"},
  midnight: {name:"Midnight",      light:"#8090a4",dark:"#2a3a54",sel:"#6090c0",selD:"#4070a0",lm:"#406890",dmLM:"#204870",dot:"rgba(0,0,0,0.25)"},
  walnut:   {name:"Walnut",        light:"#deb887",dark:"#7b3a10",sel:"#e8c040",selD:"#c8a020",lm:"#c89820",dmLM:"#a87810",dot:"rgba(0,0,0,0.20)"},
  emerald:  {name:"Emerald",       light:"#e8f5ea",dark:"#2e7d44",sel:"#aaee88",selD:"#8ace68",lm:"#80cc66",dmLM:"#60ac46",dot:"rgba(0,40,0,0.17)"},
  slate:    {name:"Slate",         light:"#c8d0d8",dark:"#4e5a68",sel:"#90b0cc",selD:"#7090ac",lm:"#7098b8",dmLM:"#507898",dot:"rgba(0,0,0,0.17)"},
  rose:     {name:"Rose",          light:"#f5dede",dark:"#b85050",sel:"#f0a0a0",selD:"#d08080",lm:"#e08080",dmLM:"#c06060",dot:"rgba(40,0,0,0.16)"},
  royal:    {name:"Royal Purple",  light:"#ddd0f0",dark:"#5a3a9a",sel:"#c0a0f0",selD:"#a080d0",lm:"#a078e0",dmLM:"#8058c0",dot:"rgba(20,0,40,0.18)"},
  arctic:   {name:"Arctic",        light:"#e4eff8",dark:"#4872a8",sel:"#b0d4f0",selD:"#90b4d0",lm:"#80b8e0",dmLM:"#6098c0",dot:"rgba(0,0,40,0.16)"},
};

// ═══════════════════════════════════════════════════════════
//  SVG COMPONENTS 
// ═══════════════════════════════════════════════════════════
function PieceSVG({ piece, pStyle="merida", size="92%" }) {
  if (!piece) return null;
  const isW = piece[0] === "w", t = piece[1];

  const C={
    merida:{ fill:isW?"#fff":"#222", strk:isW?"#000":"#fff", sw:1.5, hl:isW?"#fff":"#444" },
    neo:   { fill:isW?"#fff":"#181818", strk:isW?"#000":"#ccc", sw:2.5, hl:isW?"#fff":"#181818" },
    wood:  { fill:isW?"#e4ba72":"#3d1f05", strk:isW?"#4a2808":"#a87840", sw:1.8, hl:isW?"#f0d090":"#5a3010" },
  }[pStyle] || { fill:"#fff", strk:"#000", sw:1.5, hl:"#fff" };

  const P={ fill:C.fill, stroke:C.strk, strokeWidth:C.sw, strokeLinejoin:"round", strokeLinecap:"round" };
  const H={ fill:C.hl };

  const shapes={
    P:(<g><path d="M 22.5 9 C 19.5 9 17.5 11.5 17.5 14.5 C 17.5 17.5 20 20 22.5 20 C 25 20 27.5 17.5 27.5 14.5 C 27.5 11.5 25.5 9 22.5 9 z M 22.5 20 C 19 20 15 22 15 25 C 15 28 17 31 17 31 L 28 31 C 28 31 30 28 30 25 C 30 22 26 20 22.5 20 z M 14 31.5 L 31 31.5 L 31 34 L 14 34 L 14 31.5 z M 11 34.5 L 34 34.5 L 34 38 L 11 38 L 11 34.5 z" {...P}/></g>),
    N:(<g><path d="M 22 10 C 32 10 31 17 30 20 C 29 23 27 24 25 25 C 25 25 27 28 27 31 L 18 31 C 18 28 16 26 15 25 C 14 24 12 23 11 20 C 10 17 12 10 22 10 z M 14 31.5 L 31 31.5 L 31 34 L 14 34 L 14 31.5 z M 11 34.5 L 34 34.5 L 34 38 L 11 38 L 11 34.5 z" {...P}/> <circle cx="17" cy="16" r="1.5" fill={C.strk}/> <path d="M 23 14 L 27 18" fill="none" stroke={C.strk} strokeWidth="1.5"/></g>),
    B:(<g><path d="M 22.5 6 C 21 6 20 7.5 20 9 C 20 10.5 21 12 22.5 12 C 24 12 25 10.5 25 9 C 25 7.5 24 6 22.5 6 z M 22.5 12 C 18 15 15 22 17 26 C 18 28 20 31 20 31 L 25 31 C 25 31 27 28 28 26 C 30 22 27 15 22.5 12 z M 14 31.5 L 31 31.5 L 31 34 L 14 34 L 14 31.5 z M 11 34.5 L 34 34.5 L 34 38 L 11 38 L 11 34.5 z M 22.5 16 L 22.5 22 M 19.5 19 L 25.5 19" {...P}/></g>),
    R:(<g><path d="M 14 13 L 14 17 L 17 17 L 17 13 L 20 13 L 20 17 L 25 17 L 25 13 L 28 13 L 28 17 L 31 17 L 31 13 Z M 15 17 L 17 31 L 28 31 L 30 17 Z M 14 31.5 L 31 31.5 L 31 34 L 14 34 L 14 31.5 z M 11 34.5 L 34 34.5 L 34 38 L 11 38 L 11 34.5 z" {...P}/></g>),
    Q:(<g><path d="M 10 12 L 14 26 L 19 10 L 22.5 26 L 26 10 L 31 26 L 35 12 L 31 31 L 14 31 Z M 14 31.5 L 31 31.5 L 31 34 L 14 34 L 14 31.5 z M 11 34.5 L 34 34.5 L 34 38 L 11 38 L 11 34.5 z" {...P}/> <circle cx="10" cy="11" r="2" {...H}/> <circle cx="19" cy="9" r="2" {...H}/> <circle cx="26" cy="9" r="2" {...H}/> <circle cx="35" cy="11" r="2" {...H}/></g>),
    K:(<g><path d="M 22.5 6 L 22.5 14 M 19 10 L 26 10 M 15 17 C 15 17 18 14 22.5 14 C 27 14 30 17 30 17 L 30 31 L 15 31 Z M 14 31.5 L 31 31.5 L 31 34 L 14 34 L 14 31.5 z M 11 34.5 L 34 34.5 L 34 38 L 11 38 L 11 34.5 z" {...P}/></g>)
  };

  const dropShadow = pStyle !== "neo" 
    ? `drop-shadow(0 ${isW?2:3}px ${isW?3:4}px rgba(0,0,0,${isW?0.35:0.6}))` 
    : "none";

  return (
    <svg viewBox="0 0 45 45" style={{ width: size, height: size, display: "block", overflow: "visible", filter: dropShadow }} xmlns="http://www.w3.org/2000/svg">
      {shapes[t]}
    </svg>
  );
}

const DEFAULT_SETTINGS={boardTheme:"classic",pieceStyle:"merida",sounds:true,showLegal:true,showCoords:true,autoQueen:false};
function loadSettings(){try{const s=localStorage.getItem("ct_s");return s?{...DEFAULT_SETTINGS,...JSON.parse(s)}:DEFAULT_SETTINGS;}catch{return DEFAULT_SETTINGS;}}
function saveSettings(s){try{localStorage.setItem("ct_s",JSON.stringify(s));}catch{}}

// ═══════════════════════════════════════════════════════════
//  MAIN REACT APP
// ═══════════════════════════════════════════════════════════
export default function ChessApp(){
  const[screen,    setScreen]   =useState("intro");
  const[board,     setBoard]    =useState(INIT_BOARD());
  const[turn,      setTurn]     =useState("w");
  const[selSq,     setSelSq]    =useState(null);
  const[legal,     setLegal]    =useState([]);
  const[ep,        setEp]       =useState(null);
  const[castling,  setCastling] =useState(INIT_CAST());
  const[lastMove,  setLastMove] =useState(null);
  const[result,    setResult]   =useState(null);
  const[chkFlag,   setChkFlag]  =useState(false);
  const[thinking,  setThinking] =useState(false);
  const[history,   setHistory]  =useState([]);
  const[evalHist,  setEvalHist] =useState([0]);
  const[bot,       setBot]      =useState(BOTS[5]);
  const[pColor,    setPColor]   =useState("w");
  const[showPromo, setShowPromo]=useState(null);
  const[gameTab,   setGameTab]  =useState("moves");
  const[timeMode,  setTimeMode] =useState(TIME_MODES[0]);
  const[wTime,     setWTime]    =useState(0);
  const[bTime,     setBTime]    =useState(0);
  const[timerOn,   setTimerOn]  =useState(false);
  const[landSq,    setLandSq]   =useState(null);
  const[posHist,   setPosHist]  =useState([]);
  const[halfClock, setHalfClock]=useState(0);
  const[settings,  setSettings] =useState(loadSettings);
  const[showSet,   setShowSet]  =useState(false);
  const[vw,        setVw]       =useState(window.innerWidth);
  const mlRef=useRef(null);
  
  useEffect(()=>{const f=()=>setVw(window.innerWidth);window.addEventListener("resize",f);return()=>window.removeEventListener("resize",f);},[]);
  const mob=vw<700;
  const playSound=useSound(settings.sounds);
  const th=BOARD_THEMES[settings.boardTheme]||BOARD_THEMES.classic;

  /* Clock */
  useEffect(()=>{
    if(!timerOn||!timeMode.secs||result)return;
    const t=setInterval(()=>{
      if(turn==="w")setWTime(p=>{if(p<=1){setResult("Black wins on time! ⏱");setTimerOn(false);playSound("gameover");return 0;}return p-1;});
      else setBTime(p=>{if(p<=1){setResult("White wins on time! ⏱");setTimerOn(false);playSound("gameover");return 0;}return p-1;});
    },1000);
    return()=>clearInterval(t);
  },[timerOn,turn,result,timeMode]);

  function startGame(b,pc,tm){
    const ib=INIT_BOARD(),ic=INIT_CAST();
    setBoard(ib);setTurn("w");setSelSq(null);setLegal([]);setEp(null);setCastling(ic);
    setLastMove(null);setResult(null);setChkFlag(false);setThinking(false);
    setHistory([]);setEvalHist([0]);setBot(b);setPColor(pc);
    setTimeMode(tm);setWTime(tm.secs);setBTime(tm.secs);setTimerOn(!!tm.secs);
    setPosHist([posHash(ib,"w",ic,null)]);setHalfClock(0);
    setScreen("game");setGameTab("moves");setLandSq(null);
  }

  /* Bot move */
  useEffect(()=>{
    if(screen!=="game"||turn===pColor||result)return;
    setThinking(true);
    const delay=1000+Math.random()*600;
    const t=setTimeout(()=>{
      const historyStr = history.map(h => sqN(h.fr,h.fc) + sqN(h.tr,h.tc)).join(" ");
      const m=chooseBotMove(board,turn,ep,castling,bot.elo,historyStr);
      if(m)execMove(m[0],m[1],m[2],m[3],m[4]);
      setThinking(false);
    },delay);
    return()=>clearTimeout(t);
  },[turn,screen,result,board]);

  function execMove(fr,fc,tr,tc,promo){
    const cpl=calcCPL(board,fr,fc,tr,tc,ep,castling,promo,cl(board[fr][fc]));
    const prevEval=evalBoard(board);

    const{board:nb,ep:nep,castling:nc,captured}=applyMove(board,fr,fc,tr,tc,ep,castling,promo);
    const ne=evalBoard(nb);
    const mc=cl(board[fr][fc]);

    const capVal=captured?PVAL[tp(captured)]||0:0;
    const evalSwing=mc==="w"?(ne-prevEval):(prevEval-ne);
    const isBrill=cpl<=5&&capVal>=300&&evalSwing>=150&&!!captured;
    const cls=classifyMove(cpl,isBrill);
    const notation=buildNotation(board,fr,fc,tr,tc,captured,nb,promo);
    const isCastle=tp(board[fr][fc])==="K"&&Math.abs(tc-fc)===2;
    const isPawn=tp(board[fr][fc])==="P";
    const newHalf=(captured||isPawn)?0:halfClock+1;
    const newPos=posHash(nb,opp(mc),nc,nep);
    const newPosHist=[...posHist,newPos];

    if(captured)playSound("capture");
    else if(isCastle)playSound("castle");
    else playSound("move");

    const rec={fr,fc,tr,tc,piece:board[fr][fc],captured,notation,classification:cls,eval:ne,cpl,board:nb,ep:nep,castling:nc};
    setBoard(nb);setEp(nep);setCastling(nc);setLastMove([fr,fc,tr,tc]);
    setLandSq(`${tr}-${tc}`);setSelSq(null);setLegal([]);
    setHistory(h=>[...h,rec]);setEvalHist(e=>[...e,ne]);
    setHalfClock(newHalf);setPosHist(newPosHist);

    if (isInsufficientMaterial(nb)) { setResult("Draw by insufficient material! 🤝"); setTimerOn(false); playSound("gameover"); return; }
    if(newHalf>=100){setResult("Draw by 50-move rule! 🤝");setTimerOn(false); playSound("gameover"); return;}
    if(newPosHist.filter(p=>p===newPos).length>=3){setResult("Draw by threefold repetition! 🤝");setTimerOn(false); playSound("gameover"); return;}
    
    const nt=opp(mc),nm=allLegal(nb,nt,nep,nc);
    if(!nm.length){
      const chk=inCheck(nb,nt);
      setResult(chk?`${mc==="w"?"White":"Black"} wins by checkmate! ♟`:"Draw by stalemate! 🤝");
      setTimerOn(false);setChkFlag(false);playSound("gameover");
    }else{const chk=inCheck(nb,nt);setChkFlag(chk);setTurn(nt);}
  }

  function handleSq(r,c){
    if(thinking||result||screen!=="game"||turn!==pColor)return;
    const piece=board[r][c];
    if(selSq){
      if(legal.some(m=>m[2]===r&&m[3]===c)){
        const here=legal.filter(m=>m[2]===r&&m[3]===c);
        if(here[0][4]!==null&&!settings.autoQueen){setShowPromo({fr:selSq[0],fc:selSq[1],tr:r,tc:c});return;}
        execMove(selSq[0],selSq[1],r,c,settings.autoQueen?null:here[0][4]);return;
      }
      if(piece&&cl(piece)===pColor){setSelSq([r,c]);setLegal(legalMovesFor(board,r,c,ep,castling));return;}
      setSelSq(null);setLegal([]);return;
    }
    if(piece&&cl(piece)===pColor){setSelSq([r,c]);setLegal(legalMovesFor(board,r,c,ep,castling));}
  }

  function takeback(){
    if(history.length<1||result)return;
    const steps=turn===pColor?Math.min(2,history.length):Math.min(1,history.length);
    const nh=history.slice(0,-steps),neh=evalHist.slice(0,-steps);
    if(!nh.length){const ib=INIT_BOARD(),ic=INIT_CAST();setBoard(ib);setEp(null);setCastling(ic);setTurn("w");setLastMove(null);setChkFlag(false);setPosHist([posHash(ib,"w",ic,null)]);setHalfClock(0);}
    else{const last=nh[nh.length-1];setBoard(last.board);setEp(last.ep);setCastling(last.castling);setTurn(opp(cl(last.piece)));setLastMove([last.fr,last.fc,last.tr,last.tc]);setChkFlag(inCheck(last.board,opp(cl(last.piece))));}
    setHistory(nh);setEvalHist(neh);setSelSq(null);setLegal([]);setResult(null);setLandSq(null);playSound("move");
  }

  useEffect(()=>{if(mlRef.current)mlRef.current.scrollTop=mlRef.current.scrollHeight;},[history]);

  const curEval=evalHist[evalHist.length-1];
  const winPct=eToW(curEval);
  const flipped=pColor==="b";
  
  // FIX: Bot Accuracy defined to prevent Game Over Crash
  const wAcc=history.length?calcAccuracy(history,"w"):null;
  const bAcc=history.length?calcAccuracy(history,"b"):null;
  const myAcc=pColor==="w"?wAcc:bAcc;
  const botAcc=pColor==="w"?bAcc:wAcc; 

  const lastCls=history.length?history[history.length-1].classification:null;
  const botSide=opp(pColor);
  const matTracker=getMaterialDiff(board);

  /* ── Board component ───────────────────────────────────────────────────── */
  function Board({brd,lm,clickable,legalMoves,sel,chk,curTurn,anim}){
    const rows=flipped?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
    const cols=flipped?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
    return(
      <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gridTemplateRows:"repeat(8,1fr)",width:"100%",aspectRatio:"1/1",overflow:"hidden",borderRadius:6}}>
        {rows.flatMap(r=>cols.map(c=>{
          const piece=brd[r][c],light=(r+c)%2===1;
          const isSel=sel&&sel[0]===r&&sel[1]===c;
          const isLM=lm&&(lm[0]===r&&lm[1]===c||lm[2]===r&&lm[3]===c);
          const isDot=settings.showLegal&&legalMoves&&legalMoves.some(m=>m[2]===r&&m[3]===c);
          const kChk=chk&&piece===curTurn+"K";
          const isAnim=anim===`${r}-${c}`;
          let bg=light?th.light:th.dark;
          if(isLM)bg=light?th.lm:th.dmLM;
          if(isSel)bg=light?th.sel:th.selD;

          // Drag & Drop mechanics
          const canDrag = clickable && piece && cl(piece) === curTurn && curTurn === pColor;

          return(
            <div key={`${r}-${c}`} 
              onClick={clickable?()=>handleSq(r,c):undefined}
              draggable={canDrag}
              onDragStart={(e) => {
                if(clickable) {
                  e.dataTransfer.setData("text/plain", `${r},${c}`);
                  if (!selSq || selSq[0] !== r || selSq[1] !== c) handleSq(r, c);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if(clickable) {
                  const data = e.dataTransfer.getData("text/plain");
                  if (data) {
                    const [fr, fc] = data.split(",").map(Number);
                    if (fr !== r || fc !== c) handleSq(r, c); 
                  }
                }
              }}
              style={{background:bg,aspectRatio:"1/1",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",cursor:canDrag?"grab":(clickable?"pointer":"default"),animation:kChk?"checkRing .9s infinite":"none"}}>
              
              {isDot&&(piece
                ?<div style={{position:"absolute",inset:3,border:"3px solid rgba(0,0,0,0.22)",borderRadius:3,pointerEvents:"none",zIndex:1}}/>
                :<div style={{width:"30%",height:"30%",borderRadius:"50%",background:th.dot,pointerEvents:"none",zIndex:1}}/>
              )}
              
              {piece&&(
                <div style={{position:"relative",zIndex:2,width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",
                  transform:isSel?"scale(1.1) translateY(-2px)":"scale(1)",transition:"transform .1s ease",
                  animation:isAnim?"pieceDrop .28s cubic-bezier(0.34,1.56,0.64,1) forwards":"none",
                }}>
                  <PieceSVG piece={piece} pStyle={settings.pieceStyle}/>
                </div>
              )}
              {settings.showCoords&&c===(flipped?7:0)&&<span style={{position:"absolute",top:1,left:2,fontSize:9,fontWeight:800,color:light?th.dark:th.light,fontFamily:"monospace",pointerEvents:"none",opacity:.72}}>{8-r}</span>}
              {settings.showCoords&&r===(flipped?0:7)&&<span style={{position:"absolute",bottom:1,right:2,fontSize:9,fontWeight:800,color:light?th.dark:th.light,fontFamily:"monospace",pointerEvents:"none",opacity:.72}}>{String.fromCharCode(97+c)}</span>}
            </div>
          );
        }))}
      </div>
    );
  }

  /* ── Eval bar ──────────────────────────────────────────────────────────── */
  function EvalBar({wp,ev}){
    return(
      <div style={{width:"100%",marginBottom:6}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,padding:"0 2px"}}>
          <span style={{fontFamily:"Crimson Pro,serif",fontSize:11,color:"#c0b8a0"}}>♔ <b style={{color:"#e8dfc8"}}>{wp}%</b></span>
          <span style={{fontFamily:"Cinzel,monospace",fontSize:13,fontWeight:700,color:ev>50?"#f0ead0":ev<-50?"#6080b0":"#c8a84b",background:"rgba(255,255,255,0.04)",padding:"2px 10px",borderRadius:4,border:"1px solid rgba(255,255,255,0.06)"}}>{fmtEval(ev)}</span>
          <span style={{fontFamily:"Crimson Pro,serif",fontSize:11,color:"#4a5070"}}><b style={{color:"#5a6090"}}>{100-wp}%</b> ♚</span>
        </div>
        <div style={{width:"100%",height:15,borderRadius:7,overflow:"hidden",background:"#0c0e18",border:"1px solid #1c1e2c",position:"relative",boxShadow:"inset 0 2px 8px rgba(0,0,0,0.6)"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${wp}%`,background:"linear-gradient(90deg,#c89a28,#e8d888,#c8a84b)",transition:"width .6s cubic-bezier(.4,0,.2,1)",borderRadius:"7px 0 0 7px",boxShadow:"2px 0 8px rgba(200,168,75,0.32)"}}/>
          <div style={{position:"absolute",right:0,top:0,bottom:0,width:`${100-wp}%`,background:"linear-gradient(90deg,#1a2030,#0d1020)",transition:"width .6s cubic-bezier(.4,0,.2,1)",borderRadius:"0 7px 7px 0"}}/>
          <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"rgba(200,168,75,0.22)",zIndex:2}}/>
        </div>
      </div>
    );
  }

  /* ── Clock ─────────────────────────────────────────────────────────────── */
  function Clock({secs,active,low}){
    if(!timeMode.secs)return null;
    return<div style={{fontFamily:"Cinzel,monospace",fontSize:17,fontWeight:700,padding:"4px 12px",borderRadius:6,border:`1px solid ${active?"rgba(200,168,75,0.38)":"rgba(255,255,255,0.05)"}`,background:active?"rgba(200,168,75,0.09)":"rgba(0,0,0,0.25)",color:low?"#f44336":active?"#c8a84b":"#4a4058",animation:low&&active?"clockLow .5s infinite":"none",letterSpacing:"2px",flexShrink:0}}>{fmtTime(secs)}</div>;
  }

  /* ── Move list ─────────────────────────────────────────────────────────── */
  function MoveList({hist,active}){
    return(
      <div style={{flex:1,overflowY:"auto",padding:"5px 3px"}}>
        {Array.from({length:Math.ceil(hist.length/2)},(_,i)=>{
          const wm=hist[i*2],bm=hist[i*2+1];
          return(
            <div key={i} style={{display:"flex",alignItems:"center",marginBottom:2}}>
              <span style={{width:20,fontSize:9,color:"#3a3050",textAlign:"right",paddingRight:4,flexShrink:0,fontFamily:"Cinzel,monospace"}}>{i+1}.</span>
              {[wm,bm].map((mv,j)=>mv?(
                <div key={j} style={{flex:1,padding:"3px 5px",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"space-between",background:active===i*2+j?`${mv.classification?.clr||"#c8a84b"}22`:"transparent"}}>
                  <span style={{fontSize:11,color:"#a09080",fontFamily:"Crimson Pro,monospace"}}>{mv.notation}</span>
                  {mv.classification?.sym&&<span style={{fontSize:9,color:mv.classification.clr,fontWeight:800,marginLeft:2}}>{mv.classification.sym}</span>}
                </div>
              ):<div key={j} style={{flex:1}}/>)}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Player card ───────────────────────────────────────────────────────── */
  function PCard({side,active}){
    const isBot=side===botSide,acc=side==="w"?wAcc:bAcc;
    const secs=side==="w"?wTime:bTime,low=timeMode.secs&&secs<10;
    const capturedPieces=side==="w"?matTracker.wPieces:matTracker.bPieces;
    const materialAdv=(side==="w"?matTracker.score:-matTracker.score);
    
    return(
      <div style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",background:active?"rgba(200,168,75,0.07)":"rgba(255,255,255,0.02)",border:`1px solid ${active?"rgba(200,168,75,0.24)":"rgba(255,255,255,0.05)"}`,borderRadius:10,transition:"all .3s",flexShrink:0}}>
        <span style={{fontSize:19,flexShrink:0}}>{isBot?bot.em:(side==="w"?"♔":"♚")}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"Cinzel,serif",fontSize:11,fontWeight:700,color:isBot?bot.clr:"#d0c8b0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{isBot?bot.name:"You"}</div>
          <div style={{fontSize:9,color:"#4a4060",fontFamily:"Crimson Pro,serif",display:"flex",alignItems:"center",gap:4}}>
            {isBot?`ELO ${bot.elo}`:(side==="w"?"White":"Black")}
            {capturedPieces.length>0&&<span style={{display:"flex",alignItems:"center",marginLeft:4}}>
              {capturedPieces.map((p,i)=><div key={i} style={{width:12,height:12}}><PieceSVG piece={p} pStyle={settings.pieceStyle} size="100%"/></div>)}
              {materialAdv>0&&<span style={{color:"#a09080",fontSize:9,marginLeft:3,fontWeight:"bold"}}>+{materialAdv}</span>}
            </span>}
          </div>
        </div>
        {acc!==null&&<div style={{fontSize:12,fontWeight:800,fontFamily:"Cinzel,serif",color:acc>=80?"#4CAF50":acc>=60?"#FF9800":"#f44336",flexShrink:0}}>{acc}%</div>}
        {timeMode.secs>0&&<Clock secs={secs} active={active} low={low}/>}
        {active&&<div style={{width:6,height:6,borderRadius:"50%",background:"#c8a84b",flexShrink:0,boxShadow:"0 0 9px #c8a84b",animation:thinking&&isBot?"pulse .8s infinite":"none"}}/>}
      </div>
    );
  }

  /* ───────────────────────────────────── SCREENS ────────────────────────── */
  if(screen==="intro")return(<><style>{GCSS}</style><IntroScreen onEnter={()=>setScreen("menu")}/></>);

  /* ── MENU ─────────────────────────────────────────────────────────────── */
  if(screen==="menu")return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#080a12 0%,#0f1420 55%,#0c1018 100%)",display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 12px 32px",fontFamily:"Cinzel,Georgia,serif",color:"#e0d8c8",overflowY:"auto"}}>
      <style>{GCSS}</style>
      {showSet&&<SettingsPanel settings={settings} onSave={s=>{setSettings(s);}} onClose={()=>setShowSet(false)}/>}
      <div style={{width:"100%",maxWidth:660,display:"flex",justifyContent:"flex-end",marginBottom:8}}>
        <button onClick={()=>setShowSet(true)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#8a8070",padding:"7px 14px",cursor:"pointer",fontFamily:"Cinzel,serif",fontSize:10,transition:"all .18s"}}
          onMouseEnter={e=>{e.currentTarget.style.color="#c8a84b";e.currentTarget.style.borderColor="rgba(200,168,75,0.3)";}}
          onMouseLeave={e=>{e.currentTarget.style.color="#8a8070";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}>⚙ Settings</button>
      </div>
      <div style={{textAlign:"center",marginBottom:24,animation:"fadeUp .65s ease"}}>
        <div style={{fontSize:44,animation:"bob 3.5s ease-in-out infinite",display:"inline-block",marginBottom:4,filter:"drop-shadow(0 0 22px rgba(200,168,75,0.55))",color:"#c8a84b"}}>♞</div>
        <h1 style={{fontFamily:"Cinzel,serif",fontSize:"clamp(20px,4.5vw,38px)",fontWeight:900,color:"#f0e8d0",textShadow:"0 0 36px rgba(200,168,75,0.22)",letterSpacing:"2px"}}>CHESS TRAINER</h1>
        <div style={{width:100,height:1,background:"linear-gradient(90deg,transparent,#c8a84b,transparent)",margin:"8px auto"}}/>
        <p style={{fontFamily:"Crimson Pro,serif",fontSize:11,color:"#4a4858",letterSpacing:"4px",textTransform:"uppercase"}}>23 Bots · FIDE Ladder · CPL Analysis</p>
      </div>
      {/* Tier filter */}
      <div style={{width:"100%",maxWidth:660,marginBottom:10,animation:"fadeUp .65s ease .05s both"}}>
        <p style={{fontFamily:"Cinzel,serif",fontSize:8,letterSpacing:"3px",textTransform:"uppercase",color:"#4a4858",marginBottom:7}}>Filter by Level</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {[null,...new Set(BOTS.map(b=>b.tier))].map(t=><div key={t||"all"} onClick={()=>setFilterTier(t)} style={{padding:"4px 11px",borderRadius:20,cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"Cinzel,serif",background:filterTier===t?"rgba(200,168,75,0.17)":"rgba(255,255,255,0.03)",border:`1px solid ${filterTier===t?"#c8a84b":"rgba(255,255,255,0.07)"}`,color:filterTier===t?"#c8a84b":"#6a6050",transition:"all .18s"}}>{t||"All Levels"}</div>)}
        </div>
      </div>
      {/* Bot grid */}
      <div style={{width:"100%",maxWidth:660,background:"rgba(255,255,255,0.018)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"13px 11px",marginBottom:13,animation:"fadeUp .65s ease .1s both"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(125px,1fr))",gap:7}}>
          {(filterTier?BOTS.filter(b=>b.tier===filterTier):BOTS).map(b=>(
            <div key={b.id} onClick={()=>setMenuBot(b)} style={{padding:"10px 8px",borderRadius:10,cursor:"pointer",textAlign:"center",background:menuBot.id===b.id?`linear-gradient(135deg,${b.clr}22,${b.clr}0d)`:"rgba(255,255,255,0.02)",border:`2px solid ${menuBot.id===b.id?b.clr:"rgba(255,255,255,0.04)"}`,transition:"all .18s",boxShadow:menuBot.id===b.id?`0 4px 18px ${b.clr}28`:"none"}}>
              <div style={{fontSize:18,marginBottom:2}}>{b.em}</div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:10,fontWeight:700,color:menuBot.id===b.id?b.clr:"#b0a890",marginBottom:1}}>{b.name}</div>
              <div style={{fontSize:9,color:menuBot.id===b.id?b.clr+"99":"#3a3040",fontFamily:"Crimson Pro,monospace"}}>ELO {b.elo}</div>
              <div style={{fontSize:7,color:menuBot.id===b.id?b.clr+"77":"#2a2030",marginTop:2,textTransform:"uppercase",letterSpacing:".5px"}}>{b.tier}</div>
            </div>
          ))}
        </div>
        {menuBot&&<div style={{marginTop:9,padding:"8px 12px",background:"rgba(255,255,255,0.02)",borderRadius:8,fontFamily:"Crimson Pro,serif",fontSize:11,color:"#6a6050",textAlign:"center",fontStyle:"italic"}}>{menuBot.em} {menuBot.name} — {menuBot.desc}</div>}
        {menuBot&&(()=>{
            const bp=eloToParams(menuBot.elo);
            return (<div style={{marginTop:6,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              {[["Depth",bp.depth+" ply"],["Blunder%",Math.round(bp.blunder*100)+"%"],["Book%",Math.round(bp.book*100)+"%"]].map(([k,v])=>(
                <div key={k} style={{background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"4px 10px",textAlign:"center"}}>
                  <div style={{fontFamily:"Crimson Pro,serif",fontSize:9,color:"#5a5060"}}>{k}</div>
                  <div style={{fontFamily:"Cinzel,serif",fontSize:11,fontWeight:700,color:"#c8a84b"}}>{v}</div>
                </div>
              ))}
            </div>);
        })()}
      </div>
      {/* Time control */}
      <div style={{width:"100%",maxWidth:660,background:"rgba(255,255,255,0.018)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"13px 11px",marginBottom:13,animation:"fadeUp .65s ease .15s both"}}>
        <p style={{fontFamily:"Cinzel,serif",fontSize:8,letterSpacing:"3px",textTransform:"uppercase",color:"#4a4858",marginBottom:9}}>Time Control</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(105px,1fr))",gap:6}}>
          {TIME_MODES.map(tm=><div key={tm.id} onClick={()=>setMenuTime(tm)} style={{padding:"8px 6px",borderRadius:9,cursor:"pointer",textAlign:"center",background:menuTime.id===tm.id?"rgba(200,168,75,0.13)":"rgba(255,255,255,0.02)",border:`2px solid ${menuTime.id===tm.id?"#c8a84b":"rgba(255,255,255,0.04)"}`,transition:"all .18s"}}><div style={{fontFamily:"Cinzel,serif",fontSize:10,fontWeight:600,color:menuTime.id===tm.id?"#c8a84b":"#7a7060"}}>{tm.label}</div></div>)}
        </div>
      </div>
      {/* Color picker */}
      <div style={{width:"100%",maxWidth:660,background:"rgba(255,255,255,0.018)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"13px 11px",marginBottom:22,animation:"fadeUp .65s ease .2s both"}}>
        <p style={{fontFamily:"Cinzel,serif",fontSize:8,letterSpacing:"3px",textTransform:"uppercase",color:"#4a4858",marginBottom:9}}>Play As</p>
        <div style={{display:"flex",gap:9}}>
          {[{v:"w",l:"White",s:"♔"},{v:"b",l:"Black",s:"♚"},{v:"r",l:"Random",s:"🎲"}].map(o=>(
            <div key={o.v} onClick={()=>setMenuColor(o.v)} style={{flex:1,padding:"12px 6px",borderRadius:10,cursor:"pointer",textAlign:"center",background:menuColor===o.v?"rgba(200,168,75,0.12)":"rgba(255,255,255,0.02)",border:`2px solid ${menuColor===o.v?"#c8a84b":"rgba(255,255,255,0.04)"}`,transition:"all .18s"}}>
              <div style={{fontSize:22,marginBottom:4}}>{o.s}</div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:menuColor===o.v?"#c8a84b":"#6a6050",fontWeight:600}}>{o.l}</div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=>{const pc=menuColor==="r"?(Math.random()<.5?"w":"b"):menuColor;startGame(menuBot,pc,menuTime);}}
        style={{background:"linear-gradient(135deg,#c8a84b,#8a6820)",color:"#0d0900",border:"none",borderRadius:4,padding:"14px 46px",fontFamily:"Cinzel,serif",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:"3px",textTransform:"uppercase",boxShadow:"0 8px 28px rgba(200,168,75,0.32)",transition:"all .22s",animation:"fadeUp .65s ease .25s both"}}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 14px 44px rgba(200,168,75,0.48)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 28px rgba(200,168,75,0.32)";}}>
        Begin Game
      </button>
    </div>
  );

  /* ── REVIEW ───────────────────────────────────────────────────────────── */
  if(screen==="review")return(
    <ReviewScreen history={history} evalHist={evalHist} bot={bot} gameResult={result} pColor={pColor} settings={settings} onNewGame={()=>setScreen("menu")} onClose={()=>setScreen("game")}/>
  );

  /* ── GAME ─────────────────────────────────────────────────────────────── */
  return(
    <div style={{height:"100vh",background:"#080a12",color:"#e0d8c8",fontFamily:"Cinzel,Georgia,serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{GCSS}</style>
      {showSet&&<SettingsPanel settings={settings} onSave={s=>{setSettings(s);}} onClose={()=>setShowSet(false)}/>}
      
      {/* Game Over Modal (Cinematic Overlay) */}
      {result&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(5px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,animation:"fadeIn 0.3s ease"}}>
        <div style={{background:"linear-gradient(135deg,#12151f,#0d0f1a)",border:"1px solid rgba(200,168,75,0.3)",borderRadius:16,padding:"32px 40px",textAlign:"center",boxShadow:"0 24px 80px rgba(0,0,0,0.9), 0 0 40px rgba(200,168,75,0.1)",animation:"modalPop 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
          <div style={{fontSize:48,marginBottom:10,filter:"drop-shadow(0 0 12px rgba(200,168,75,0.4))"}}>🏆</div>
          <div style={{fontFamily:"Cinzel,serif",fontSize:22,fontWeight:900,color:"#e8dfc8",marginBottom:8,letterSpacing:"1px"}}>{result}</div>
          <div style={{fontFamily:"Crimson Pro,serif",fontSize:13,color:"#8a8070",marginBottom:24}}>
            Accuracy: <b style={{color:myAcc>=80?"#4CAF50":myAcc>=60?"#FF9800":"#f44336"}}>{myAcc}%</b> vs <b style={{color:botAcc>=80?"#4CAF50":botAcc>=60?"#FF9800":"#f44336"}}>{botAcc}%</b>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={()=>setScreen("review")} style={{background:"linear-gradient(135deg,#c8a84b,#8a6820)",color:"#0d0900",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontFamily:"Cinzel,serif",fontSize:11,fontWeight:700,letterSpacing:"1px",transition:"transform 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>📊 Review Game</button>
            <button onClick={()=>setScreen("menu")} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#c0b8a0",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontFamily:"Cinzel,serif",fontSize:11,fontWeight:700,letterSpacing:"1px",transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>Menu</button>
          </div>
        </div>
      </div>}

      {/* Header */}
      <div style={{background:"#0d0f1a",borderBottom:"1px solid #1c1e2c",padding:"7px 13px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:15,color:"#c8a84b"}}>♞</span>
          <span style={{fontFamily:"Cinzel,serif",fontWeight:900,fontSize:12,color:"#c8a84b",letterSpacing:"2px"}}>CHESS TRAINER</span>
          {!mob&&<span style={{fontFamily:"Crimson Pro,serif",fontSize:9,color:"#2e2a38",borderLeft:"1px solid #1c1e2c",paddingLeft:8}}>{bot.em} {bot.name} · ELO {bot.elo}</span>}
        </div>
        <div style={{display:"flex",gap:5}}>
          <button onClick={()=>setShowSet(true)} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:7,color:"#6a6080",padding:"5px 10px",cursor:"pointer",fontFamily:"Cinzel,serif",fontSize:10}}>⚙</button>
          {history.length>1&&!result&&<button onClick={takeback} style={{background:"#181a26",border:"1px solid #282a3a",borderRadius:7,color:"#a09080",padding:"5px 10px",cursor:"pointer",fontSize:10,fontFamily:"Cinzel,serif",transition:"all .18s"}} onMouseEnter={e=>{e.currentTarget.style.color="#c8a84b";}} onMouseLeave={e=>{e.currentTarget.style.color="#a09080";}}>↩ Takeback</button>}
          <button onClick={()=>setScreen("menu")} style={{background:"#181a26",border:"1px solid #1c1e2c",borderRadius:7,color:"#6a6050",padding:"5px 10px",cursor:"pointer",fontFamily:"Cinzel,serif",fontSize:10}}>Menu</button>
        </div>
      </div>

      {mob?(
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"5px 10px",flexShrink:0}}><PCard side={botSide} active={turn===botSide&&!result}/></div>
          <div style={{padding:"3px 10px 2px",flexShrink:0}}><EvalBar wp={winPct} ev={curEval}/></div>
          {chkFlag&&!result&&<div style={{padding:"2px 10px",flexShrink:0}}><div style={{background:"rgba(244,67,54,0.12)",border:"1px solid rgba(244,67,54,0.35)",borderRadius:5,padding:"3px",textAlign:"center",animation:"pulse .7s infinite"}}><span style={{fontFamily:"Cinzel,serif",fontSize:10,fontWeight:700,color:"#f44336"}}>CHECK!</span></div></div>}
          <div style={{flexShrink:0,padding:"4px 10px",position:"relative"}}>
            <div style={{width:"100%",aspectRatio:"1/1",borderRadius:8,overflow:"hidden",boxShadow:"0 10px 48px rgba(0,0,0,0.8)",border:`2px solid rgba(200,168,75,0.1)`}}>
              <Board brd={board} lm={lastMove} clickable={true} legalMoves={legal} sel={selSq} chk={chkFlag} curTurn={turn} anim={landSq}/>
            </div>
            {lastCls?.sym&&<div style={{position:"absolute",top:10,right:16,background:"rgba(8,10,18,0.92)",border:`1px solid ${lastCls.clr}55`,borderRadius:7,padding:"4px 9px",zIndex:5,animation:"slideDown .28s ease"}}><span style={{fontFamily:"Cinzel,serif",fontSize:10,fontWeight:700,color:lastCls.clr}}>{lastCls.sym} {lastCls.label}</span></div>}
          </div>
          <div style={{padding:"4px 10px 3px",flexShrink:0}}><PCard side={pColor} active={turn===pColor&&!result}/></div>
          <div style={{display:"flex",padding:"3px 10px 0",gap:5,flexShrink:0}}>
            {[["moves","Moves"],["analysis","Stats"]].map(([v,l])=>(
              <div key={v} onClick={()=>setGameTab(v)} style={{flex:1,padding:"5px",textAlign:"center",borderRadius:"7px 7px 0 0",cursor:"pointer",fontFamily:"Cinzel,serif",fontSize:10,fontWeight:600,background:gameTab===v?"#0d0f1a":"transparent",border:gameTab===v?"1px solid #1c1e2c":"1px solid transparent",borderBottom:"none",color:gameTab===v?"#c8a84b":"#3a3050"}}>{l}</div>
            ))}
          </div>
          <div style={{flex:1,background:"#0d0f1a",borderTop:"1px solid #1c1e2c",overflow:"hidden",margin:"0 10px",borderRadius:"0 0 8px 8px",display:"flex",flexDirection:"column"}}>
            {gameTab==="moves"?<div ref={mlRef} style={{flex:1,overflowY:"auto",padding:"4px"}}><MoveList hist={history} active={history.length-1}/></div>
            :<div style={{flex:1,overflowY:"auto",padding:"10px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5,marginBottom:8}}>
                {[["💎","Brilliant","#00BCD4"],["✦","Best","#4CAF50"],["💥","Blunder","#F44336"],["❗","Mistake","#FF5722"],["⚠️","Inaccuracy","#FF9800"],["✨","Excellent","#8BC34A"]].map(([em,label,clr])=>(
                  <div key={label} style={{background:"rgba(255,255,255,0.02)",border:"1px solid #1c1e2c",borderRadius:7,padding:"7px 4px",textAlign:"center"}}>
                    <div style={{fontSize:13}}>{em}</div>
                    <div style={{fontFamily:"Cinzel,serif",fontSize:18,fontWeight:800,color:history.filter(m=>m.classification?.label===label&&cl(m.piece)===pColor).length>0?clr:"#2a2030"}}>{history.filter(m=>m.classification?.label===label&&cl(m.piece)===pColor).length}</div>
                    <div style={{fontSize:7,color:"#3a3050",marginTop:1}}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid #1c1e2c",borderRadius:8,padding:"10px",textAlign:"center"}}>
                <div style={{fontFamily:"Cinzel,serif",fontSize:8,color:"#3a3050",marginBottom:2,letterSpacing:"2px"}}>ACCURACY</div>
                <div style={{fontFamily:"Cinzel,serif",fontSize:30,fontWeight:800,color:myAcc>=80?"#4CAF50":myAcc>=60?"#FF9800":"#f44336"}}>{myAcc??"-"}%</div>
              </div>
            </div>}
          </div>
        </div>
      ):(
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          <div style={{width:190,background:"#0d0f1a",borderRight:"1px solid #1c1e2c",display:"flex",flexDirection:"column",padding:"10px",gap:8,flexShrink:0}}>
            <PCard side={botSide} active={turn===botSide&&!result}/>
            <PCard side={pColor}  active={turn===pColor&&!result}/>
            {chkFlag&&!result&&<div style={{background:"rgba(244,67,54,0.1)",border:"1px solid rgba(244,67,54,0.28)",borderRadius:7,padding:"5px",textAlign:"center",animation:"pulse .8s infinite"}}><span style={{fontFamily:"Cinzel,serif",fontSize:10,fontWeight:700,color:"#f44336"}}>CHECK!</span></div>}
            {history.length>3&&<div style={{flex:1,background:"rgba(255,255,255,0.02)",border:"1px solid #1c1e2c",borderRadius:8,padding:"9px",overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>
              <div style={{fontFamily:"Cinzel,serif",fontSize:8,letterSpacing:"3px",color:"#3a3050",textTransform:"uppercase",marginBottom:7}}>Your Stats</div>
              {[["💎","Brilliant","#00BCD4"],["✦","Best","#4CAF50"],["💥","Blunder","#F44336"],["❗","Mistake","#FF5722"],["⚠️","Inaccuracy","#FF9800"]].map(([em,label,clr])=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <span style={{fontFamily:"Crimson Pro,serif",fontSize:10,color:"#6a6050"}}>{em} {label}</span>
                  <span style={{fontFamily:"Cinzel,serif",fontSize:11,fontWeight:700,color:history.filter(m=>m.classification?.label===label&&cl(m.piece)===pColor).length>0?clr:"#2a2030"}}>{history.filter(m=>m.classification?.label===label&&cl(m.piece)===pColor).length}</span>
                </div>
              ))}
              {myAcc!==null&&<div style={{marginTop:"auto",paddingTop:8,borderTop:"1px solid #1c1e2c"}}>
                <div style={{fontFamily:"Cinzel,serif",fontSize:8,color:"#3a3050",marginBottom:2,letterSpacing:"2px"}}>ACCURACY</div>
                <div style={{fontFamily:"Cinzel,serif",fontSize:24,fontWeight:800,color:myAcc>=80?"#4CAF50":myAcc>=60?"#FF9800":"#f44336"}}>{myAcc}%</div>
              </div>}
            </div>}
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 12px",overflow:"hidden",gap:5}}>
            <div style={{width:"min(calc(100vh - 140px),555px)"}}><EvalBar wp={winPct} ev={curEval}/></div>
            <div style={{width:"min(calc(100vh - 140px),555px)",flexShrink:0,borderRadius:8,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.9)",border:"2px solid rgba(200,168,75,0.11)",animation:"boardIn .75s cubic-bezier(0.34,1.2,0.64,1) forwards",position:"relative"}}>
              <Board brd={board} lm={lastMove} clickable={true} legalMoves={legal} sel={selSq} chk={chkFlag} curTurn={turn} anim={landSq}/>
              {lastCls?.sym&&<div style={{position:"absolute",top:9,right:9,background:"rgba(8,10,18,0.91)",border:`1px solid ${lastCls.clr}55`,borderRadius:8,padding:"5px 11px",backdropFilter:"blur(8px)",zIndex:5,animation:"slideDown .28s ease"}}><div style={{fontFamily:"Cinzel,serif",fontSize:11,fontWeight:700,color:lastCls.clr}}>{lastCls.sym} {lastCls.label}</div></div>}
            </div>
          </div>
          <div style={{width:190,background:"#0d0f1a",borderLeft:"1px solid #1c1e2c",display:"flex",flexDirection:"column",flexShrink:0}}>
            <div style={{padding:"8px 13px",borderBottom:"1px solid #1c1e2c",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:"Cinzel,serif",fontSize:8,letterSpacing:"3px",color:"#3a3050",textTransform:"uppercase"}}>Moves</span>
              <span style={{fontFamily:"Cinzel,serif",fontSize:12,fontWeight:800,color:"#c8a84b"}}>{fmtEval(curEval)}</span>
            </div>
            <div ref={mlRef} style={{flex:1,overflowY:"auto"}}><MoveList hist={history} active={history.length-1}/></div>
          </div>
        </div>
      )}

      {showPromo&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
        <div style={{background:"linear-gradient(135deg,#12151f,#0d0f1a)",border:"1px solid rgba(200,168,75,0.3)",borderRadius:16,padding:"24px",textAlign:"center",boxShadow:"0 24px 80px rgba(0,0,0,0.9)"}}>
          <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"#6a6050",marginBottom:14,letterSpacing:"3px",textTransform:"uppercase"}}>Promote Pawn</div>
          <div style={{display:"flex",gap:10}}>
            {["Q","R","B","N"].map(t=>(
              <div key={t} onClick={()=>{execMove(showPromo.fr,showPromo.fc,showPromo.tr,showPromo.tc,t);setShowPromo(null);}}
                style={{width:66,height:66,background:"rgba(200,168,75,0.08)",border:"1px solid rgba(200,168,75,0.22)",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .18s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(200,168,75,0.22)";e.currentTarget.style.transform="scale(1.08)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(200,168,75,0.08)";e.currentTarget.style.transform="scale(1)";}}>
                <PieceSVG piece={pColor+t} pStyle={settings.pieceStyle}/>
              </div>
            ))}
          </div>
        </div>
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  REVIEW SCREEN
// ═══════════════════════════════════════════════════════════
function ReviewScreen({history,evalHist,bot,gameResult,pColor,settings,onNewGame,onClose}){
  const[idx,setIdx]=useState(-1);
  const flipped=pColor==="b";
  const th=BOARD_THEMES[settings.boardTheme]||BOARD_THEMES.classic;
  const maxE=Math.max(...evalHist.map(Math.abs),200);
  const wAcc=calcAccuracy(history,"w");
  const bAcc=calcAccuracy(history,"b");
  const rBoard=idx<0?INIT_BOARD():history[idx]?.board||INIT_BOARD();
  const rLM=idx>=0?[history[idx]?.fr,history[idx]?.fc,history[idx]?.tr,history[idx]?.tc]:null;
  const rEval=idx<0?0:evalHist[idx+1]||0;
  const rWp=eToW(rEval);
  const CATS=["Brilliant","Best","Excellent","Good","Inaccuracy","Mistake","Blunder"];
  const CLR={Brilliant:"#00BCD4",Best:"#4CAF50",Excellent:"#8BC34A",Good:"#CDDC39",Inaccuracy:"#FF9800",Mistake:"#FF5722",Blunder:"#F44336"};
  const SYM={Brilliant:"!!",Best:"✦",Excellent:"!",Good:"",Inaccuracy:"?!",Mistake:"?",Blunder:"??"};
  function countCat(color,cat){return history.filter(m=>cl(m.piece)===color&&m.classification?.label===cat).length;}
  const pts=evalHist.map((e,i)=>{const x=(i/(evalHist.length-1||1))*100,y=50-((Math.max(-maxE,Math.min(maxE,e))/maxE)*44);return[x,y];});
  const rows=flipped?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
  const cols=flipped?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];

  // Keybindings for smooth reviewing!
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") setIdx(i => Math.max(-1, i - 1));
      else if (e.key === "ArrowRight") setIdx(i => Math.min(history.length - 1, i + 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [history.length]);

  const playerLabel = pColor === "w" ? "♔ White (You)" : "♚ Black (You)";
  const botLabel = pColor === "w" ? `♚ Black (${bot.name})` : `♔ White (${bot.name})`;
  const reviewCards = pColor === "w" 
    ? [ {label: playerLabel, acc: wAcc, color: "w"}, {label: botLabel, acc: bAcc, color: "b", clr: bot.clr} ]
    : [ {label: botLabel, acc: wAcc, color: "w", clr: bot.clr}, {label: playerLabel, acc: bAcc, color: "b"} ];

  return(
    <div style={{height:"100vh",background:"#080a12",color:"#e0d8c8",fontFamily:"Cinzel,Georgia,serif",display:"flex",flexDirection:"column",overflow:"hidden",animation:"reviewIn .4s ease"}}>
      <div style={{background:"#0d0f1a",borderBottom:"1px solid #1c1e2c",padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:17,color:"#c8a84b"}}>♞</span>
          <span style={{fontFamily:"Cinzel,serif",fontWeight:700,fontSize:13,color:"#c8a84b"}}>Game Review</span>
          {gameResult&&<span style={{fontFamily:"Crimson Pro,serif",fontSize:10,color:"#4a4858",borderLeft:"1px solid #1c1e2c",paddingLeft:8}}>{gameResult}</span>}
        </div>
        <button onClick={onNewGame} style={{background:"linear-gradient(135deg,#c8a84b,#8a6820)",color:"#0d0900",border:"none",borderRadius:6,padding:"7px 15px",cursor:"pointer",fontFamily:"Cinzel,serif",fontSize:10,fontWeight:700}}>New Game</button>
      </div>
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* Left: accuracy + stats */}
        <div style={{width:200,background:"#0d0f1a",borderRight:"1px solid #1c1e2c",padding:"14px 12px",overflowY:"auto",flexShrink:0,display:"flex",flexDirection:"column",gap:12}}>
          
          {/* Dynamic Review Cards */}
          {reviewCards.map((x,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1c1e2c",borderRadius:10,padding:"12px"}}>
              <div style={{fontFamily:"Crimson Pro,serif",fontSize:10,color:x.clr||"#6a6050",marginBottom:6}}>{x.label}</div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:28,fontWeight:900,color:x.acc>=80?"#4CAF50":x.acc>=60?"#FF9800":"#f44336",lineHeight:1}}>{x.acc??0}%</div>
              <div style={{fontFamily:"Crimson Pro,serif",fontSize:9,color:"#4a4060",marginBottom:8}}>Accuracy</div>
              <div style={{height:4,background:"#1c1e2c",borderRadius:2}}><div style={{height:"100%",width:`${x.acc??0}%`,background:x.acc>=80?"#4CAF50":x.acc>=60?"#FF9800":"#f44336",borderRadius:2,transition:"width .6s"}}/></div>
              <div style={{marginTop:10}}>
                {CATS.filter(c=>c!=="Good").map(cat=>{
                  const n=countCat(x.color,cat);
                  return n>0?(
                    <div key={cat} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontFamily:"Crimson Pro,serif",fontSize:10,color:"#7a7060"}}>{SYM[cat]?`${SYM[cat]} `:"·"}{cat}</span>
                      <span style={{fontFamily:"Cinzel,serif",fontSize:11,fontWeight:700,color:CLR[cat]}}>{n}</span>
                    </div>
                  ):null;
                })}
              </div>
            </div>
          ))}
          
          {["w","b"].map((c,i)=>{
            const pm=history.filter(m=>cl(m.piece)===c);
            const avgCPL=pm.length?Math.round(pm.reduce((s,m)=>s+(m.cpl||0),0)/pm.length):0;
            return(
              <div key={i} style={{background:"rgba(255,255,255,0.02)",border:"1px solid #1c1e2c",borderRadius:8,padding:"9px 11px"}}>
                <div style={{fontFamily:"Crimson Pro,serif",fontSize:9,color:"#5a5060",marginBottom:3}}>{c==="w"?"♔ White":"♚ Black"} avg. CPL</div>
                <div style={{fontFamily:"Cinzel,serif",fontSize:20,fontWeight:800,color:avgCPL<20?"#4CAF50":avgCPL<60?"#FF9800":"#f44336"}}>{avgCPL}</div>
              </div>
            );
          })}
        </div>
        {/* Center: eval chart + board */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Eval graph */}
          <div style={{height:90,background:"#0d0f1a",borderBottom:"1px solid #1c1e2c",padding:"8px 14px",flexShrink:0}}>
            <svg width="100%" height="74" style={{display:"block",cursor:"pointer"}}>
              <rect width="100%" height="100%" fill="#080a12"/>
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#1c1e2c" strokeWidth="1"/>
              {/* Filled area above/below baseline */}
              <path d={`M${pts[0]?.[0]}% 50 ${pts.map(([x,y])=>`L${x}% ${y}`).join(" ")} L${pts[pts.length-1]?.[0]}% 50 Z`} fill="rgba(200,168,75,0.09)"/>
              <polyline points={pts.map(([x,y])=>`${x}% ${y}`).join(" ")} fill="none" stroke="#c8a84b" strokeWidth="1.8"/>
              {idx>=0&&pts[idx+1]&&<circle cx={`${pts[idx+1][0]}%`} cy={pts[idx+1][1]} r="5" fill="#c8a84b" style={{filter:"drop-shadow(0 0 6px #c8a84b)"}}/>}
              {pts.map((_,i)=>i>0&&<rect key={i} x={`${(i/(pts.length||1))*100}%`} y="0" width={`${100/(pts.length||1)}%`} height="74" fill="transparent" onClick={()=>setIdx(i-1)}/>)}
            </svg>
          </div>
          {/* Eval bar */}
          <div style={{padding:"6px 14px 4px",background:"#0d0f1a",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontFamily:"Crimson Pro,serif",fontSize:10,color:"#c0b8a0"}}>♔ <b>{rWp}%</b></span>
              <span style={{fontFamily:"Cinzel,serif",fontSize:12,fontWeight:700,color:"#c8a84b"}}>{fmtEval(rEval)}</span>
              <span style={{fontFamily:"Crimson Pro,serif",fontSize:10,color:"#5a6080"}}><b>{100-rWp}%</b> ♚</span>
            </div>
            <div style={{height:10,borderRadius:5,overflow:"hidden",background:"#0c0e18",border:"1px solid #1c1e2c",position:"relative"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${rWp}%`,background:"linear-gradient(90deg,#c89a28,#e8d888)",transition:"width .5s",borderRadius:"5px 0 0 5px"}}/>
              <div style={{position:"absolute",right:0,top:0,bottom:0,width:`${100-rWp}%`,background:"#1a2030",transition:"width .5s",borderRadius:"0 5px 5px 0"}}/>
              <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"rgba(200,168,75,0.2)"}}/>
            </div>
          </div>
          {/* Board */}
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"8px",overflow:"hidden"}}>
            <div style={{width:"min(calc(100vh - 260px),460px)",aspectRatio:"1/1",borderRadius:8,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.8)",border:"2px solid rgba(200,168,75,0.12)"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gridTemplateRows:"repeat(8,1fr)",width:"100%",height:"100%"}}>
                {rows.flatMap(r=>cols.map(c=>{
                  const piece=rBoard[r][c];
                  const light=(r+c)%2===1;
                  const isLM=rLM&&(rLM[0]===r&&rLM[1]===c||rLM[2]===r&&rLM[3]===c);
                  let bg=light?th.light:th.dark;
                  if(isLM)bg=light?th.lm:th.dmLM;
                  return(
                    <div key={`${r}-${c}`} style={{background:bg,aspectRatio:"1/1",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {piece&&<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",filter:cl(piece)==="w"?"drop-shadow(0 2px 4px rgba(0,0,0,0.9))":"drop-shadow(0 2px 4px rgba(0,0,0,0.7))"}}><PieceSVG piece={piece} pStyle={settings.pieceStyle}/></div>}
                      {settings.showCoords&&c===(flipped?7:0)&&<span style={{position:"absolute",top:1,left:2,fontSize:8,fontWeight:800,color:light?th.dark:th.light,fontFamily:"monospace",opacity:.7}}>{8-r}</span>}
                      {settings.showCoords&&r===(flipped?0:7)&&<span style={{position:"absolute",bottom:1,right:2,fontSize:8,fontWeight:800,color:light?th.dark:th.light,fontFamily:"monospace",opacity:.7}}>{String.fromCharCode(97+c)}</span>}
                    </div>
                  );
                }))}
              </div>
            </div>
          </div>
          {/* Nav */}
          <div style={{height:48,background:"#0d0f1a",borderTop:"1px solid #1c1e2c",display:"flex",alignItems:"center",justifyContent:"center",gap:7,flexShrink:0}}>
            {[["⏮",()=>setIdx(-1)],["◀",()=>setIdx(i=>Math.max(-1,i-1))],["▶",()=>setIdx(i=>Math.min(history.length-1,i+1))],["⏭",()=>setIdx(history.length-1)]].map(([l,fn])=>(
              <button key={l} onClick={fn} style={{background:"#181a26",border:"1px solid #282a3a",borderRadius:7,color:"#c8a84b",padding:"7px 15px",cursor:"pointer",fontSize:13,fontFamily:"Cinzel,monospace",transition:"background .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#222436";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#181a26";}}>{l}</button>
            ))}
            <span style={{fontFamily:"Crimson Pro,serif",color:"#3a3050",fontSize:11,marginLeft:7}}>Move {idx+1} / {history.length}</span>
          </div>
        </div>
        {/* Right: move list */}
        <div style={{width:195,background:"#0d0f1a",borderLeft:"1px solid #1c1e2c",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"9px 13px",borderBottom:"1px solid #1c1e2c",fontFamily:"Cinzel,serif",fontSize:8,letterSpacing:"3px",color:"#3a3050",textTransform:"uppercase"}}>Annotated Moves</div>
          <div style={{flex:1,overflowY:"auto",padding:"5px 3px"}}>
            {Array.from({length:Math.ceil(history.length/2)},(_,i)=>{
              const wm=history[i*2],bm=history[i*2+1];
              return(
                <div key={i} style={{display:"flex",alignItems:"center",marginBottom:2}}>
                  <span style={{width:20,fontSize:9,color:"#3a3050",textAlign:"right",paddingRight:4,flexShrink:0,fontFamily:"Cinzel,monospace"}}>{i+1}.</span>
                  {[wm,bm].map((mv,j)=>mv?(
                    <div key={j} onClick={()=>setIdx(i*2+j)} style={{flex:1,padding:"3px 5px",borderRadius:4,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",background:idx===i*2+j?`${mv.classification?.clr}22`:"transparent",transition:"background .12s"}}>
                      <span style={{fontSize:11,color:idx===i*2+j?(mv.classification?.clr||"#c8a84b"):"#a09080",fontFamily:"Crimson Pro,monospace"}}>{mv.notation}</span>
                      {mv.classification?.sym&&<span style={{fontSize:9,color:mv.classification.clr,fontWeight:800,marginLeft:2}}>{mv.classification.sym}</span>}
                    </div>
                  ):<div key={j} style={{flex:1}}/>)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
