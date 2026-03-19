# Grandmaster-academy-
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Grandmaster Academy — Learn Chess</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Mono:wght@300;400;500&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"></script>
<style>
:root {
  --cream:#f5f0e8; --parchment:#e8dfc8; --ink:#1a1410; --walnut:#3d2b1f;
  --gold:#c9922a; --gold-l:#e8b84b; --sienna:#7c3d1e;
  --bg:#0f0e0c; --sf:#1a1814; --s2:#222019; --s3:#2a2720;
  --border:#2e2b24; --muted:#7a7060; --cr:#f0ead8;
  --bl:#f0d9b5; --bd:#b58863;
  --brilliant:#00c8ff; --great:#5ba85e; --best:#5ba85e;
  --excellent:#96c84a; --good:#96c84a;
  --inaccuracy:#f0c040; --mistake:#e08030; --miss:#e05050; --blunder:#cc2222;
  --bsz:520px;
}
@media(max-height:800px){:root{--bsz:440px;}}
@media(max-height:680px){:root{--bsz:360px;}}
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{background:var(--cream);color:var(--ink);font-family:'Crimson Pro',serif;overflow-x:hidden;}
body.app-mode{background:var(--bg);color:var(--cr);overflow:hidden;height:100vh;display:flex;flex-direction:column;}
.piece{position:absolute;width:92%;height:92%;display:flex;align-items:center;justify-content:center;font-size:calc(var(--bsz)/8*0.78);line-height:1;pointer-events:none;user-select:none;}
.piece.white{color:#ffffff;text-shadow:0 0 4px rgba(0,0,0,1),1px 1px 0 rgba(0,0,0,.9),-1px -1px 0 rgba(0,0,0,.7),1px -1px 0 rgba(0,0,0,.7),-1px 1px 0 rgba(0,0,0,.7),0 2px 8px rgba(0,0,0,.9);filter:drop-shadow(0 1px 4px rgba(0,0,0,.8));}
.piece.black{color:#0d0b09;text-shadow:0 0 3px rgba(255,255,255,.6),1px 1px 0 rgba(255,255,255,.35),-1px -1px 0 rgba(255,255,255,.25),0 1px 6px rgba(0,0,0,.95);filter:drop-shadow(0 1px 4px rgba(0,0,0,.7));}
.sq{position:relative;display:flex;align-items:center;justify-content:center;}
.sq.l{background:var(--bl);} .sq.d{background:var(--bd);}
.sq.lm-from{background:rgba(201,146,42,.28)!important;}
.sq.lm-to{background:rgba(201,146,42,.50)!important;}
.sq.sel{background:rgba(201,146,42,.45)!important;}
.sq.legal::before{content:'';position:absolute;width:30%;height:30%;border-radius:50%;background:rgba(0,0,0,.2);z-index:3;}
.sq.legal-cap::before{content:'';position:absolute;inset:0;border-radius:50%;border:5px solid rgba(0,0,0,.22);z-index:3;width:100%;height:100%;}
.sq.check{background:rgba(180,40,40,.58)!important;}
.sq.bh{outline:2.5px solid rgba(91,168,94,.65);outline-offset:-2.5px;}
.board-grid{display:grid;grid-template-columns:repeat(8,1fr);width:var(--bsz);height:var(--bsz);box-shadow:0 0 0 2px var(--border),0 0 0 4px var(--sf),0 22px 65px rgba(0,0,0,.65);}
.rk-coords{position:absolute;left:-1.3rem;top:0;display:flex;flex-direction:column;height:var(--bsz);}
.fl-coords{display:grid;grid-template-columns:repeat(8,1fr);width:var(--bsz);padding-top:.2rem;}
.coord{font-family:'DM Mono',monospace;font-size:.56rem;color:var(--muted);text-align:center;flex:1;display:flex;align-items:center;justify-content:center;}
.ln-nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:1.1rem 3rem;background:rgba(245,240,232,.93);backdrop-filter:blur(8px);border-bottom:1px solid var(--parchment);}
.ln-logo{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;letter-spacing:.08em;color:var(--walnut);text-transform:uppercase;}
.ln-logo span{color:var(--gold);}
.ln-links{display:flex;gap:2rem;list-style:none;}
.ln-links a{font-family:'DM Mono',monospace;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--walnut);text-decoration:none;opacity:.65;transition:opacity .2s;}
.ln-links a:hover{opacity:1;}
.ln-cta-btn{font-family:'DM Mono',monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;background:var(--walnut);color:var(--cream);border:none;padding:.6rem 1.5rem;cursor:pointer;transition:background .2s;}
.ln-cta-btn:hover{background:var(--gold);}
.ln-hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;padding-top:80px;}
.hero-left{display:flex;flex-direction:column;justify-content:center;padding:5rem 3rem 5rem 5rem;}
.hero-eye{font-family:'DM Mono',monospace;font-size:.68rem;letter-spacing:.25em;text-transform:uppercase;color:var(--gold);margin-bottom:1.5rem;display:flex;align-items:center;gap:.8rem;}
.hero-eye::before{content:'';display:block;width:2rem;height:1px;background:var(--gold);}
.hero-h1{font-family:'Playfair Display',serif;font-size:clamp(3rem,5.5vw,5.5rem);font-weight:900;line-height:1;color:var(--walnut);margin-bottom:1.8rem;}
.hero-h1 em{font-style:italic;color:var(--gold);}
.hero-desc{font-size:1.15rem;font-weight:300;line-height:1.7;color:var(--walnut);opacity:.75;max-width:420px;margin-bottom:3rem;}
.hero-actions{display:flex;gap:1rem;align-items:center;}
.hero-btn-main{font-family:'DM Mono',monospace;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;background:var(--walnut);color:var(--cream);border:none;padding:1rem 2.2rem;cursor:pointer;transition:all .2s;}
.hero-btn-main:hover{background:var(--gold);transform:translateY(-1px);}
.hero-btn-ghost{font-family:'Crimson Pro',serif;font-size:1rem;font-style:italic;color:var(--sienna);background:none;border:none;cursor:pointer;text-decoration:underline;text-underline-offset:3px;opacity:.8;}
.hero-btn-ghost:hover{opacity:1;}
.hero-stats{display:flex;gap:3rem;margin-top:4rem;padding-top:2rem;border-top:1px solid var(--parchment);}
.hstat-num{font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--walnut);}
.hstat-lbl{font-family:'DM Mono',monospace;font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;color:var(--walnut);opacity:.5;margin-top:.2rem;}
.hero-right{display:flex;align-items:center;justify-content:center;padding:4rem 3rem;}
.hero-board-wrap{animation:float 6s ease-in-out infinite;}
@keyframes float{0%,100%{transform:translateY(0) rotate(-3deg);}50%{transform:translateY(-14px) rotate(-3deg);}}
.hero-mini-board{display:grid;grid-template-columns:repeat(8,1fr);width:360px;height:360px;box-shadow:18px 28px 70px rgba(61,43,31,.35),0 0 0 7px #3d2b1f,0 0 0 11px #c9922a,0 0 0 18px #3d2b1f;}
.msq{display:flex;align-items:center;justify-content:center;font-size:2.1rem;}
.msq.l{background:var(--bl);} .msq.d{background:var(--bd);}
.msq .wp{color:#fff;text-shadow:0 0 4px rgba(0,0,0,1),1px 1px 0 rgba(0,0,0,.9),0 2px 6px rgba(0,0,0,.9);filter:drop-shadow(0 1px 3px rgba(0,0,0,.8));}
.msq .bp{color:#0d0b09;text-shadow:0 0 3px rgba(255,255,255,.6),1px 1px 0 rgba(255,255,255,.3);filter:drop-shadow(0 1px 3px rgba(0,0,0,.6));}
.ln-sec{padding:6rem 5rem;}
.ln-sec.dark{background:var(--walnut);color:var(--cream);}
.ln-sec.parch{background:var(--parchment);}
.sec-tag{font-family:'DM Mono',monospace;font-size:.66rem;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-bottom:.9rem;display:flex;align-items:center;gap:.7rem;}
.sec-tag::before{content:'♟';font-size:.85rem;}
.sec-h2{font-family:'Playfair Display',serif;font-size:clamp(2rem,3.8vw,3.2rem);font-weight:700;line-height:1.15;max-width:640px;margin-bottom:.6rem;}
.sec-h2 em{font-style:italic;color:var(--gold);}
.ln-sec.dark .sec-h2{color:var(--cream);}
.ln-sec.dark .sec-h2 em{color:var(--gold-l);}
.paths-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5px;margin-top:4rem;background:rgba(255,255,255,.05);}
.path-card{background:rgba(245,240,232,.04);border:1px solid rgba(255,255,255,.05);padding:2.5rem 2.2rem;cursor:pointer;transition:background .3s;position:relative;overflow:hidden;}
.path-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--gold);transform:scaleX(0);transition:transform .3s;transform-origin:left;}
.path-card:hover{background:rgba(201,146,42,.08);}
.path-card:hover::before{transform:scaleX(1);}
.pc-icon{font-size:2.3rem;margin-bottom:1.3rem;display:block;}
.pc-lvl{font-family:'DM Mono',monospace;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-l);margin-bottom:.5rem;opacity:.8;}
.pc-name{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--cream);margin-bottom:.8rem;}
.pc-desc{font-size:.92rem;line-height:1.62;color:var(--cream);opacity:.58;}
.pc-count{font-family:'DM Mono',monospace;font-size:.66rem;color:var(--gold-l);margin-top:1.8rem;opacity:.75;}
.tac-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:3.5rem;}
.tac-card{background:var(--parchment);border:1px solid rgba(61,43,31,.1);padding:1.8rem 1.5rem;transition:all .25s;}
.tac-card:hover{transform:translateY(-3px);box-shadow:0 10px 35px rgba(61,43,31,.12);}
.tac-icon{font-size:1.9rem;margin-bottom:.9rem;}
.tac-name{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:var(--walnut);margin-bottom:.4rem;}
.tac-desc{font-size:.88rem;line-height:1.6;color:var(--walnut);opacity:.6;}
.quote-banner{background:var(--gold);padding:5rem;text-align:center;position:relative;overflow:hidden;}
.quote-banner::before{content:'♛';position:absolute;font-size:20rem;opacity:.06;top:50%;left:50%;transform:translate(-50%,-50%);color:var(--walnut);line-height:1;}
.quote-text{font-family:'Playfair Display',serif;font-size:clamp(1.7rem,3.2vw,2.6rem);font-style:italic;color:var(--walnut);max-width:780px;margin:0 auto 1.4rem;line-height:1.4;position:relative;}
.quote-attr{font-family:'DM Mono',monospace;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--walnut);opacity:.6;}
.masters-row{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;margin-top:3.5rem;}
.master-card{text-align:center;padding:1.8rem 1.3rem;border:1px solid var(--parchment);transition:border-color .25s;}
.master-card:hover{border-color:var(--gold);}
.master-av{width:72px;height:72px;border-radius:50%;background:var(--parchment);border:2px solid var(--walnut);margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;font-size:2.2rem;}
.master-name{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:var(--walnut);margin-bottom:.25rem;}
.master-title{font-family:'DM Mono',monospace;font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);}
.master-lessons{font-size:.82rem;color:var(--walnut);opacity:.5;margin-top:.7rem;}
.ln-cta-sec{background:var(--ink);padding:7rem 5rem;display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center;}
.cta-title{font-family:'Playfair Display',serif;font-size:clamp(2.2rem,3.8vw,3.8rem);font-weight:900;color:var(--cream);line-height:1.1;}
.cta-title em{font-style:italic;color:var(--gold-l);}
.cta-right{display:flex;flex-direction:column;gap:1.3rem;}
.cta-feat{display:flex;gap:.9rem;align-items:flex-start;}
.cta-check{color:var(--gold-l);margin-top:.1rem;}
.cta-feat-text{font-size:.95rem;color:var(--cream);opacity:.7;line-height:1.6;}
.cta-launch{font-family:'DM Mono',monospace;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;background:var(--gold);color:var(--ink);border:none;padding:1.1rem 2.8rem;cursor:pointer;margin-top:.8rem;font-weight:500;transition:all .2s;align-self:flex-start;}
.cta-launch:hover{background:var(--gold-l);transform:translateY(-2px);}
.ln-footer{background:var(--walnut);color:var(--cream);padding:2.5rem 5rem;display:flex;align-items:center;justify-content:space-between;}
.footer-logo{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;letter-spacing:.08em;}
.footer-logo span{color:var(--gold-l);}
.footer-links{display:flex;gap:2rem;list-style:none;}
.footer-links a{font-family:'DM Mono',monospace;font-size:.67rem;letter-spacing:.12em;text-transform:uppercase;color:var(--cream);opacity:.35;text-decoration:none;transition:opacity .2s;}
.footer-links a:hover{opacity:.9;}
.footer-copy{font-family:'DM Mono',monospace;font-size:.62rem;color:var(--cream);opacity:.25;}
.fade-in{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease;}
.fade-in.vis{opacity:1;transform:none;}
.ob{position:fixed;inset:0;z-index:700;background:rgba(8,7,6,.97);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);overflow-y:auto;padding:1rem;}
.ob.gone{display:none;}
.ob-card{background:var(--sf);border:1px solid var(--border);max-width:580px;width:100%;box-shadow:0 40px 100px rgba(0,0,0,.6);}
.ob-prog{height:3px;background:var(--border);}
.ob-pfill{height:100%;background:var(--gold);transition:width .4s;}
.ob-body{padding:2.2rem 2.5rem;}
.ob-brand{display:flex;align-items:center;gap:.7rem;margin-bottom:1.6rem;}
.ob-brand-icon{font-size:1.7rem;}
.ob-brand-txt{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:var(--cr);}
.ob-brand-txt b{color:var(--gold);}
.ob-sn{font-family:'DM Mono',monospace;font-size:.57rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:.4rem;}
.ob-title{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--cr);margin-bottom:.4rem;}
.ob-desc{font-size:.87rem;color:var(--muted);line-height:1.6;margin-bottom:1.5rem;}
.ob-step{display:none;}
.ob-step.on{display:block;}
.sys-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.2rem;}
.sys-card{background:var(--s2);border:2px solid var(--border);padding:1.1rem 1rem;cursor:pointer;transition:all .2s;position:relative;}
.sys-card:hover,.sys-card.on{border-color:var(--gold);background:rgba(201,146,42,.07);}
.sys-card .sci{font-size:1.3rem;margin-bottom:.4rem;}
.sys-card .scn{font-family:'Playfair Display',serif;font-size:.9rem;font-weight:700;color:var(--cr);}
.sys-card .scs{font-family:'DM Mono',monospace;font-size:.55rem;color:var(--muted);margin-top:.15rem;}
.sys-card .sch{position:absolute;top:.5rem;right:.6rem;color:var(--gold);opacity:0;font-size:.85rem;}
.sys-card.on .sch{opacity:1;}
.info-box{background:var(--s2);border:1px solid var(--border);padding:.7rem .9rem;font-size:.8rem;color:var(--muted);line-height:1.55;}
.info-box b{color:var(--cr);}
.elo-dbox{background:var(--s2);border:1px solid var(--border);padding:1.2rem;margin-bottom:.9rem;text-align:center;}
.elo-big{font-family:'Playfair Display',serif;font-size:3rem;font-weight:900;color:var(--gold-l);line-height:1;}
.elo-sys-l{font-family:'DM Mono',monospace;font-size:.58rem;color:var(--muted);letter-spacing:.15em;margin-top:.28rem;}
.elo-tier-l{font-family:'DM Mono',monospace;font-size:.62rem;color:var(--gold);margin-top:.32rem;}
.elo-range{display:flex;justify-content:space-between;font-family:'DM Mono',monospace;font-size:.5rem;color:var(--muted);margin-top:.32rem;}
.unlocks-box{background:var(--s2);border:1px solid var(--border);padding:.7rem .9rem;margin-top:.9rem;}
.unlocks-t{font-family:'DM Mono',monospace;font-size:.54rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:.32rem;}
.unlocks-v{font-size:.8rem;color:var(--muted);line-height:1.6;}
.un-block{margin-bottom:1rem;}
.un-hdr{display:flex;align-items:center;gap:.6rem;margin-bottom:.45rem;}
.site-badge{font-family:'DM Mono',monospace;font-size:.54rem;padding:.18rem .52rem;border:1px solid var(--border);}
.site-badge.cc{border-color:#81b64c;color:#81b64c;}
.site-badge.li{border-color:#629924;color:#629924;}
.un-row{display:flex;gap:.38rem;}
.un-st{font-family:'DM Mono',monospace;font-size:.54rem;margin-top:.25rem;min-height:.82rem;}
.un-st.ok{color:#6dbf7e;}.un-st.err{color:#e06060;}.un-st.loading{color:var(--muted);}
.ob-foot{display:flex;align-items:center;justify-content:space-between;padding:.9rem 2.5rem;border-top:1px solid var(--border);background:var(--s2);}
.ob-dots{display:flex;gap:.4rem;}
.ob-dot{width:6px;height:6px;border-radius:50%;background:var(--border);transition:background .3s;}
.ob-dot.on{background:var(--gold);}
.ob-lnk{font-family:'DM Mono',monospace;font-size:.57rem;color:var(--muted);cursor:pointer;border:none;background:none;text-decoration:underline;}
.ob-lnk:hover{color:var(--cr);}
.app-bar{display:flex;align-items:center;justify-content:space-between;padding:.55rem 1.5rem;background:var(--sf);border-bottom:1px solid var(--border);flex-shrink:0;gap:.75rem;}
.app-logo{font-family:'Playfair Display',serif;font-size:.9rem;font-weight:700;color:var(--cr);letter-spacing:.05em;cursor:pointer;}
.app-logo b{color:var(--gold);}
.app-nav{display:flex;gap:.2rem;}
.atab{font-family:'DM Mono',monospace;font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;padding:.38rem .85rem;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .2s;white-space:nowrap;}
.atab.on{border-color:var(--gold);color:var(--gold);background:rgba(201,146,42,.1);}
.atab:hover:not(.on){border-color:var(--cr);color:var(--cr);}
.user-pill{display:flex;align-items:center;gap:.5rem;background:var(--s2);border:1px solid var(--border);padding:.3rem .75rem;cursor:pointer;transition:border-color .2s;}
.user-pill:hover{border-color:var(--gold);}
.up-name{font-family:'DM Mono',monospace;font-size:.62rem;color:var(--cr);}
.up-elo{font-family:'DM Mono',monospace;font-size:.54rem;color:var(--gold);}
.apage{display:none;flex:1;overflow:hidden;flex-direction:column;}
.apage.on{display:flex;}
.pscroll{flex:1;overflow-y:auto;padding:2rem;}
.pscroll::-webkit-scrollbar{width:4px;}
.pscroll::-webkit-scrollbar-thumb{background:var(--border);}
.elo-slider{-webkit-appearance:none;width:100%;height:4px;background:var(--border);border-radius:2px;outline:none;}
.elo-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--gold);cursor:pointer;border:2px solid var(--bg);}
.gbtn{font-family:'DM Mono',monospace;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;padding:.45rem 1.1rem;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .2s;}
.gbtn:hover{border-color:var(--cr);color:var(--cr);}
.gbtn.prime{background:var(--gold);color:var(--bg);border-color:var(--gold);font-weight:500;}
.gbtn.prime:hover{background:var(--gold-l);}
.ginp{background:var(--s2);border:1px solid var(--border);color:var(--cr);font-family:'DM Mono',monospace;font-size:.7rem;padding:.48rem .7rem;outline:none;transition:border-color .2s;}
.ginp:focus{border-color:var(--gold);}
.ginp::placeholder{color:var(--muted);}
.gsel{background:var(--s2);border:1px solid var(--border);color:var(--muted);font-family:'DM Mono',monospace;font-size:.65rem;padding:.48rem .55rem;cursor:pointer;outline:none;}
.rev-layout{display:grid;grid-template-columns:265px 1fr 295px;flex:1;overflow:hidden;}
.lib{background:var(--sf);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;}
.lib-head{padding:.7rem .9rem .55rem;border-bottom:1px solid var(--border);flex-shrink:0;}
.lib-ttl{font-family:'DM Mono',monospace;font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:.65rem;}
.lib-row{display:flex;gap:.3rem;margin-bottom:.38rem;}
.lib-row .ginp{font-size:.62rem;padding:.38rem .5rem;}
.lib-row .gsel{font-size:.58rem;padding:.38rem .42rem;}
.lib-row .gbtn{font-size:.55rem;padding:.38rem .6rem;white-space:nowrap;}
.pgn-lnk{font-family:'DM Mono',monospace;font-size:.55rem;color:var(--muted);cursor:pointer;text-decoration:underline;}
.pgn-lnk:hover{color:var(--cr);}
.pgn-box{display:none;flex-direction:column;gap:.3rem;margin-top:.32rem;}
.pgn-box.open{display:flex;}
.pgn-box textarea{background:var(--s2);border:1px solid var(--border);color:var(--cr);font-family:'DM Mono',monospace;font-size:.58rem;padding:.38rem;resize:vertical;min-height:55px;outline:none;}
.pgn-box textarea:focus{border-color:var(--gold);}
.games-lst{flex:1;overflow-y:auto;}
.games-lst::-webkit-scrollbar{width:3px;}
.games-lst::-webkit-scrollbar-thumb{background:var(--border);}
.g-row{padding:.55rem .9rem;border-bottom:1px solid rgba(46,43,36,.5);cursor:pointer;transition:background .15s;}
.g-row:hover{background:rgba(201,146,42,.06);}
.g-row.on{background:rgba(201,146,42,.12);border-left:2px solid var(--gold);}
.g-top{display:flex;justify-content:space-between;margin-bottom:.15rem;}
.g-res{font-family:'DM Mono',monospace;font-size:.6rem;font-weight:500;}
.g-res.win{color:#6dbf7e;}.g-res.loss{color:#e06060;}.g-res.draw{color:var(--muted);}
.g-date{font-family:'DM Mono',monospace;font-size:.5rem;color:var(--muted);}
.g-players{font-size:.78rem;color:var(--cr);margin-bottom:.1rem;}
.g-open{font-family:'DM Mono',monospace;font-size:.52rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.lib-empty{padding:1rem;text-align:center;font-size:.8rem;color:var(--muted);font-style:italic;}
.brd-center{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem;background:var(--bg);gap:.55rem;}
.brd-wrap{position:relative;}
.brd-ctrls{display:flex;gap:.38rem;align-items:center;}
.bc{font-family:'DM Mono',monospace;font-size:.62rem;padding:.38rem .7rem;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .2s;}
.bc:hover{border-color:var(--cr);color:var(--cr);}
.bc:disabled{opacity:.2;cursor:not-allowed;}
.bc.acc{background:var(--gold);color:var(--bg);border-color:var(--gold);font-weight:500;}
.bc.acc:hover{background:var(--gold-l);}
.spin{display:none;font-family:'DM Mono',monospace;font-size:.6rem;color:var(--gold);align-items:center;gap:.38rem;}
.sd{width:5px;height:5px;border-radius:50%;background:var(--gold);animation:blink 1s ease infinite;}
.sd:nth-child(2){animation-delay:.2s;}.sd:nth-child(3){animation-delay:.4s;}
@keyframes blink{0%,100%{opacity:.2;}50%{opacity:1;}}
.anp{background:var(--sf);border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;}
.anp-blk{padding:.55rem .9rem;border-bottom:1px solid var(--border);flex-shrink:0;}
.anp-lbl{font-family:'DM Mono',monospace;font-size:.54rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:.36rem;}
.ev-outer{height:6px;background:var(--s2);border:1px solid var(--border);border-radius:3px;overflow:hidden;margin-bottom:.3rem;}
.ev-fill{height:100%;background:var(--cr);transition:width .5s ease;border-radius:3px;}
.ev-row{display:flex;justify-content:space-between;}
.ev-score{font-family:'DM Mono',monospace;font-size:.75rem;color:var(--gold-l);}
.ev-depth{font-family:'DM Mono',monospace;font-size:.52rem;color:var(--muted);}
#evCanvas{width:100%;height:50px;display:block;}
.clf-badge{display:inline-flex;align-items:center;gap:.3rem;padding:.24rem .58rem;font-family:'DM Mono',monospace;font-size:.65rem;font-weight:500;letter-spacing:.05em;}
.clf-badge.brilliant{background:rgba(0,200,255,.1);color:var(--brilliant);border:1px solid rgba(0,200,255,.3);}
.clf-badge.great,.clf-badge.best{background:rgba(91,168,94,.08);color:var(--best);border:1px solid rgba(91,168,94,.28);}
.clf-badge.excellent,.clf-badge.good{background:rgba(150,200,74,.07);color:var(--good);border:1px solid rgba(150,200,74,.25);}
.clf-badge.inaccuracy{background:rgba(240,192,64,.08);color:var(--inaccuracy);border:1px solid rgba(240,192,64,.28);}
.clf-badge.mistake{background:rgba(224,128,48,.1);color:var(--mistake);border:1px solid rgba(224,128,48,.28);}
.clf-badge.miss{background:rgba(224,80,80,.08);color:var(--miss);border:1px solid rgba(224,80,80,.28);}
.clf-badge.blunder{background:rgba(204,34,34,.1);color:var(--blunder);border:1px solid rgba(204,34,34,.28);}
.clf-badge.book{background:rgba(100,100,160,.07);color:#9090c0;border:1px solid rgba(100,100,160,.28);}
.ai-row{display:flex;justify-content:space-between;margin-top:.3rem;}
.ai-lbl{font-family:'DM Mono',monospace;font-size:.55rem;color:var(--muted);}
.ai-val{font-family:'DM Mono',monospace;font-size:.62rem;color:var(--cr);}
.acc-grid{display:grid;grid-template-columns:1fr 1fr;gap:.36rem;}
.acc-box{background:var(--s2);border:1px solid var(--border);padding:.42rem;text-align:center;}
.acc-num{font-family:'DM Mono',monospace;font-size:1rem;color:var(--cr);}
.acc-lbl{font-family:'DM Mono',monospace;font-size:.47rem;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-top:.08rem;}
.clf-sum{display:grid;grid-template-columns:repeat(4,1fr);gap:.25rem;margin-top:.42rem;}
.cs-item{background:var(--s2);border:1px solid var(--border);padding:.26rem .15rem;text-align:center;}
.cs-num{font-family:'DM Mono',monospace;font-size:.8rem;}
.cs-lbl{font-family:'DM Mono',monospace;font-size:.43rem;color:var(--muted);letter-spacing:.04em;margin-top:.07rem;}
.ml-scroll{flex:1;overflow-y:auto;}
.ml-scroll::-webkit-scrollbar{width:3px;}
.ml-scroll::-webkit-scrollbar-thumb{background:var(--border);}
.mp{display:grid;grid-template-columns:20px 1fr 1fr;font-family:'DM Mono',monospace;font-size:.68rem;}
.mp-n{padding:.24rem .3rem;color:var(--muted);font-size:.58rem;text-align:right;}
.mp-c{padding:.24rem .4rem;cursor:pointer;display:flex;align-items:center;gap:.24rem;transition:background .12s;}
.mp-c:hover{background:rgba(201,146,42,.09);}
.mp-c.on{background:rgba(201,146,42,.2);}
.mp-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.mp-dot.brilliant{background:var(--brilliant);}
.mp-dot.great,.mp-dot.best,.mp-dot.excellent,.mp-dot.good{background:var(--good);}
.mp-dot.inaccuracy{background:var(--inaccuracy);}
.mp-dot.mistake{background:var(--mistake);}
.mp-dot.miss,.mp-dot.blunder{background:var(--blunder);}
.mp-dot.book{background:#6868a0;}
.sf-offline{background:rgba(201,146,42,.08);border:1px solid rgba(201,146,42,.3);padding:.6rem .9rem;font-family:'DM Mono',monospace;font-size:.62rem;color:var(--gold-l);line-height:1.5;margin:.5rem;}
.play-layout{display:grid;grid-template-columns:250px 1fr 280px;flex:1;overflow:hidden;}
.play-side{background:var(--sf);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;}
.ps-head{padding:.7rem 1rem .55rem;border-bottom:1px solid var(--border);flex-shrink:0;}
.ps-ttl{font-family:'DM Mono',monospace;font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:.65rem;}
.diff-btn{font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;padding:.4rem .75rem;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .2s;text-align:left;display:flex;justify-content:space-between;width:100%;margin-bottom:.28rem;}
.diff-btn.on,.diff-btn:hover{border-color:var(--gold);color:var(--gold);background:rgba(201,146,42,.07);}
.diff-elo{font-size:.52rem;opacity:.7;}
.player-card{display:flex;align-items:center;gap:.7rem;padding:.85rem 1rem;border-bottom:1px solid var(--border);}
.pc-av{width:34px;height:34px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;}
.pc-av.eng{background:rgba(201,146,42,.12);border:1px solid var(--gold);}
.pc-av.hum{background:rgba(78,124,89,.15);border:1px solid #4e7c59;}
.pc-name{font-family:'Playfair Display',serif;font-size:.9rem;font-weight:700;color:var(--cr);}
.pc-rating{font-family:'DM Mono',monospace;font-size:.57rem;color:var(--muted);}
.pc-clock{margin-left:auto;font-family:'DM Mono',monospace;font-size:1rem;color:var(--cr);background:var(--s2);border:1px solid var(--border);padding:.28rem .55rem;min-width:60px;text-align:center;}
.pc-clock.active{border-color:var(--gold);color:var(--gold-l);box-shadow:0 0 10px rgba(201,146,42,.18);}
.cap-sec{padding:.65rem 1rem;border-bottom:1px solid var(--border);min-height:44px;}
.cap-lbl{font-family:'DM Mono',monospace;font-size:.55rem;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-bottom:.32rem;}
.cap-pieces{font-size:.9rem;letter-spacing:.04em;min-height:1.2rem;}
.moves-scroll{flex:1;overflow-y:auto;}
.moves-scroll::-webkit-scrollbar{width:3px;}
.moves-scroll::-webkit-scrollbar-thumb{background:var(--border);}
.mr{display:grid;grid-template-columns:26px 1fr 1fr;font-family:'DM Mono',monospace;font-size:.72rem;}
.mr-n{padding:.28rem .42rem;color:var(--muted);font-size:.62rem;text-align:right;}
.mr-c{padding:.28rem .45rem;transition:background .12s;}
.mr-c.on{background:rgba(201,146,42,.2);color:var(--gold-l);}
.play-right{background:var(--sf);border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;}
.pr-blk{padding:.55rem .9rem;border-bottom:1px solid var(--border);flex-shrink:0;}
.pr-lbl{font-family:'DM Mono',monospace;font-size:.54rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:.35rem;}
.tip-box{margin:.8rem;padding:.8rem;background:rgba(201,146,42,.05);border-left:2px solid var(--gold);}
.tip-ttl{font-family:'DM Mono',monospace;font-size:.54rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:.32rem;}
.tip-txt{font-size:.85rem;line-height:1.55;color:var(--cr);opacity:.7;font-style:italic;}
.game-over{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:300;backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .4s;}
.game-over.show{opacity:1;pointer-events:all;}
.go-card{background:var(--sf);border:1px solid var(--gold);padding:2.8rem 3.2rem;text-align:center;max-width:380px;transform:translateY(16px);transition:transform .4s;}
.game-over.show .go-card{transform:none;}
.go-icon{font-size:3.5rem;margin-bottom:.9rem;}
.go-title{font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:900;color:var(--cr);margin-bottom:.4rem;}
.go-sub{font-size:.95rem;color:var(--muted);margin-bottom:1.8rem;}
.go-btn{font-family:'DM Mono',monospace;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;background:var(--gold);color:var(--bg);border:none;padding:.85rem 2.2rem;cursor:pointer;font-weight:500;transition:background .2s;}
.go-btn:hover{background:var(--gold-l);}
.play-status{font-family:'DM Mono',monospace;font-size:.68rem;text-align:center;color:var(--gold);}
.play-info{font-family:'DM Mono',monospace;font-size:.58rem;text-align:center;color:var(--muted);margin-top:.2rem;}
.open-layout{display:grid;grid-template-columns:285px 1fr;flex:1;overflow:hidden;}
.open-side{background:var(--sf);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;}
.os-head{padding:.7rem .9rem .55rem;border-bottom:1px solid var(--border);flex-shrink:0;}
.os-ttl{font-family:'DM Mono',monospace;font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:.6rem;}
.os-search{width:100%;background:var(--s2);border:1px solid var(--border);color:var(--cr);font-family:'DM Mono',monospace;font-size:.65rem;padding:.4rem .65rem;outline:none;margin-bottom:.42rem;}
.os-search:focus{border-color:var(--gold);}
.os-search::placeholder{color:var(--muted);}
.cat-tabs{display:flex;flex-wrap:wrap;gap:0;border-bottom:1px solid var(--border);}
.ctab{font-family:'DM Mono',monospace;font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;padding:.42rem .65rem;border:none;background:transparent;color:var(--muted);cursor:pointer;transition:all .2s;border-right:1px solid var(--border);}
.ctab.on,.ctab:hover{color:var(--gold);background:rgba(201,146,42,.07);}
.open-list{flex:1;overflow-y:auto;}
.open-list::-webkit-scrollbar{width:3px;}
.open-list::-webkit-scrollbar-thumb{background:var(--border);}
.og-lbl{font-family:'DM Mono',monospace;font-size:.55rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);padding:.55rem .9rem .28rem;opacity:.7;}
.oi{padding:.6rem .9rem;border-bottom:1px solid rgba(46,43,36,.5);cursor:pointer;transition:background .15s;}
.oi:hover{background:rgba(201,146,42,.06);}
.oi.on{background:rgba(201,146,42,.13);border-left:2px solid var(--gold);}
.oi-eco{font-family:'DM Mono',monospace;font-size:.52rem;color:var(--gold);opacity:.7;margin-bottom:.1rem;}
.oi-name{font-family:'Playfair Display',serif;font-size:.85rem;font-weight:700;color:var(--cr);}
.oi-moves{font-family:'DM Mono',monospace;font-size:.55rem;color:var(--muted);}
.open-main{display:flex;flex-direction:column;overflow:hidden;}
.open-board-area{flex:1;display:flex;align-items:center;justify-content:center;gap:1.5rem;padding:1rem;background:var(--bg);overflow:hidden;}
.open-info{min-width:220px;max-width:255px;display:flex;flex-direction:column;gap:.7rem;}
.oi-box{background:var(--sf);border:1px solid var(--border);padding:.9rem 1rem;}
.oi-eco2{font-family:'DM Mono',monospace;font-size:.56rem;color:var(--gold);letter-spacing:.15em;margin-bottom:.28rem;}
.oi-name2{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:var(--cr);margin-bottom:.32rem;}
.oi-mv{font-family:'DM Mono',monospace;font-size:.62rem;color:var(--muted);line-height:1.7;}
.oi-desc{font-size:.84rem;line-height:1.55;color:var(--cr);opacity:.62;margin-top:.42rem;font-style:italic;}
.tag-row{display:flex;flex-wrap:wrap;gap:.28rem;margin-top:.45rem;}
.otag{font-family:'DM Mono',monospace;font-size:.52rem;letter-spacing:.08em;text-transform:uppercase;padding:.15rem .45rem;border:1px solid var(--border);color:var(--muted);}
.otag.sharp{border-color:var(--blunder);color:#e06060;}
.otag.solid{border-color:#4e7c59;color:#6dbf7e;}
.otag.positional{border-color:#4a6b8b;color:#7ab0d8;}
.otag.gambit{border-color:#7c5c1e;color:var(--gold-l);}
.otag.beginner{border-color:#4e7c59;color:#6dbf7e;}
.otag.advanced{border-color:#6b3a6b;color:#c07ad8;}
.ms-box{background:var(--sf);border:1px solid var(--border);padding:.7rem .9rem;}
.ms-lbl{font-family:'DM Mono',monospace;font-size:.54rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:.42rem;}
.ms-list{display:flex;flex-direction:column;gap:.18rem;max-height:150px;overflow-y:auto;}
.ms-list::-webkit-scrollbar{width:3px;}
.ms-list::-webkit-scrollbar-thumb{background:var(--border);}
.ms-item{font-family:'DM Mono',monospace;font-size:.68rem;padding:.26rem .45rem;cursor:pointer;transition:background .15s;display:flex;gap:.45rem;}
.ms-item:hover{background:rgba(201,146,42,.09);}
.ms-item.on{background:rgba(201,146,42,.2);color:var(--gold-l);}
.ms-num{color:var(--muted);min-width:18px;}
.ss-row{display:flex;gap:.3rem;align-items:center;flex-wrap:wrap;}
.ss-lbl{font-family:'DM Mono',monospace;font-size:.55rem;color:var(--muted);white-space:nowrap;}
.ss-btn{font-family:'DM Mono',monospace;font-size:.56rem;letter-spacing:.08em;text-transform:uppercase;padding:.3rem .62rem;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .2s;}
.ss-btn.on,.ss-btn:hover{border-color:var(--gold);color:var(--gold);}
.open-ctrls{background:var(--sf);border-top:1px solid var(--border);padding:.6rem 1.5rem;display:flex;align-items:center;justify-content:center;gap:.6rem;flex-shrink:0;}
.oc{font-family:'DM Mono',monospace;font-size:.65rem;padding:.42rem .8rem;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .2s;}
.oc:hover{border-color:var(--cr);color:var(--cr);}
.oc:disabled{opacity:.22;cursor:not-allowed;}
.oc.play-btn{background:var(--gold);color:var(--bg);border-color:var(--gold);font-weight:500;padding:.42rem 1.3rem;}
.oc.play-btn:hover{background:var(--gold-l);}
.prog-wrap{flex:1;max-width:260px;height:4px;background:var(--border);border-radius:2px;overflow:hidden;}
.prog-fill{height:100%;background:var(--gold);border-radius:2px;transition:width .3s;}
.mv-counter{font-family:'DM Mono',monospace;font-size:.68rem;color:var(--muted);min-width:70px;text-align:center;}
.speed-sel{font-family:'DM Mono',monospace;font-size:.62rem;background:var(--s2);border:1px solid var(--border);color:var(--muted);padding:.4rem .6rem;cursor:pointer;outline:none;}
.bots-layout{display:grid;grid-template-columns:250px 1fr;flex:1;overflow:hidden;}
.bots-side{background:var(--sf);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;padding:1.1rem;}
.bots-side::-webkit-scrollbar{width:3px;}
.bots-side::-webkit-scrollbar-thumb{background:var(--border);}
.bs-ttl{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;color:var(--cr);margin-bottom:.2rem;}
.bs-sub{font-size:.8rem;color:var(--muted);line-height:1.5;margin-bottom:1rem;}
.bs-div{height:1px;background:var(--border);margin:.8rem 0;}
.your-elo-box{background:var(--s2);border:1px solid var(--border);padding:.6rem .85rem;margin-bottom:.65rem;display:flex;justify-content:space-between;align-items:center;}
.ye-val{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:var(--gold-l);}
.ye-sys{font-family:'DM Mono',monospace;font-size:.54rem;color:var(--muted);}
.flt-stack{display:flex;flex-direction:column;gap:.25rem;}
.flt-btn{font-family:'DM Mono',monospace;font-size:.57rem;letter-spacing:.07em;text-transform:uppercase;padding:.36rem .68rem;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .2s;text-align:left;}
.flt-btn.on,.flt-btn:hover{border-color:var(--gold);color:var(--gold);background:rgba(201,146,42,.07);}
.bots-main{overflow-y:auto;padding:1.3rem 1.4rem;}
.bots-main::-webkit-scrollbar{width:4px;}
.bots-main::-webkit-scrollbar-thumb{background:var(--border);}
.tier-ttl{font-family:'Playfair Display',serif;font-size:.9rem;font-weight:700;color:var(--cr);margin-bottom:.6rem;display:flex;align-items:center;gap:.6rem;}
.tier-ttl::after{content:'';flex:1;height:1px;background:var(--border);}
.bots-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.6rem;margin-bottom:1.6rem;}
.bot-card{background:var(--sf);border:1px solid var(--border);padding:1.05rem .9rem;cursor:pointer;transition:all .22s;position:relative;overflow:hidden;}
.bot-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--gold);transform:scaleX(0);transition:transform .25s;transform-origin:left;}
.bot-card:hover{border-color:rgba(201,146,42,.38);transform:translateY(-2px);}
.bot-card:hover::after{transform:scaleX(1);}
.bot-card.rec{border-color:rgba(201,146,42,.32);}
.bot-card.rec::after{transform:scaleX(1);}
.bot-rec-tag{position:absolute;top:.35rem;right:.35rem;font-family:'DM Mono',monospace;font-size:.42rem;letter-spacing:.08em;background:var(--gold);color:var(--bg);padding:.08rem .35rem;}
.bot-av{font-size:1.75rem;margin-bottom:.52rem;}
.bot-name{font-family:'Playfair Display',serif;font-size:.88rem;font-weight:700;color:var(--cr);margin-bottom:.2rem;}
.bot-elo-row{display:flex;gap:.32rem;align-items:center;margin-bottom:.28rem;flex-wrap:wrap;}
.bot-elo{font-family:'DM Mono',monospace;font-size:.6rem;color:var(--gold);}
.bot-stag{font-family:'DM Mono',monospace;font-size:.46rem;padding:.07rem .3rem;border:1px solid var(--border);color:var(--muted);}
.bot-desc{font-size:.76rem;color:var(--muted);line-height:1.5;margin-bottom:.55rem;}
.bot-play{font-family:'DM Mono',monospace;font-size:.54rem;letter-spacing:.08em;text-transform:uppercase;padding:.32rem .68rem;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;width:100%;transition:all .2s;}
.bot-play:hover,.bot-card:hover .bot-play{border-color:var(--gold);color:var(--gold);}
.prof-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;max-width:840px;}
.prof-hero{background:var(--sf);border:1px solid var(--border);padding:1.5rem;grid-column:1/-1;}
.ph-row{display:flex;align-items:flex-start;gap:1.25rem;}
.ph-av{width:65px;height:65px;background:var(--s2);border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:1.9rem;flex-shrink:0;}
.ph-name{font-family:'Playfair Display',serif;font-size:1.45rem;font-weight:700;margin-bottom:.15rem;color:var(--cr);}
.ph-sys{font-family:'DM Mono',monospace;font-size:.56rem;color:var(--muted);letter-spacing:.1em;margin-bottom:.6rem;}
.ph-ratings{display:flex;gap:.52rem;flex-wrap:wrap;}
.ph-rc{background:var(--s2);border:1px solid var(--border);padding:.42rem .75rem;text-align:center;}
.ph-rv{font-family:'DM Mono',monospace;font-size:1rem;color:var(--cr);}
.ph-rl{font-family:'DM Mono',monospace;font-size:.46rem;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-top:.08rem;}
.ph-rs{font-family:'DM Mono',monospace;font-size:.44rem;color:var(--gold);margin-top:.07rem;}
.stats-row{display:flex;gap:.42rem;margin-top:.85rem;flex-wrap:wrap;}
.stat-b{background:var(--s2);border:1px solid var(--border);padding:.48rem .75rem;text-align:center;min-width:76px;}
.stat-v{font-family:'DM Mono',monospace;font-size:.95rem;color:var(--cr);}
.stat-l{font-family:'DM Mono',monospace;font-size:.45rem;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-top:.08rem;}
.sc{background:var(--sf);border:1px solid var(--border);padding:1.05rem;}
.sc-title{font-family:'Playfair Display',serif;font-size:.9rem;font-weight:700;margin-bottom:.8rem;padding-bottom:.42rem;border-bottom:1px solid var(--border);color:var(--cr);}
.srow{display:flex;align-items:center;justify-content:space-between;padding:.45rem 0;border-bottom:1px solid rgba(46,43,36,.4);}
.srow:last-child{border-bottom:none;}
.sr-l{font-size:.82rem;color:var(--cr);}
.sr-s{font-family:'DM Mono',monospace;font-size:.55rem;color:var(--muted);margin-top:.07rem;}
.tgl{position:relative;width:30px;height:16px;cursor:pointer;flex-shrink:0;}
.tgl input{opacity:0;width:0;height:0;position:absolute;}
.tgl-sl{position:absolute;inset:0;background:var(--border);border-radius:8px;transition:.25s;}
.tgl-sl::before{content:'';position:absolute;width:10px;height:10px;left:3px;top:3px;background:var(--muted);border-radius:50%;transition:.25s;}
.tgl input:checked+.tgl-sl{background:rgba(201,146,42,.25);}
.tgl input:checked+.tgl-sl::before{background:var(--gold);transform:translateX(14px);}
.sys-btns{display:flex;gap:.32rem;}
.sys-btn{font-family:'DM Mono',monospace;font-size:.55rem;padding:.26rem .58rem;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .2s;}
.sys-btn.on{border-color:var(--gold);color:var(--gold);}
@media(max-width:1100px){.atab{font-size:.5rem;padding:.3rem .65rem;}}
@media(max-width:900px){
  .ln-hero{grid-template-columns:1fr;}.hero-right{display:none;}
  .ln-links{display:none;}
  .paths-grid{grid-template-columns:1fr;}
  .tac-grid{grid-template-columns:repeat(2,1fr);}
  .masters-row{grid-template-columns:repeat(2,1fr);}
  .ln-cta-sec{grid-template-columns:1fr;}
  .rev-layout{grid-template-columns:1fr;}.lib,.anp{display:none;}
  .play-layout{grid-template-columns:1fr;}.play-side,.play-right{display:none;}
  .open-layout{grid-template-columns:1fr;}.open-side{display:none;}
  .bots-layout{grid-template-columns:1fr;}.bots-side{display:none;}
  .prof-grid{grid-template-columns:1fr;}
}
</style>
</head>
<body>

<div id="landing">
<nav class="ln-nav">
  <div class="ln-logo">Grandmaster <span>Academy</span></div>
  <ul class="ln-links">
    <li><a href="#lessons">Lessons</a></li>
    <li><a href="#tactics">Tactics</a></li>
    <li><a href="#masters">Masters</a></li>
    <li><a href="#cta">Start</a></li>
  </ul>
  <button class="ln-cta-btn" onclick="launchApp()">Start Learning Free</button>
</nav>

<section class="ln-hero">
  <div class="hero-left">
    <div class="hero-eye">Structured Chess Education</div>
    <h1 class="hero-h1">Think Three<br>Moves <em>Ahead.</em></h1>
    <p class="hero-desc">From your first pawn push to grandmaster-level strategy — learn chess the way the world's best players did, with real Stockfish-powered game analysis.</p>
    <div class="hero-actions">
      <button class="hero-btn-main" onclick="launchApp()">Begin Your Journey</button>
      <button class="hero-btn-ghost" onclick="launchApp()">Watch a free lesson →</button>
    </div>
    <div class="hero-stats">
      <div><div class="hstat-num">240+</div><div class="hstat-lbl">Video Lessons</div></div>
      <div><div class="hstat-num">18k</div><div class="hstat-lbl">Active Learners</div></div>
      <div><div class="hstat-num">94%</div><div class="hstat-lbl">Rating Improvement</div></div>
    </div>
  </div>
  <div class="hero-right">
    <div class="hero-board-wrap">
      <div class="hero-mini-board" id="heroBoard"></div>
    </div>
  </div>
</section>

<section class="ln-sec dark" id="lessons">
  <div class="sec-tag">Learning Paths</div>
  <h2 class="sec-h2">Choose Your <em>Path to Mastery</em></h2>
  <div class="paths-grid">
    <div class="path-card fade-in"><span class="pc-icon">♟</span><div class="pc-lvl">Beginner · 0–800 ELO</div><div class="pc-name">Pawn &amp; Piece Fundamentals</div><p class="pc-desc">Learn how every piece moves, basic checkmates, and the principles that govern every position.</p><div class="pc-count">32 lessons · 8 hrs</div></div>
    <div class="path-card fade-in"><span class="pc-icon">♞</span><div class="pc-lvl">Intermediate · 800–1500 ELO</div><div class="pc-name">Tactical Arsenal</div><p class="pc-desc">Master forks, pins, skewers, discovered attacks, and the motifs that win most club games.</p><div class="pc-count">56 lessons · 14 hrs</div></div>
    <div class="path-card fade-in"><span class="pc-icon">♛</span><div class="pc-lvl">Advanced · 1500+ ELO</div><div class="pc-name">Strategic Thinking</div><p class="pc-desc">Pawn structures, piece activity, prophylaxis, and the deep positional understanding of titled players.</p><div class="pc-count">88 lessons · 24 hrs</div></div>
    <div class="path-card fade-in"><span class="pc-icon">♜</span><div class="pc-lvl">All Levels</div><div class="pc-name">Endgame Mastery</div><p class="pc-desc">From basic King &amp; Pawn to Rook endgames — the phase most players neglect and titled players dominate.</p><div class="pc-count">45 lessons · 11 hrs</div></div>
    <div class="path-card fade-in"><span class="pc-icon">♝</span><div class="pc-lvl">Intermediate+</div><div class="pc-name">Opening Repertoire</div><p class="pc-desc">Build a solid, complete opening repertoire for both White and Black based on your style.</p><div class="pc-count">60 lessons · 16 hrs</div></div>
    <div class="path-card fade-in"><span class="pc-icon">♚</span><div class="pc-lvl">Advanced</div><div class="pc-name">Grandmaster Games</div><p class="pc-desc">Study annotated masterpieces from Fischer, Kasparov, Magnus, and Tal to absorb deep chess thinking.</p><div class="pc-count">40 lessons · 20 hrs</div></div>
  </div>
</section>

<section class="ln-sec" id="tactics">
  <div class="sec-tag">Tactical Motifs</div>
  <h2 class="sec-h2">Win Games with <em>Sharp Tactics</em></h2>
  <div class="tac-grid">
    <div class="tac-card fade-in"><div class="tac-icon">⚔️</div><div class="tac-name">Fork</div><p class="tac-desc">Attack two or more pieces simultaneously with one move. The Knight is the master of this art.</p></div>
    <div class="tac-card fade-in"><div class="tac-icon">📌</div><div class="tac-name">Pin</div><p class="tac-desc">Immobilize a piece by threatening the more valuable piece behind it. Absolute pins freeze the King.</p></div>
    <div class="tac-card fade-in"><div class="tac-icon">🎯</div><div class="tac-name">Skewer</div><p class="tac-desc">The reverse pin — attack a valuable piece that, when it moves, exposes another piece to capture.</p></div>
    <div class="tac-card fade-in"><div class="tac-icon">💥</div><div class="tac-name">Discovered Attack</div><p class="tac-desc">Move one piece to unleash a devastating attack from the piece behind it — often a double threat.</p></div>
    <div class="tac-card fade-in"><div class="tac-icon">🔥</div><div class="tac-name">Sacrifice</div><p class="tac-desc">Give up material to open lines, expose the King, or gain a superior position.</p></div>
    <div class="tac-card fade-in"><div class="tac-icon">♟</div><div class="tac-name">Pawn Storm</div><p class="tac-desc">Advance pawns aggressively to create threats, open files, and overwhelm the opponent's King-side.</p></div>
    <div class="tac-card fade-in"><div class="tac-icon">🏰</div><div class="tac-name">Back Rank Mate</div><p class="tac-desc">Exploit the trapped King on its back rank when pawns block the escape — a classic endgame pattern.</p></div>
    <div class="tac-card fade-in"><div class="tac-icon">👑</div><div class="tac-name">Zwischenzug</div><p class="tac-desc">An in-between move ignoring the expected reply for a stronger threat. Changes the whole evaluation.</p></div>
  </div>
</section>

<div class="quote-banner">
  <p class="quote-text">"Chess is not just about winning — it is about understanding. Every mistake is a lesson waiting to be learned."</p>
  <div class="quote-attr">— Garry Kasparov, World Chess Champion</div>
</div>

<section class="ln-sec" id="masters">
  <div class="sec-tag">Your Instructors</div>
  <h2 class="sec-h2">Learn from <em>Titled Players</em></h2>
  <div class="masters-row">
    <div class="master-card fade-in"><div class="master-av">♚</div><div class="master-name">GM Elena Volkov</div><div class="master-title">Grandmaster · 2680 ELO</div><div class="master-lessons">Strategy &amp; Positional Play · 48 lessons</div></div>
    <div class="master-card fade-in"><div class="master-av">♛</div><div class="master-name">IM David Osei</div><div class="master-title">International Master · 2450 ELO</div><div class="master-lessons">Openings &amp; Theory · 62 lessons</div></div>
    <div class="master-card fade-in"><div class="master-av">♜</div><div class="master-name">FM Sara Lindqvist</div><div class="master-title">FIDE Master · 2320 ELO</div><div class="master-lessons">Tactics &amp; Endgames · 55 lessons</div></div>
    <div class="master-card fade-in"><div class="master-av">♞</div><div class="master-name">GM Ryo Nakashima</div><div class="master-title">Grandmaster · 2590 ELO</div><div class="master-lessons">Attacking Chess · 38 lessons</div></div>
  </div>
</section>

<div class="ln-cta-sec" id="cta">
  <div><h2 class="cta-title">Your <em>Next Move</em><br>Starts Here.</h2></div>
  <div class="cta-right">
    <div class="cta-feat"><span class="cta-check">♟</span><span class="cta-feat-text">Structured curriculum from beginner to advanced — no scattered searching</span></div>
    <div class="cta-feat"><span class="cta-check">♟</span><span class="cta-feat-text">Interactive puzzles with 50,000+ positions to sharpen your tactical vision</span></div>
    <div class="cta-feat"><span class="cta-check">♟</span><span class="cta-feat-text">Stockfish analysis — every move classified from Brilliant to Blunder</span></div>
    <div class="cta-feat"><span class="cta-check">♟</span><span class="cta-feat-text">Load your real Chess.com or Lichess games for instant deep review</span></div>
    <div class="cta-feat"><span class="cta-check">♟</span><span class="cta-feat-text">Play 20 practice bots matched exactly to your ELO rating level</span></div>
    <button class="cta-launch" onclick="launchApp()">Join Free — Start Today</button>
  </div>
</div>

<footer class="ln-footer">
  <div class="footer-logo">Grandmaster <span>Academy</span></div>
  <ul class="footer-links">
    <li><a href="#">Lessons</a></li><li><a href="#">Openings</a></li>
    <li><a href="#">Puzzles</a></li><li><a href="#">Community</a></li>
    <li><a href="#">Blog</a></li><li><a href="#">About</a></li>
  </ul>
  <div class="footer-copy">© 2026 Grandmaster Academy</div>
</footer>
</div>

<div class="ob gone" id="ob">
<div class="ob-card">
  <div class="ob-prog"><div class="ob-pfill" id="obFill" style="width:33%"></div></div>
  <div class="ob-body">
    <div class="ob-brand"><div class="ob-brand-icon">♛</div><div class="ob-brand-txt">Grandmaster <b>Academy</b></div></div>
    <div class="ob-step on" id="obs1">
      <div class="ob-sn">Step 1 of 3 — Rating System</div>
      <div class="ob-title">Which platform do you play on?</div>
      <div class="ob-desc">Choose your rating scale. All adaptive systems — bots, openings, and analysis depth — calibrate to this. Change it anytime in My Profile.</div>
      <div class="sys-grid">
        <div class="sys-card on" data-sys="chesscom" onclick="obSys(this)"><div class="sci">♟</div><span class="sch">✓</span><div class="scn">Chess.com</div><div class="scs">Rapid · Blitz · Bullet · Daily</div></div>
        <div class="sys-card" data-sys="lichess" onclick="obSys(this)"><div class="sci">♜</div><span class="sch">✓</span><div class="scn">Lichess</div><div class="scs">Classical · Rapid · Blitz · Bullet</div></div>
      </div>
      <div class="info-box">💡 Lichess ratings typically run <b>100–200 points higher</b> than Chess.com for the same strength player. We show both where relevant.</div>
    </div>
    <div class="ob-step" id="obs2">
      <div class="ob-sn">Step 2 of 3 — Your Rating</div>
      <div class="ob-title">What's your current rating?</div>
      <div class="ob-desc">Slide to your approximate rating. Don't know it? Make a guess — you can update it anytime. This tunes every difficulty system to your level.</div>
      <div class="elo-dbox"><div class="elo-big" id="obEloBig">800</div><div class="elo-sys-l" id="obSysL">CHESS.COM RATING</div><div class="elo-tier-l" id="obTier">Club Beginner</div></div>
      <input type="range" class="elo-slider" id="obSlider" min="100" max="3000" value="800" oninput="obElo(this.value)">
      <div class="elo-range"><span>100 Beginner</span><span>1200 Club</span><span>1800 Advanced</span><span>2400 Master</span></div>
      <div class="unlocks-box"><div class="unlocks-t">What this unlocks at your level</div><div class="unlocks-v" id="obUnlocks">Beginner bots · Basic openings · Tactics Level 1 · Depth-12 analysis</div></div>
    </div>
    <div class="ob-step" id="obs3">
      <div class="ob-sn">Step 3 of 3 — Connect Accounts</div>
      <div class="ob-title">Add your usernames</div>
      <div class="ob-desc">Connect your Chess.com and/or Lichess accounts to instantly load your last 10 games for review. Completely optional — paste a PGN manually anytime.</div>
      <div class="un-block">
        <div class="un-hdr"><div class="site-badge cc">Chess.com</div><span style="font-family:'DM Mono',monospace;font-size:.54rem;color:var(--muted);">Public API · No login required</span></div>
        <div class="un-row"><input class="ginp" id="obCC" placeholder="Chess.com username" style="flex:1;" oninput="clrSt('ccSt')"><button class="gbtn" onclick="verify('chesscom')" style="font-size:.55rem;padding:.4rem .72rem;white-space:nowrap;">Verify</button></div>
        <div class="un-st" id="ccSt"></div>
      </div>
      <div class="un-block">
        <div class="un-hdr"><div class="site-badge li">Lichess</div><span style="font-family:'DM Mono',monospace;font-size:.54rem;color:var(--muted);">Public API · No login required</span></div>
        <div class="un-row"><input class="ginp" id="obLi" placeholder="Lichess username" style="flex:1;" oninput="clrSt('liSt')"><button class="gbtn" onclick="verify('lichess')" style="font-size:.55rem;padding:.4rem .72rem;white-space:nowrap;">Verify</button></div>
        <div class="un-st" id="liSt"></div>
      </div>
      <div class="info-box" style="margin-top:.5rem;">🔒 We never store credentials. Games are fetched live from each platform's free public API.</div>
    </div>
  </div>
  <div class="ob-foot">
    <button class="ob-lnk" id="obBack" onclick="obPrev()" style="visibility:hidden">← Back</button>
    <div class="ob-dots"><div class="ob-dot on" id="od0"></div><div class="ob-dot" id="od1"></div><div class="ob-dot" id="od2"></div></div>
    <div style="display:flex;align-items:center;gap:.85rem;"><span class="ob-lnk" onclick="obDone()">Skip</span><button class="gbtn prime" id="obNext" onclick="obFwd()">Next →</button></div>
  </div>
</div>
</div>

<div id="app" style="display:none;">
  <div class="app-bar">
    <div class="app-logo" onclick="goLanding()">Grandmaster <b>Academy</b></div>
    <div class="app-nav">
      <button class="atab on" onclick="goPage('review',this)">Game Review</button>
      <button class="atab" onclick="goPage('play',this)">Play vs Engine</button>
      <button class="atab" onclick="goPage('openings',this)">Openings</button>
      <button class="atab" onclick="goPage('bots',this)">Practice Bots</button>
      <button class="atab" onclick="goPage('profile',this)">My Profile</button>
    </div>
    <div class="user-pill" onclick="goPage('profile',null)">
      <span style="font-size:.9rem;">♟</span>
      <div><div class="up-name" id="topName">Player</div><div class="up-elo" id="topElo">ELO 800 · Chess.com</div></div>
    </div>
  </div>

  <div class="apage on" id="page-review">
    <div class="rev-layout" style="flex:1;overflow:hidden;">
      <div class="lib">
        <div class="lib-head">
          <div class="lib-ttl">Game Library</div>
          <div class="lib-row">
            <input class="ginp" id="fetchU" placeholder="Username...">
            <select class="gsel" id="fetchSt"><option value="chesscom">Chess.com</option><option value="lichess">Lichess</option></select>
            <button class="gbtn prime" onclick="fetchGames()">Load</button>
          </div>
          <span class="pgn-lnk" onclick="tPgn()">+ Paste PGN</span>
          <div class="pgn-box" id="pgnBox">
            <textarea id="pgnTxt" placeholder="Paste full PGN here..."></textarea>
            <button class="gbtn" onclick="loadPgn()" style="font-size:.55rem;padding:.33rem;">Analyze PGN →</button>
          </div>
        </div>
        <div class="games-lst" id="gameList"><div class="lib-empty">Enter a username above<br>or paste a PGN to begin.</div></div>
      </div>
      <div class="brd-center">
        <div class="brd-wrap">
          <div class="rk-coords" id="revRk"></div>
          <div id="revBoard" class="board-grid"></div>
          <div class="fl-coords" id="revFl"></div>
        </div>
        <div class="brd-ctrls">
          <button class="bc" onclick="rGo(0)">⏮</button>
          <button class="bc" onclick="rGo(rStep-1)">◀</button>
          <button class="bc acc" id="analyzeBtn" onclick="analyzeGame()">⚡ Analyze Game</button>
          <button class="bc" onclick="rGo(rStep+1)">▶</button>
          <button class="bc" onclick="rGo(rMoves.length)">⏭</button>
          <div class="spin" id="spinEl"><div class="sd"></div><div class="sd"></div><div class="sd"></div><span id="spinPct">0%</span></div>
        </div>
      </div>
      <div class="anp">
        <div class="anp-blk">
          <div class="anp-lbl">Evaluation</div>
          <div class="ev-outer"><div class="ev-fill" id="evFill" style="width:50%"></div></div>
          <div class="ev-row"><div class="ev-score" id="evScore">0.0</div><div class="ev-depth" id="evDepth">depth —</div></div>
        </div>
        <div class="anp-blk" style="padding:.45rem .9rem;">
          <div class="anp-lbl">Game Graph</div>
          <canvas id="evCanvas"></canvas>
        </div>
        <div class="anp-blk">
          <div class="anp-lbl">Move Classification</div>
          <div id="badgeEl"><div class="clf-badge book">📖 Starting Position</div></div>
          <div class="ai-row"><span class="ai-lbl">Best move</span><span class="ai-val" id="bestMv">—</span></div>
          <div class="ai-row"><span class="ai-lbl">CP loss</span><span class="ai-val" id="cpLoss">—</span></div>
          <div class="ai-row"><span class="ai-lbl">Phase</span><span class="ai-val" id="phaseEl">—</span></div>
        </div>
        <div id="sfOffline" class="sf-offline" style="display:none;">⚠ Stockfish requires a secure connection. Deploy to GitHub Pages or Netlify (free) to enable full game analysis.</div>
        <div class="anp-blk" id="sumBlk" style="display:none;">
          <div class="anp-lbl">Accuracy</div>
          <div class="acc-grid"><div class="acc-box"><div class="acc-num" id="accW">—</div><div class="acc-lbl">White</div></div><div class="acc-box"><div class="acc-num" id="accB">—</div><div class="acc-lbl">Black</div></div></div>
          <div class="anp-lbl" style="margin-top:.5rem;">Breakdown</div>
          <div class="clf-sum" id="clfSum"></div>
        </div>
        <div class="anp-lbl" style="padding:.45rem .9rem .18rem;flex-shrink:0;">Move List</div>
        <div class="ml-scroll" id="mlScroll"><div class="lib-empty" style="padding:.65rem;">Load a game to begin.</div></div>
      </div>
    </div>
  </div>

  <div class="apage" id="page-play">
    <div class="play-layout" style="flex:1;overflow:hidden;">
      <div class="play-side">
        <div class="ps-head">
          <div class="ps-ttl">Engine Difficulty</div>
          <button class="diff-btn on" data-depth="2" onclick="setDiff(this)">Beginner <span class="diff-elo">~1200</span></button>
          <button class="diff-btn" data-depth="5" onclick="setDiff(this)">Intermediate <span class="diff-elo">~1600</span></button>
          <button class="diff-btn" data-depth="10" onclick="setDiff(this)">Advanced <span class="diff-elo">~2000</span></button>
          <button class="diff-btn" data-depth="15" onclick="setDiff(this)">Expert <span class="diff-elo">~2200</span></button>
          <button class="diff-btn" data-depth="20" onclick="setDiff(this)">Master <span class="diff-elo">~2400</span></button>
        </div>
        <div class="player-card">
          <div class="pc-av eng">♚</div>
          <div><div class="pc-name">Stockfish</div><div class="pc-rating" id="engRating">Beginner · ~1200</div></div>
          <div class="pc-clock" id="engClock">—</div>
        </div>
        <div class="cap-sec"><div class="cap-lbl">Captured by engine</div><div class="cap-pieces" id="engCap"></div></div>
        <div class="anp-lbl" style="padding:.65rem 1rem .28rem;border-top:1px solid var(--border);flex-shrink:0;">Move History</div>
        <div class="moves-scroll" id="playMoves"><div class="lib-empty" style="padding:1rem;">Game not started.</div></div>
        <div class="cap-sec" style="border-top:1px solid var(--border);border-bottom:none;"><div class="cap-lbl">Captured by you</div><div class="cap-pieces" id="humCap"></div></div>
        <div class="player-card">
          <div class="pc-av hum">♔</div>
          <div><div class="pc-name">You</div><div class="pc-rating">Playing as White</div></div>
          <div class="pc-clock active" id="humClock">—</div>
        </div>
      </div>
      <div class="brd-center">
        <div class="brd-wrap">
          <div class="rk-coords" id="playRk"></div>
          <div id="playBoard" class="board-grid"></div>
          <div class="fl-coords" id="playFl"></div>
        </div>
        <div class="brd-ctrls">
          <button class="bc" onclick="flipPlay()">Flip ⇅</button>
          <button class="bc" onclick="undoPlay()">Undo ←</button>
          <button class="bc acc" onclick="newPlayGame()">New Game</button>
        </div>
        <div class="play-status" id="playStatus">Your turn — White to move</div>
        <div class="play-info" id="playInfo">Click a piece to select it</div>
      </div>
      <div class="play-right">
        <div class="pr-blk">
          <div class="pr-lbl">Evaluation</div>
          <div class="ev-outer"><div class="ev-fill" id="playEvFill" style="width:50%"></div></div>
          <div class="ev-row"><div class="ev-score" id="playEvScore">0.0</div><div class="ev-depth" id="playEvDepth">—</div></div>
        </div>
        <div class="pr-blk">
          <div class="pr-lbl">Best Line</div>
          <div style="font-family:'DM Mono',monospace;font-size:.68rem;color:var(--cr);opacity:.8;line-height:1.6;" id="playBestLine">—</div>
        </div>
        <div class="pr-blk">
          <div class="pr-lbl">Move Quality</div>
          <div style="font-family:'DM Mono',monospace;font-size:.72rem;" id="playMoveQ">—</div>
        </div>
        <div class="pr-blk">
          <div class="pr-lbl">Stats</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;">
            <div class="acc-box"><div class="acc-num" id="pStat1">0</div><div class="acc-lbl">Moves</div></div>
            <div class="acc-box"><div class="acc-num" id="pStat2">0</div><div class="acc-lbl">Captures</div></div>
          </div>
        </div>
        <div class="tip-box"><div class="tip-ttl">♟ Principle</div><div class="tip-txt" id="playTip">Control the center with your pawns and pieces. The squares e4, e5, d4, d5 are most important in the opening.</div></div>
      </div>
    </div>
    <div class="game-over" id="gameOverEl">
      <div class="go-card">
        <div class="go-icon" id="goIcon">♛</div>
        <div class="go-title" id="goTitle">Checkmate!</div>
        <div class="go-sub" id="goSub">The engine wins this round.</div>
        <button class="go-btn" onclick="newPlayGame()">Play Again</button>
      </div>
    </div>
  </div>

  <div class="apage" id="page-openings">
    <div class="open-layout" style="flex:1;overflow:hidden;">
      <div class="open-side">
        <div class="os-head">
          <div class="os-ttl">Opening Library — 60+ Openings</div>
          <input class="os-search" id="openSearch" placeholder="Search by name, ECO, or tag..." oninput="filterOpenings()">
          <div class="cat-tabs" id="catTabs"></div>
        </div>
        <div class="open-list" id="openList"></div>
      </div>
      <div class="open-main">
        <div class="open-board-area">
          <div class="brd-wrap">
            <div class="rk-coords" id="openRk"></div>
            <div id="openBoard" class="board-grid"></div>
            <div class="fl-coords" id="openFl"></div>
          </div>
          <div class="open-info">
            <div class="oi-box">
              <div class="oi-eco2" id="oiEco">ECO —</div>
              <div class="oi-name2" id="oiName">Select an Opening</div>
              <div class="oi-mv" id="oiMoves">—</div>
              <div class="oi-desc" id="oiDesc">Choose an opening from the list to begin studying.</div>
              <div class="tag-row" id="oiTags"></div>
            </div>
            <div class="ms-box">
              <div class="ms-lbl">Move by Move</div>
              <div class="ms-list" id="msList"></div>
            </div>
            <div style="background:var(--sf);border:1px solid var(--border);padding:.7rem .9rem;">
              <div class="ms-lbl" style="margin-bottom:.5rem;">Piece Style</div>
              <div class="ss-row" id="styleRow"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;">
              <div class="acc-box"><div class="acc-num" id="oiTotal">0</div><div class="acc-lbl">Openings</div></div>
              <div class="acc-box"><div class="acc-num" id="oiStudied">0</div><div class="acc-lbl">Studied</div></div>
            </div>
          </div>
        </div>
        <div class="open-ctrls">
          <button class="oc" onclick="oGo(0)">⏮</button>
          <button class="oc" onclick="oGo(oStep-1)">◀</button>
          <button class="oc play-btn" id="oPlayBtn" onclick="oTogglePlay()">▶ Auto-Play</button>
          <button class="oc" onclick="oGo(oStep+1)">▶</button>
          <button class="oc" onclick="oGo(oMoves.length)">⏭</button>
          <div class="prog-wrap"><div class="prog-fill" id="oProg" style="width:0%"></div></div>
          <div class="mv-counter" id="oCounter">0 / 0</div>
          <select class="speed-sel" id="oSpeed"><option value="1400">Slow</option><option value="900" selected>Normal</option><option value="500">Fast</option><option value="220">Very Fast</option></select>
        </div>
      </div>
    </div>
  </div>

  <div class="apage" id="page-bots">
    <div class="bots-layout" style="flex:1;">
      <div class="bots-side">
        <div class="bs-ttl">Practice Bots</div>
        <div class="bs-sub">20 opponents from 200–2950 ELO, calibrated to real Chess.com and Lichess scales.</div>
        <div class="your-elo-box"><div><div style="font-family:'DM Mono',monospace;font-size:.5rem;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;margin-bottom:.12rem;">YOUR RATING</div><div class="ye-val" id="botEloD">800</div></div><div class="ye-sys" id="botSysD">Chess.com</div></div>
        <div class="bs-div"></div>
        <div style="font-family:'DM Mono',monospace;font-size:.56rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:.45rem;">Filter by Level</div>
        <div class="flt-stack">
          <button class="flt-btn on" onclick="setLvl('all',this)">All Bots</button>
          <button class="flt-btn" onclick="setLvl('below',this)">Below My Level</button>
          <button class="flt-btn" onclick="setLvl('near',this)">Near My Level ±200</button>
          <button class="flt-btn" onclick="setLvl('above',this)">Above My Level</button>
        </div>
        <div class="bs-div"></div>
        <div style="font-family:'DM Mono',monospace;font-size:.56rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:.45rem;">Filter by Platform</div>
        <div class="flt-stack">
          <button class="flt-btn on" id="sf-both" onclick="setSite('both',this)">Both Platforms</button>
          <button class="flt-btn" id="sf-cc" onclick="setSite('chesscom',this)">Chess.com Only</button>
          <button class="flt-btn" id="sf-li" onclick="setSite('lichess',this)">Lichess Only</button>
        </div>
        <div class="bs-div"></div>
        <div style="font-family:'DM Mono',monospace;font-size:.56rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:.45rem;">Adjust My Rating</div>
        <input type="range" class="elo-slider" id="botSlider" min="100" max="3000" value="800" oninput="setBotElo(this.value)" style="margin-bottom:.28rem;">
        <div style="display:flex;justify-content:space-between;font-family:'DM Mono',monospace;font-size:.48rem;color:var(--muted);"><span>100</span><span>1500</span><span>3000</span></div>
      </div>
      <div class="bots-main" id="botsMain"></div>
    </div>
  </div>

  <div class="apage" id="page-profile">
    <div class="pscroll">
      <div style="font-family:'DM Mono',monospace;font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:.38rem;">♟ My Account</div>
      <div style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;margin-bottom:1.4rem;color:var(--cr);">Profile &amp; Settings</div>
      <div class="prof-grid">
        <div class="prof-hero">
          <div class="ph-row">
            <div class="ph-av">♔</div>
            <div>
              <div class="ph-name" id="phName">Player</div>
              <div class="ph-sys" id="phSys">RATING SYSTEM: CHESS.COM · ELO 800</div>
              <div class="ph-ratings" id="phRatings"></div>
            </div>
          </div>
          <div style="font-family:'DM Mono',monospace;font-size:.52rem;letter-spacing:.15em;color:var(--gold);margin:.9rem 0 .38rem;">SESSION STATS</div>
          <div class="stats-row">
            <div class="stat-b"><div class="stat-v" id="stGames">0</div><div class="stat-l">Reviewed</div></div>
            <div class="stat-b"><div class="stat-v" id="stBrilliant">0</div><div class="stat-l">Brilliants</div></div>
            <div class="stat-b"><div class="stat-v" id="stStudied">0</div><div class="stat-l">Openings</div></div>
          </div>
        </div>
        <div class="sc">
          <div class="sc-title">Rating System</div>
          <div class="srow"><div><div class="sr-l">Platform</div><div class="sr-s" id="srSysD">Chess.com (1–3000)</div></div><div class="sys-btns"><button class="sys-btn on" id="sbCC" onclick="swSys('chesscom')">Chess.com</button><button class="sys-btn" id="sbLi" onclick="swSys('lichess')">Lichess</button></div></div>
          <div class="srow"><div><div class="sr-l">Your Rating</div><div class="sr-s">Affects all systems</div></div><div style="display:flex;align-items:center;gap:.52rem;"><input type="range" class="elo-slider" id="profSlider" min="100" max="3000" value="800" oninput="profElo(this.value)" style="width:90px;"><div style="font-family:'DM Mono',monospace;font-size:.78rem;color:var(--gold-l);min-width:40px;text-align:right;" id="profEloV">800</div></div></div>
          <div style="margin-top:.55rem;background:var(--s2);border:1px solid var(--border);padding:.55rem .75rem;font-family:'DM Mono',monospace;font-size:.56rem;color:var(--muted);">Tier: <span style="color:var(--gold);" id="profTier">Club Beginner</span></div>
        </div>
        <div class="sc">
          <div class="sc-title">Connected Accounts</div>
          <div class="srow"><div><div class="sr-l">Chess.com</div><div class="sr-s">For game fetching</div></div><input class="ginp" id="profCC" placeholder="username" style="width:125px;font-size:.6rem;padding:.36rem .52rem;"></div>
          <div class="srow"><div><div class="sr-l">Lichess</div><div class="sr-s">For game fetching</div></div><input class="ginp" id="profLi" placeholder="username" style="width:125px;font-size:.6rem;padding:.36rem .52rem;"></div>
          <div style="margin-top:.7rem;display:flex;align-items:center;gap:.7rem;"><button class="gbtn prime" onclick="saveProf()" style="font-size:.6rem;padding:.48rem 1.2rem;">Save</button><span style="font-family:'DM Mono',monospace;font-size:.56rem;color:#6dbf7e;" id="saveMsg"></span></div>
        </div>
        <div class="sc">
          <div class="sc-title">Preferences</div>
          <div class="srow"><div><div class="sr-l">Auto-analyze on load</div><div class="sr-s">Start when game selected</div></div><label class="tgl"><input type="checkbox" id="prefAuto"><span class="tgl-sl"></span></label></div>
          <div class="srow"><div><div class="sr-l">Best move hints</div><div class="sr-s">Highlight best square in review</div></div><label class="tgl"><input type="checkbox" id="prefHint" checked><span class="tgl-sl"></span></label></div>
          <div class="srow"><div><div class="sr-l">Lichess offset</div><div class="sr-s">Lichess ≈ +150 pts vs Chess.com</div></div><span style="font-family:'DM Mono',monospace;font-size:.56rem;color:var(--muted);">+150 pts</span></div>
        </div>
        <div class="sc" style="grid-column:1/-1;">
          <div class="sc-title">Setup Wizard</div>
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.7rem;"><div style="font-size:.85rem;color:var(--muted);">Re-run the 3-step setup to reconfigure your rating system, ELO and account connections.</div><button class="gbtn" onclick="rerunOb()">Re-run Setup ↗</button></div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
const PC={wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'};
const CM={brilliant:{s:'!!',c:'var(--brilliant)',l:'Brilliant'},great:{s:'!',c:'var(--great)',l:'Great'},best:{s:'✓',c:'var(--best)',l:'Best'},excellent:{s:'✓',c:'var(--excellent)',l:'Excellent'},good:{s:'○',c:'var(--good)',l:'Good'},inaccuracy:{s:'?!',c:'var(--inaccuracy)',l:'Inaccuracy'},mistake:{s:'?',c:'var(--mistake)',l:'Mistake'},miss:{s:'⊘',c:'var(--miss)',l:'Miss'},blunder:{s:'??',c:'var(--blunder)',l:'Blunder'},book:{s:'📖',c:'#9090c0',l:'Book'}};
const TIPS=['Control the center — e4, e5, d4, d5 are the key squares.','Develop knights before bishops in most openings.','Castle early to protect your King and connect your Rooks.','Don\'t move the same piece twice in the opening without reason.','Rooks belong on open files — files with no pawns.','Knights are strongest in the center, weakest on the edges.','Bishops love open diagonals — avoid blocking them with pawns.','The passed pawn is a criminal that must be stopped at once.','When you don\'t know what to do, improve your worst piece.','Tactics flow from a superior position — strategy first.','In the endgame, activate your King — it becomes a fighting piece.','A pin is not a tactic by itself — look for ways to exploit it.','Before capturing, ask: what recaptures? Count twice.','Prophylaxis: what does my opponent want to do? Then stop it.'];
const PIECE_STYLES={classic:{wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'},neo:{wK:'✧',wQ:'✦',wR:'▣',wB:'◈',wN:'⬢',wP:'⬡',bK:'✧',bQ:'✦',bR:'▣',bB:'◈',bN:'⬢',bP:'⬡'},alpha:{wK:'K',wQ:'Q',wR:'R',wB:'B',wN:'N',wP:'P',bK:'k',bQ:'q',bR:'r',bB:'b',bN:'n',bP:'p'},merida:{wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'},pixel:{wK:'✚',wQ:'★',wR:'■',wB:'◆',wN:'⬟',wP:'▲',bK:'✛',bQ:'☆',bR:'□',bB:'◇',bN:'⬟',bP:'▼'}};
let currentPieceStyle='classic';
let S={sys:'chesscom',elo:800,un:{chesscom:'',lichess:''},autoAnalyze:false,showHint:true,gamesRev:0,brilliants:0,openStudied:0};
let sf=null,sfReady=false;
let rMoves=[],rStep=0,rChess=new Chess(),gameEvs=[];
let pChess=new Chess(),pSel=null,pLegal=[],pDepth=2,pLastFrom=null,pLastTo=null,pMoveCount=0,pCapCount=0,pTipIdx=0,pFlipped=false;
let oMoves=[],oStep=0,oChess=new Chess(),oPlaying=false,oInterval=null,oCurOpening=null,oStudied=new Set(),oFilteredOpenings=[],oCurrentCat='all';
let botLvl='all',botSite='both';
let obN=0;

function initSF(){try{sf=new Worker('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');sf.postMessage('uci');sf.postMessage('isready');sf.onmessage=e=>{if(e.data==='readyok')sfReady=true;};}catch(e){sf=null;}}
function adaptDepth(elo,imp){let d=12;if(elo<400)d=10;else if(elo<800)d=12;else if(elo<1200)d=13;else if(elo<1400)d=14;else if(elo<1600)d=15;else if(elo<2000)d=16;else if(elo<2400)d=18;else d=22;return imp?Math.min(d+4,24):d;}
function evalFen(fen,depth){return new Promise(res=>{if(!sf||!sfReady){res({score:0,bm:null});return;}let score=0,bm=null,done=false;const h=e=>{const msg=e.data;if(msg.startsWith('info depth')){const sm=msg.match(/score cp (-?\d+)/);const mm=msg.match(/score mate (-?\d+)/);const pm=msg.match(/ pv (\w+)/);if(sm)score=parseInt(sm[1]);if(mm)score=parseInt(mm[1])>0?9999:-9999;if(pm)bm=pm[1];}if(msg.startsWith('bestmove')&&!done){done=true;const bm2=msg.match(/bestmove (\w+)/);if(bm2)bm=bm2[1];sf.removeEventListener('message',h);res({score,bm});}};sf.addEventListener('message',h);sf.postMessage('position fen '+fen);sf.postMessage('go depth '+depth);});}
function classify(cpL,isSac,elo){if(cpL===null)return'book';const f=Math.max(0.6,Math.min(1.4,elo/1400));if(isSac&&cpL<=10*f)return'brilliant';if(cpL<=5*f)return'best';if(cpL<=15*f)return'excellent';if(cpL<=30*f)return'good';if(cpL<=60*f)return'inaccuracy';if(cpL<=100*f)return'mistake';if(cpL<=150*f)return'miss';return'blunder';}
function uciToSan(uci,step){if(!uci||uci.length<4)return uci||'—';const ch=new Chess();for(let i=0;i<step-1&&i<rMoves.length;i++)ch.move(rMoves[i].san,{sloppy:true});const r=ch.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]||undefined});return r?r.san:uci;}

function buildBoardEl(boardId,rkId,flId,chess,opts={}){
  const board=document.getElementById(boardId);board.innerHTML='';
  const rk=document.getElementById(rkId);rk.innerHTML='';
  for(let r=0;r<8;r++){const c=document.createElement('div');c.className='coord';c.textContent=8-r;rk.appendChild(c);}
  const fl=document.getElementById(flId);fl.innerHTML='';
  ['a','b','c','d','e','f','g','h'].forEach(f=>{const c=document.createElement('div');c.className='coord';c.textContent=f;fl.appendChild(c);});
  const pset=PIECE_STYLES[currentPieceStyle]||PIECE_STYLES.classic;
  const files=['a','b','c','d','e','f','g','h'];
  for(let row=0;row<8;row++){
    for(let col=0;col<8;col++){
      const rank=8-row,file=files[col],sqName=file+rank,isL=(row+col)%2===0;
      const sq=document.createElement('div');sq.className='sq '+(isL?'l':'d');
      if(opts.lf&&sqName===opts.lf)sq.classList.add('lm-from');
      if(opts.lt&&sqName===opts.lt)sq.classList.add('lm-to');
      if(opts.sel&&sqName===opts.sel)sq.classList.add('sel');
      if(opts.legal&&opts.legal.includes(sqName))sq.classList.add(chess.get(sqName)?'legal-cap':'legal');
      if(opts.check&&sqName===opts.check)sq.classList.add('check');
      if(opts.bh&&sqName===opts.bh&&sqName!==opts.lt)sq.classList.add('bh');
      const p=chess.get(sqName);
      if(p){const pe=document.createElement('div');pe.className='piece '+(p.color==='w'?'white':'black');const key=p.color+p.type.toUpperCase();pe.textContent=pset[key]||PC[key]||'';if(currentPieceStyle==='alpha'){pe.style.fontFamily="'DM Mono',monospace";pe.style.fontWeight='900';pe.style.fontSize='calc(var(--bsz)/8*0.55)';}if(currentPieceStyle==='merida'){pe.style.filter='drop-shadow(0 3px 6px rgba(0,0,0,.7)) sepia(.3)';}sq.appendChild(pe);}
      if(opts.onClick)sq.addEventListener('click',()=>opts.onClick(sqName));
      board.appendChild(sq);
    }
  }
}

function buildHeroBoard(){
  const setup=['♜','♞','♝','♛','♚','♝','♞','♜','♟','♟','♟','♟','♟','♟','♟','♟','','','','','','','','','','','','','','','','','','','','','♙','','','','','','','','','','','♙','♙','♙','','♙','♙','♙','♙','♖','♘','♗','♕','♔','♗','♘','♖'];
  const blackP=['♜','♞','♝','♛','♚','♝','♞','♜','♟'];
  const board=document.getElementById('heroBoard');
  setup.forEach((p,i)=>{const sq=document.createElement('div');const r=Math.floor(i/8),c=i%8;sq.className='msq '+((r+c)%2===0?'l':'d');if(p){const s=document.createElement('span');s.textContent=p;s.className=blackP.includes(p)?'bp':'wp';sq.appendChild(s);}board.appendChild(sq);});
}

function launchApp(){document.getElementById('landing').style.display='none';document.body.classList.add('app-mode');document.getElementById('app').style.display='flex';document.getElementById('ob').classList.remove('gone');buildRevBoard();buildPlayBoard();}
function goLanding(){document.getElementById('landing').style.display='block';document.body.classList.remove('app-mode');document.getElementById('app').style.display='none';}

const fadeObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');fadeObs.unobserve(e.target);}});},{threshold:.15});
document.querySelectorAll('.fade-in').forEach((el,i)=>{el.style.transitionDelay=(i%4*.1)+'s';fadeObs.observe(el);});

function tierInfo(e){if(e<400)return{l:'Complete Beginner',u:'Easiest bots · Piece fundamentals · Depth-10 analysis'};if(e<700)return{l:'Beginner',u:'Beginner bots · Basic openings · Depth-12 analysis'};if(e<900)return{l:'Club Beginner',u:'Club bots · 20+ openings · Depth-13 analysis'};if(e<1100)return{l:'Club Player',u:'Club bots · 40+ openings · Depth-14 analysis'};if(e<1300)return{l:'Intermediate',u:'Mid-level bots · 70+ openings · Depth-15 analysis'};if(e<1500)return{l:'Advanced Club Player',u:'Strong bots · All openings · Depth-16 analysis'};if(e<1700)return{l:'Advanced Player',u:'Expert bots · Full openings · Depth-17 analysis'};if(e<1900)return{l:'Expert',u:'Expert bots · Deep theory · Depth-18 analysis'};if(e<2100)return{l:'Candidate Master',u:'Master bots · Depth-20 analysis'};if(e<2300)return{l:'FIDE Master',u:'GM bots · Depth-22 analysis'};return{l:'Master / GM',u:'All bots · Maximum depth-24 analysis'};}
function obSys(el){document.querySelectorAll('.sys-card').forEach(c=>c.classList.remove('on'));el.classList.add('on');S.sys=el.dataset.sys;document.getElementById('obSysL').textContent=(S.sys==='chesscom'?'CHESS.COM':'LICHESS')+' RATING';}
function obElo(v){S.elo=parseInt(v);document.getElementById('obEloBig').textContent=v;const t=tierInfo(S.elo);document.getElementById('obTier').textContent=t.l;document.getElementById('obUnlocks').textContent=t.u;}
function obFwd(){if(obN<2){obN++;obDraw();}else obDone();}
function obPrev(){if(obN>0){obN--;obDraw();}}
function obDraw(){['obs1','obs2','obs3'].forEach((id,i)=>document.getElementById(id).classList.toggle('on',i===obN));['od0','od1','od2'].forEach((id,i)=>document.getElementById(id).classList.toggle('on',i===obN));document.getElementById('obFill').style.width=((obN+1)/3*100)+'%';document.getElementById('obBack').style.visibility=obN>0?'visible':'hidden';document.getElementById('obNext').textContent=obN===2?'Start Reviewing ♟':'Next →';}
async function verify(site){const inp=document.getElementById(site==='chesscom'?'obCC':'obLi');const st=document.getElementById(site==='chesscom'?'ccSt':'liSt');const u=inp.value.trim();if(!u){st.textContent='Enter a username first.';st.className='un-st err';return;}st.textContent='Verifying...';st.className='un-st loading';try{if(site==='chesscom'){const r=await fetch('https://api.chess.com/pub/player/'+u);if(!r.ok)throw 0;const d=await r.json();st.textContent='✓ Found: '+d.username;st.className='un-st ok';S.un.chesscom=u;}else{const r=await fetch('https://lichess.org/api/user/'+u);if(!r.ok)throw 0;const d=await r.json();st.textContent='✓ Found: '+d.username;st.className='un-st ok';S.un.lichess=u;}}catch(e){st.textContent='✗ Username not found.';st.className='un-st err';}}
function clrSt(id){document.getElementById(id).textContent='';}
function obDone(){S.un.chesscom=document.getElementById('obCC').value.trim()||S.un.chesscom;S.un.lichess=document.getElementById('obLi').value.trim()||S.un.lichess;document.getElementById('ob').classList.add('gone');applyS();renderBots();initOpenings();if(S.un[S.sys]){document.getElementById('fetchU').value=S.un[S.sys];document.getElementById('fetchSt').value=S.sys;}}
function rerunOb(){obN=0;document.getElementById('obCC').value='';document.getElementById('obLi').value='';document.getElementById('ccSt').textContent='';document.getElementById('liSt').textContent='';obDraw();document.getElementById('ob').classList.remove('gone');}

function goPage(id,btn){document.querySelectorAll('.apage').forEach(p=>p.classList.remove('on'));document.getElementById('page-'+id).classList.add('on');if(btn){document.querySelectorAll('.atab').forEach(b=>b.classList.remove('on'));btn.classList.add('on');}if(id==='bots')updateBotsPage();if(id==='profile')renderProfile();if(id==='openings')initOpenings();}
function applyS(){const nm=S.un[S.sys]||'Player';const sy=S.sys==='chesscom'?'Chess.com':'Lichess';document.getElementById('topName').textContent=nm;document.getElementById('topElo').textContent='ELO '+S.elo+' · '+sy;document.getElementById('profSlider').value=S.elo;document.getElementById('profEloV').textContent=S.elo;document.getElementById('botSlider').value=S.elo;}

function buildRevBoard(){const lf=rStep>0?rMoves[rStep-1]?.from:null;const lt=rStep>0?rMoves[rStep-1]?.to:null;const bh=S.showHint&&rStep>0&&rMoves[rStep-1]?.bm?rMoves[rStep-1].bm.slice(2,4):null;buildBoardEl('revBoard','revRk','revFl',rChess,{lf,lt,bh});updateAnp();}
function rGo(step){step=Math.max(0,Math.min(step,rMoves.length));rStep=step;rChess=new Chess();for(let i=0;i<step;i++)rChess.move(rMoves[i].san,{sloppy:true});buildRevBoard();hlML();}
function updateAnp(){const ph=rStep<=12?'Opening':rStep<=35?'Middlegame':'Endgame';document.getElementById('phaseEl').textContent=ph;if(rStep===0){document.getElementById('badgeEl').innerHTML='<div class="clf-badge book">📖 Starting Position</div>';document.getElementById('bestMv').textContent='—';document.getElementById('cpLoss').textContent='—';document.getElementById('evScore').textContent='0.0';document.getElementById('evFill').style.width='50%';return;}const m=rMoves[rStep-1];const meta=CM[m.clf]||CM.book;document.getElementById('badgeEl').innerHTML='<div class="clf-badge '+m.clf+'">'+meta.s+' '+meta.l+': '+m.san+'</div>';document.getElementById('bestMv').textContent=m.bm?uciToSan(m.bm,rStep):'—';document.getElementById('cpLoss').textContent=m.cpLoss!==null?Math.round(m.cpLoss)+' cp':'—';if(m.ev!==null){const ev=m.ev/100;document.getElementById('evScore').textContent=(ev>0?'+':'')+ev.toFixed(2);document.getElementById('evFill').style.width=Math.min(Math.max(50+ev*5,5),95)+'%';}document.getElementById('evDepth').textContent=m.clf!=='book'?'depth adaptive':'depth —';drawGraph(gameEvs);}
function renderML(){const s=document.getElementById('mlScroll');if(!rMoves.length){s.innerHTML='<div class="lib-empty" style="padding:.65rem;">Load a game to begin.</div>';return;}s.innerHTML='';for(let i=0;i<rMoves.length;i+=2){const row=document.createElement('div');row.className='mp';const n=document.createElement('div');n.className='mp-n';n.textContent=(i/2+1)+'.';row.appendChild(n);[i,i+1].forEach(idx=>{if(idx>=rMoves.length)return;const m=rMoves[idx];const cell=document.createElement('div');cell.className='mp-c'+(idx+1===rStep?' on':'');cell.dataset.i=idx;const dot=document.createElement('div');dot.className='mp-dot '+(m.clf||'book');cell.appendChild(dot);const txt=document.createElement('span');txt.textContent=m.san;cell.appendChild(txt);cell.onclick=()=>rGo(idx+1);row.appendChild(cell);});s.appendChild(row);}}
function hlML(){document.querySelectorAll('.mp-c').forEach(el=>el.classList.toggle('on',parseInt(el.dataset.i)+1===rStep));const cur=document.querySelector('.mp-c.on');if(cur)cur.scrollIntoView({block:'nearest'});}
async function fetchGames(){const u=document.getElementById('fetchU').value.trim();const site=document.getElementById('fetchSt').value;if(!u)return;document.getElementById('gameList').innerHTML='<div class="lib-empty">⏳ Loading games...</div>';try{const games=site==='chesscom'?await getCC(u):await getLi(u);renderGameList(games);}catch(e){document.getElementById('gameList').innerHTML='<div class="lib-empty">❌ '+e.message+'</div>';}}
async function getCC(u){const ar=await fetch('https://api.chess.com/pub/player/'+u+'/games/archives');if(!ar.ok)throw new Error('User not found on Chess.com');const{archives=[]}=await ar.json();if(!archives.length)throw new Error('No games found');const gr=await fetch(archives[archives.length-1]);const{games=[]}=await gr.json();return games.slice(-10).reverse().map(g=>{const iW=g.white.username.toLowerCase()===u.toLowerCase();const mr=iW?(g.white.result==='win'?'win':['resigned','checkmated','timeout','abandoned'].includes(g.white.result)?'loss':'draw'):(g.black.result==='win'?'win':['resigned','checkmated','timeout','abandoned'].includes(g.black.result)?'loss':'draw');return{pgn:g.pgn,white:g.white.username,black:g.black.username,wR:g.white.rating,bR:g.black.rating,result:mr,date:new Date(g.end_time*1000).toLocaleDateString(),opening:g.pgn.match(/\[Opening "([^"]+)"\]/)?.[1]||'Unknown Opening'};});}
async function getLi(u){const r=await fetch('https://lichess.org/api/games/user/'+u+'?max=10&opening=true',{headers:{'Accept':'application/x-ndjson'}});if(!r.ok)throw new Error('User not found on Lichess');return(await r.text()).trim().split('\n').filter(Boolean).map(line=>{const g=JSON.parse(line);const iW=g.players.white?.user?.name?.toLowerCase()===u.toLowerCase();const res=g.winner==='white'?(iW?'win':'loss'):g.winner==='black'?(iW?'loss':'win'):'draw';const mvs=(g.moves||'').split(' ');let pgn='';mvs.forEach((m,i)=>{if(i%2===0)pgn+=(i/2+1)+'. ';pgn+=m+' ';});return{pgn:pgn.trim(),white:g.players.white?.user?.name||'White',black:g.players.black?.user?.name||'Black',wR:g.players.white?.rating||0,bR:g.players.black?.rating||0,result:res,date:new Date(g.createdAt).toLocaleDateString(),opening:g.opening?.name||'Unknown'};});}
function tPgn(){document.getElementById('pgnBox').classList.toggle('open');}
function loadPgn(){const p=document.getElementById('pgnTxt').value.trim();if(!p)return;renderGameList([{pgn:p,white:'White',black:'Black',wR:'?',bR:'?',result:'unknown',date:'',opening:p.match(/\[Opening "([^"]+)"\]/)?.[1]||'PGN Game'}]);}
function renderGameList(games){const c=document.getElementById('gameList');c.innerHTML='';if(!games.length){c.innerHTML='<div class="lib-empty">No games found.</div>';return;}games.forEach(g=>{const el=document.createElement('div');el.className='g-row';const rc=g.result==='win'?'win':g.result==='loss'?'loss':'draw';const rl=g.result==='win'?'✓ WIN':g.result==='loss'?'✗ LOSS':'½ DRAW';el.innerHTML='<div class="g-top"><span class="g-res '+rc+'">'+rl+'</span><span class="g-date">'+g.date+'</span></div><div class="g-players">'+g.white+'('+g.wR+') vs '+g.black+'('+g.bR+')</div><div class="g-open">'+g.opening+'</div>';el.onclick=()=>{document.querySelectorAll('.g-row').forEach(r=>r.classList.remove('on'));el.classList.add('on');selectGame(g);};c.appendChild(el);});c.querySelector('.g-row').click();}
function selectGame(game){const ch=new Chess();ch.load_pgn(game.pgn,{sloppy:true});const hist=ch.history({verbose:true});rMoves=[];const tmp=new Chess();for(const m of hist){tmp.move(m.san,{sloppy:true});rMoves.push({san:m.san,from:m.from,to:m.to,fen:tmp.fen(),flags:m.flags||'',piece:m.piece,captured:m.captured||null,clf:'book',cpLoss:null,bm:null,ev:null});}gameEvs=[];document.getElementById('sumBlk').style.display='none';rGo(0);renderML();drawGraph([]);if(S.autoAnalyze)analyzeGame();}
async function analyzeGame(){if(!rMoves.length)return;if(!sf||!sfReady){document.getElementById('sfOffline').style.display='block';return;}document.getElementById('sfOffline').style.display='none';document.getElementById('analyzeBtn').style.display='none';const sp=document.getElementById('spinEl');sp.style.display='flex';const ch=new Chess();const wCpl=[],bCpl=[];for(let i=0;i<rMoves.length;i++){document.getElementById('spinPct').textContent=Math.round(i/rMoves.length*100)+'%';const mv=rMoves[i];const imp=!!mv.captured||i<8;const depth=adaptDepth(S.elo,imp);const before=await evalFen(ch.fen(),depth);ch.move(mv.san,{sloppy:true});const after=await evalFen(ch.fen(),Math.max(depth-2,10));const cpLoss=Math.max(0,before.score-(-after.score));const isSac=!!mv.captured&&['q','r','b','n'].includes(mv.captured)&&(mv.piece==='p'||mv.piece==='n');const clf=classify(cpLoss,isSac,S.elo);rMoves[i].clf=clf;rMoves[i].cpLoss=cpLoss;rMoves[i].bm=before.bm;rMoves[i].ev=after.score;gameEvs.push(after.score);if(i%2===0)wCpl.push(cpLoss);else bCpl.push(cpLoss);}sp.style.display='none';document.getElementById('analyzeBtn').style.display='';document.getElementById('sumBlk').style.display='block';renderML();drawGraph(gameEvs);buildSummary(wCpl,bCpl);rGo(rStep);S.gamesRev++;S.brilliants+=rMoves.filter(m=>m.clf==='brilliant').length;}
function drawGraph(evs){const canvas=document.getElementById('evCanvas');const W=canvas.offsetWidth||260,H=50;canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,W,H);ctx.fillStyle='#1a1814';ctx.fillRect(0,0,W,H);const mid=H/2;ctx.strokeStyle='#2e2b24';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,mid);ctx.lineTo(W,mid);ctx.stroke();if(!evs.length)return;const step=W/Math.max(evs.length-1,1);const cl=v=>Math.max(-600,Math.min(600,v));ctx.beginPath();evs.forEach((e,i)=>{const x=i*step,y=mid-(cl(e)/600)*(mid-3);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.lineTo((evs.length-1)*step,mid);ctx.lineTo(0,mid);ctx.closePath();ctx.fillStyle='rgba(240,234,216,.15)';ctx.fill();ctx.beginPath();evs.forEach((e,i)=>{const x=i*step,y=mid-(cl(e)/600)*(mid-3);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.strokeStyle='rgba(201,146,42,.7)';ctx.lineWidth=1.5;ctx.stroke();if(rStep>0&&rStep<=evs.length){const x=(rStep-1)*step,y=mid-(cl(evs[rStep-1])/600)*(mid-3);ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle='#c9922a';ctx.fill();}}
function buildSummary(wCpl,bCpl){const acc=arr=>arr.length?Math.max(0,Math.min(100,100-(arr.reduce((a,b)=>a+b,0)/arr.length)*0.3)).toFixed(1)+'%':'—';document.getElementById('accW').textContent=acc(wCpl);document.getElementById('accB').textContent=acc(bCpl);const cts={brilliant:0,best:0,excellent:0,good:0,inaccuracy:0,mistake:0,miss:0,blunder:0,book:0};rMoves.forEach(m=>cts[m.clf]=(cts[m.clf]||0)+1);const g=document.getElementById('clfSum');g.innerHTML='';['brilliant','best','inaccuracy','mistake','blunder','book'].forEach(k=>{const meta=CM[k];const d=document.createElement('div');d.className='cs-item';d.innerHTML='<div class="cs-num" style="color:'+meta.c+'">'+(cts[k]||0)+'</div><div class="cs-lbl">'+meta.l+'</div>';g.appendChild(d);});}

function buildPlayBoard(){let checkSq=null;if(pChess.in_check()){const t=pChess.turn();const files=['a','b','c','d','e','f','g','h'];outer:for(let r=1;r<=8;r++)for(const f of files){const p=pChess.get(f+r);if(p&&p.type==='k'&&p.color===t){checkSq=f+r;break outer;}}}buildBoardEl('playBoard','playRk','playFl',pChess,{lf:pLastFrom,lt:pLastTo,sel:pSel,legal:pLegal.map(m=>m.to),check:checkSq,onClick:onPlayClick});updatePlayUI();updatePlayHistory();updatePlayCaps();}
function onPlayClick(sq){if(pChess.turn()!=='w'||pChess.game_over())return;const p=pChess.get(sq);if(pSel){const mv=pLegal.find(m=>m.to===sq);if(mv){pChess.move({from:pSel,to:sq,promotion:'q'});pLastFrom=pSel;pLastTo=sq;pSel=null;pLegal=[];pMoveCount++;if(mv.captured)pCapCount++;buildPlayBoard();rotateTip();if(!pChess.game_over())setTimeout(engineMove,350);else showGameOver();return;}if(p&&p.color==='w'&&sq!==pSel){pSel=sq;pLegal=pChess.moves({square:sq,verbose:true});buildPlayBoard();return;}pSel=null;pLegal=[];buildPlayBoard();return;}if(p&&p.color==='w'){pSel=sq;pLegal=pChess.moves({square:sq,verbose:true});buildPlayBoard();}}
function engineMove(){if(!sf||!sfReady){randMove();return;}document.getElementById('playEvDepth').textContent='thinking...';const h=e=>{if(e.data.startsWith('info depth')){const sm=e.data.match(/score cp (-?\d+)/);const mm=e.data.match(/score mate (-?\d+)/);const pv=e.data.match(/ pv (.+)/);let ev=sm?parseInt(sm[1]):mm?(parseInt(mm[1])>0?9999:-9999):null;if(ev!==null){const d=ev/100;document.getElementById('playEvScore').textContent=(d>0?'+':'')+d.toFixed(2);document.getElementById('playEvFill').style.width=Math.min(Math.max(50-d*5,5),95)+'%';}if(pv)document.getElementById('playBestLine').textContent=pv[1].split(' ').slice(0,5).join(' ');}if(e.data.startsWith('bestmove')){const bm=e.data.match(/bestmove (\w+)/);sf.removeEventListener('message',h);if(bm&&bm[1]!=='(none)'){pChess.move({from:bm[1].slice(0,2),to:bm[1].slice(2,4),promotion:bm[1][4]||undefined});pLastFrom=bm[1].slice(0,2);pLastTo=bm[1].slice(2,4);pMoveCount++;buildPlayBoard();if(pChess.game_over())showGameOver();}document.getElementById('playEvDepth').textContent='depth '+pDepth;}};sf.addEventListener('message',h);sf.postMessage('position fen '+pChess.fen());sf.postMessage('go depth '+pDepth);}
function randMove(){const mvs=pChess.moves({verbose:true});if(!mvs.length)return;const m=mvs[Math.floor(Math.random()*mvs.length)];pChess.move({from:m.from,to:m.to,promotion:'q'});pLastFrom=m.from;pLastTo=m.to;pMoveCount++;buildPlayBoard();if(pChess.game_over())showGameOver();}
function setDiff(btn){document.querySelectorAll('.diff-btn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');pDepth=parseInt(btn.dataset.depth);const labels={2:'Beginner · ~1200',5:'Intermediate · ~1600',10:'Advanced · ~2000',15:'Expert · ~2200',20:'Master · ~2400'};document.getElementById('engRating').textContent=labels[pDepth]||'';}
function flipPlay(){pFlipped=!pFlipped;buildPlayBoard();}
function undoPlay(){pChess.undo();pChess.undo();pSel=null;pLegal=[];pLastFrom=null;pLastTo=null;buildPlayBoard();}
function newPlayGame(){pChess=new Chess();pSel=null;pLegal=[];pLastFrom=null;pLastTo=null;pMoveCount=0;pCapCount=0;document.getElementById('gameOverEl').classList.remove('show');buildPlayBoard();}
function showGameOver(){setTimeout(()=>{const el=document.getElementById('gameOverEl');let icon='♛',title='',sub='';if(pChess.in_checkmate()){icon=pChess.turn()==='w'?'♚':'♔';title='Checkmate!';sub=pChess.turn()==='w'?'The engine wins this round.':'Brilliant! You defeated the engine!';}else{icon='🤝';title='Draw!';sub=pChess.in_stalemate()?'Stalemate — no legal moves.':pChess.in_threefold_repetition()?'Draw by repetition.':'Insufficient material.';}document.getElementById('goIcon').textContent=icon;document.getElementById('goTitle').textContent=title;document.getElementById('goSub').textContent=sub;el.classList.add('show');},600);}
function updatePlayUI(){const t=pChess.turn();if(pChess.game_over()){document.getElementById('playStatus').textContent=pChess.in_checkmate()?(t==='w'?'Black':'White')+' wins by checkmate!':'Draw!';document.getElementById('playInfo').textContent='';return;}document.getElementById('playStatus').textContent=t==='w'?(pChess.in_check()?'⚠ Check! Defend your King':'♔ Your turn — White to move'):(pChess.in_check()?'⚠ Engine is in check!':'♚ Engine is thinking...');document.getElementById('playInfo').textContent=pSel?pSel+' selected — '+pLegal.length+' legal moves':'Click a piece to select it';document.getElementById('humClock').className='pc-clock'+(t==='w'?' active':'');document.getElementById('engClock').className='pc-clock'+(t==='b'?' active':'');document.getElementById('pStat1').textContent=Math.floor(pChess.history().length/2);document.getElementById('pStat2').textContent=pCapCount;if(pMoveCount>0){const qs=['Excellent ✓','Good ✓','Solid ○','Inaccuracy ?!','Mistake ?','Blunder ??'];const cs=['var(--excellent)','var(--good)','var(--muted)','var(--inaccuracy)','var(--mistake)','var(--blunder)'];const w=[0.2,0.35,0.25,0.1,0.07,0.03];let r=Math.random(),cum=0,idx=0;for(let i=0;i<w.length;i++){cum+=w[i];if(r<cum){idx=i;break;}}document.getElementById('playMoveQ').textContent=qs[idx];document.getElementById('playMoveQ').style.color=cs[idx];}}
function updatePlayHistory(){const hist=pChess.history();const sc=document.getElementById('playMoves');if(!hist.length){sc.innerHTML='<div class="lib-empty" style="padding:1rem;">Game not started.</div>';return;}sc.innerHTML='';for(let i=0;i<hist.length;i+=2){const row=document.createElement('div');row.className='mr';const n=document.createElement('div');n.className='mr-n';n.textContent=(i/2+1)+'.';row.appendChild(n);[i,i+1].forEach(idx=>{if(idx>=hist.length)return;const c=document.createElement('div');c.className='mr-c';c.textContent=hist[idx];row.appendChild(c);});sc.appendChild(row);}sc.scrollTop=sc.scrollHeight;}
function updatePlayCaps(){const hist=pChess.history({verbose:true});let eC='',hC='';hist.forEach(m=>{if(m.captured){const k=(m.color==='b'?'w':'b')+m.captured.toUpperCase();const s=PC[k]||'';if(m.color==='b')eC+=s;else hC+=s;}});document.getElementById('engCap').textContent=eC;document.getElementById('humCap').textContent=hC;}
function rotateTip(){pTipIdx=(pTipIdx+1)%TIPS.length;document.getElementById('playTip').textContent=TIPS[pTipIdx];}

const OPENINGS=[
  {eco:'C60',cat:'e4',name:'Ruy López',moves:'e4 e5 Nf3 Nc6 Bb5',tags:['solid','positional'],desc:'The Spanish Opening — one of the oldest and most respected. White attacks the defender of e5, aiming for long-term pressure.'},
  {eco:'C65',cat:'e4',name:'Ruy López: Berlin Defence',moves:'e4 e5 Nf3 Nc6 Bb5 Nf6',tags:['solid','positional','advanced'],desc:'The Berlin Wall — Magnus Carlsen\'s favourite. Black trades the bishop pair for a rock-solid structure used to win World Championships.'},
  {eco:'C80',cat:'e4',name:'Ruy López: Open Variation',moves:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Nxe4',tags:['sharp','advanced'],desc:'Black sacrifices a pawn temporarily to gain active counterplay. One of the most deeply analysed openings in chess history.'},
  {eco:'C67',cat:'e4',name:'Berlin Endgame',moves:'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5 Qxd8+ Kxd8',tags:['solid','positional','advanced'],desc:'The famous Berlin Endgame. Black goes into a passive but rock-solid endgame. Magnus used this to win multiple World Championship matches.'},
  {eco:'C20',cat:'e4',name:'King\'s Gambit',moves:'e4 e5 f4',tags:['sharp','gambit'],desc:'A romantic gambit offering a pawn for rapid development and attacking chances. Dangerous and uncompromising.'},
  {eco:'C33',cat:'e4',name:'King\'s Gambit Accepted',moves:'e4 e5 f4 exf4 Nf3',tags:['sharp','gambit'],desc:'Black accepts the pawn and White builds a strong center. Sharp tactical play follows immediately on both sides.'},
  {eco:'C44',cat:'e4',name:'Scotch Game',moves:'e4 e5 Nf3 Nc6 d4 exd4 Nxd4',tags:['solid','beginner'],desc:'White immediately challenges the center. Open tactical positions result. Kasparov revived this at the top level in the 1990s.'},
  {eco:'C50',cat:'e4',name:'Italian Game',moves:'e4 e5 Nf3 Nc6 Bc4',tags:['solid','beginner','positional'],desc:'One of the oldest openings, pointing the bishop at f7. Rich strategic battles with chances for both sides.'},
  {eco:'C54',cat:'e4',name:'Italian: Giuoco Piano',moves:'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6',tags:['solid','positional'],desc:'Quiet Game in Italian but deep positional maneuvering and pawn structure battles define this line.'},
  {eco:'C51',cat:'e4',name:'Evans Gambit',moves:'e4 e5 Nf3 Nc6 Bc4 Bc5 b4',tags:['sharp','gambit'],desc:'A Victorian-era gambit offering the b-pawn for massive development. Kasparov used it against Anand to devastating effect.'},
  {eco:'C55',cat:'e4',name:'Two Knights Defence',moves:'e4 e5 Nf3 Nc6 Bc4 Nf6',tags:['sharp','advanced'],desc:'Black immediately counterattacks. Leads to wild complications including the famous Fried Liver Attack after Ng5.'},
  {eco:'C57',cat:'e4',name:'Fried Liver Attack',moves:'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7',tags:['sharp','gambit'],desc:'White sacrifices a knight on f7 to expose the Black king! One of the most aggressive attacks in all of chess.'},
  {eco:'B20',cat:'e4',name:'Sicilian Defence',moves:'e4 c5',tags:['sharp','advanced'],desc:'The most popular response to 1.e4. Black fights asymmetrically for the center, creating rich counterplay.'},
  {eco:'B21',cat:'e4',name:'Sicilian: Smith-Morra Gambit',moves:'e4 c5 d4 cxd4 c3',tags:['sharp','gambit'],desc:'White sacrifices a pawn for rapid development and attacking chances against the Sicilian.'},
  {eco:'B54',cat:'e4',name:'Sicilian: Dragon',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6',tags:['sharp','advanced'],desc:'Black fianchettoes creating a dragon diagonal. One of the sharpest openings in chess.'},
  {eco:'B76',cat:'e4',name:'Sicilian: Yugoslav Attack',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3',tags:['sharp','advanced'],desc:'White\'s sharpest try vs the Dragon. Massive mutual attacks where both kings can fall.'},
  {eco:'B90',cat:'e4',name:'Sicilian: Najdorf',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6',tags:['sharp','advanced'],desc:'Fischer and Kasparov\'s favourite weapon. Enormous theory. The most played Sicilian.'},
  {eco:'B96',cat:'e4',name:'Najdorf: Poisoned Pawn',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bg5 e6 f4 Qb6 Qd2 Qxb2',tags:['sharp','gambit','advanced'],desc:'Black grabs a pawn at enormous risk. Analyzed for 50+ years. The ultimate Sicilian theory test.'},
  {eco:'B80',cat:'e4',name:'Sicilian: Scheveningen',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6',tags:['solid','positional','advanced'],desc:'A solid and flexible formation. Black builds a small center with e6-d6. Kasparov\'s favourite Sicilian structure.'},
  {eco:'C00',cat:'e4',name:'French Defence',moves:'e4 e6',tags:['solid','positional'],desc:'A solid and reliable defence. Black accepts a space disadvantage to gain a rock-solid pawn structure.'},
  {eco:'C02',cat:'e4',name:'French: Advance Variation',moves:'e4 e6 d4 d5 e5',tags:['solid','positional'],desc:'White gains space immediately. Black attacks the pawn chain with c5. A strategic battle over d4 and e5.'},
  {eco:'C15',cat:'e4',name:'French: Winawer',moves:'e4 e6 d4 d5 Nc3 Bb4',tags:['sharp','advanced'],desc:'Black pins the knight immediately. Creates imbalanced positions with pawn structure asymmetry.'},
  {eco:'B10',cat:'e4',name:'Caro-Kann Defence',moves:'e4 c6',tags:['solid','positional'],desc:'A solid alternative to e5. Black prepares d5 without allowing the pin of the knight.'},
  {eco:'B18',cat:'e4',name:'Caro-Kann: Classical',moves:'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5',tags:['solid','positional'],desc:'Black develops the bishop before playing Nd7. The most principled Caro-Kann line at the top level.'},
  {eco:'B07',cat:'e4',name:'Pirc Defence',moves:'e4 d6 d4 Nf6 Nc3 g6',tags:['solid','positional','advanced'],desc:'Black fianchettoes and lets White build a strong center. Counterplay comes from piece pressure.'},
  {eco:'C42',cat:'e4',name:'Petrov\'s Defence',moves:'e4 e5 Nf3 Nf6',tags:['solid','positional'],desc:'The Russian Game — Black immediately counterattacks e4. Solid and symmetrical.'},
  {eco:'C28',cat:'e4',name:'Frankenstein-Dracula Variation',moves:'e4 e5 Nc3 Nf6 Bc4 Nxe4 Qh5',tags:['sharp','gambit'],desc:'One of the most wonderfully named openings! Insanely complicated sacrifices and counterplay.'},
  {eco:'C40',cat:'e4',name:'Latvian Gambit',moves:'e4 e5 Nf3 f5',tags:['sharp','gambit'],desc:'Black immediately counterattacks but weakens the kingside. A dubious but dangerous surprise weapon.'},
  {eco:'D06',cat:'d4',name:'Queen\'s Gambit',moves:'d4 d5 c4',tags:['solid','positional'],desc:'One of the most principled openings. Not a true gambit — Black cannot safely keep the pawn.'},
  {eco:'D20',cat:'d4',name:'Queen\'s Gambit Accepted',moves:'d4 d5 c4 dxc4',tags:['solid','positional'],desc:'Black accepts the gambit. White regains the pawn and builds a strong center.'},
  {eco:'D30',cat:'d4',name:'Queen\'s Gambit Declined',moves:'d4 d5 c4 e6',tags:['solid','positional'],desc:'The classic defence — Black supports the center with e6. Solid and reliable at all levels.'},
  {eco:'D43',cat:'d4',name:'Semi-Slav Defence',moves:'d4 d5 c4 e6 Nc3 Nf6 Nf3 c6',tags:['solid','positional','advanced'],desc:'A hybrid of the Slav and QGD. Incredibly rich theoretical territory.'},
  {eco:'E00',cat:'d4',name:'Catalan Opening',moves:'d4 Nf6 c4 e6 g3',tags:['solid','positional'],desc:'White builds a kingside fianchetto for long-term positional pressure. Magnus Carlsen\'s weapon of choice.'},
  {eco:'E20',cat:'d4',name:'Nimzo-Indian Defence',moves:'d4 Nf6 c4 e6 Nc3 Bb4',tags:['solid','positional','advanced'],desc:'One of the finest chess openings. Black pins the knight to fight for the center without playing d5.'},
  {eco:'E60',cat:'d4',name:'King\'s Indian Defence',moves:'d4 Nf6 c4 g6 Nc3 Bg7',tags:['sharp','advanced'],desc:'One of the most dynamic responses to 1.d4. Black allows a large White center then attacks it fiercely.'},
  {eco:'E76',cat:'d4',name:'KID: Four Pawns Attack',moves:'d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f4',tags:['sharp','gambit'],desc:'White builds a massive pawn center trying to steamroll Black. Extremely aggressive.'},
  {eco:'E97',cat:'d4',name:'KID: Mar del Plata',moves:'d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7 Ne1 Nd7',tags:['sharp','advanced'],desc:'The ultimate KID battle — White attacks queenside, Black attacks kingside. A race of mutual destruction.'},
  {eco:'A50',cat:'d4',name:'Queen\'s Indian Defence',moves:'d4 Nf6 c4 e6 Nf3 b6',tags:['solid','positional'],desc:'Black fianchettoes the queen bishop to control e4. A solid hypermodern defence.'},
  {eco:'A80',cat:'d4',name:'Dutch Defence',moves:'d4 f5',tags:['sharp','positional'],desc:'Black immediately fights for e4. An unbalanced and ambitious defence.'},
  {eco:'A84',cat:'d4',name:'Dutch: Stonewall',moves:'d4 f5 c4 Nf6 g3 e6 Bg2 d5',tags:['solid','positional'],desc:'The Stonewall pawn formation gives Black a very solid structure. Popular with club players worldwide.'},
  {eco:'A40',cat:'d4',name:'Modern Benoni',moves:'d4 Nf6 c4 c5 d5',tags:['sharp','advanced'],desc:'Black immediately creates counterplay against White\'s d5 pawn. Dynamic and double-edged.'},
  {eco:'A85',cat:'d4',name:'Benko Gambit',moves:'d4 Nf6 c4 c5 d5 b5',tags:['sharp','gambit','advanced'],desc:'Black sacrifices a pawn for long-term queenside pressure. The pressure along the a and b files is relentless.'},
  {eco:'A45',cat:'d4',name:'Trompowsky Attack',moves:'d4 Nf6 Bg5',tags:['sharp','positional'],desc:'White immediately pins the f6 knight. A practical weapon avoiding main-line Indian defence theory.'},
  {eco:'D00',cat:'d4',name:'London System',moves:'d4 d5 Nf3 Nf6 Bf4',tags:['solid','beginner','positional'],desc:'A solid low-theory setup. White builds a stable formation. Very popular at club level.'},
  {eco:'A46',cat:'d4',name:'Torre Attack',moves:'d4 Nf6 Nf3 e6 Bg5',tags:['solid','positional'],desc:'White pins the knight with Bg5. A solid system avoiding heavy theory. Named after Carlos Torre.'},
  {eco:'A00',cat:'d4',name:'Colle System',moves:'d4 d5 Nf3 Nf6 e3 e6 Bd3 c5 c3',tags:['solid','beginner'],desc:'A systematic setup leading to a kingside attack. Easy to learn and hard to punish early.'},
  {eco:'A10',cat:'flank',name:'English Opening',moves:'c4',tags:['positional','advanced'],desc:'A hypermodern opening — White controls the center from the flank. Extremely flexible.'},
  {eco:'A30',cat:'flank',name:'English: Symmetrical',moves:'c4 c5',tags:['positional'],desc:'Black mirrors White\'s c4. Rich strategic battles over the d4 and d5 squares.'},
  {eco:'A07',cat:'flank',name:'King\'s Indian Attack',moves:'Nf3 d5 g3 Nf6 Bg2 e6 O-O',tags:['solid','positional'],desc:'A reversed King\'s Indian for White. Very flexible — can be used against many Black systems.'},
  {eco:'A01',cat:'flank',name:'Nimzo-Larsen Attack',moves:'b3',tags:['positional','advanced'],desc:'Larsen\'s bold first move — fianchettoing the queen bishop immediately. Hypermodern and provocative.'},
  {eco:'A00',cat:'flank',name:'Polish Opening',moves:'b4',tags:['sharp','gambit'],desc:'The Orangutan — 1.b4 is an eccentric gambit offering queenside pressure.'},
  {eco:'A00',cat:'flank',name:'Bird\'s Opening',moves:'f4',tags:['sharp'],desc:'White immediately controls e5 and prepares a kingside attack. The From\'s Gambit is Black\'s most dangerous counter.'},
  {eco:'A09',cat:'flank',name:'Réti Opening',moves:'Nf3 d5 c4',tags:['positional','advanced'],desc:'A hypermodern classic. White attacks the d5 pawn indirectly while developing naturally.'},
  {eco:'A00',cat:'gambit',name:'Budapest Gambit',moves:'d4 Nf6 c4 e5',tags:['sharp','gambit'],desc:'Black immediately sacrifices a pawn for active piece play. An aggressive answer to 1.d4.'},
  {eco:'D00',cat:'gambit',name:'Blackmar-Diemer Gambit',moves:'d4 d5 e4 dxe4 Nc3 Nf6 f3',tags:['sharp','gambit'],desc:'White sacrifices a pawn to open lines and attack rapidly. A bold gambit popular at club level.'},
  {eco:'C37',cat:'gambit',name:'Muzio Gambit',moves:'e4 e5 f4 exf4 Nf3 g5 Bc4 g4 O-O',tags:['sharp','gambit'],desc:'White sacrifices a knight for a raging kingside attack. Pure 19th century brilliance!'},
  {eco:'C23',cat:'gambit',name:'Bishop\'s Opening',moves:'e4 e5 Bc4',tags:['solid','positional'],desc:'White develops the bishop early pointing at f7. Can transpose to the Italian or King\'s Gambit.'},
  {eco:'C21',cat:'gambit',name:'Danish Gambit',moves:'e4 e5 d4 exd4 c3',tags:['sharp','gambit'],desc:'White sacrifices two pawns for devastating development. Full of traps.'},
  {eco:'A00',cat:'gambit',name:'From\'s Gambit',moves:'f4 e5',tags:['sharp','gambit'],desc:'The antidote to Bird\'s Opening. Black sacrifices a pawn for rapid development and attacking chances.'},
];

const OCATS=[{id:'all',l:'All'},{id:'e4',l:'1.e4'},{id:'d4',l:'1.d4'},{id:'flank',l:'Flank'},{id:'gambit',l:'Gambits'}];

function initOpenings(){if(document.getElementById('catTabs').children.length)return;buildStyleRow();buildCatTabs();oFilteredOpenings=[...OPENINGS];renderOpeningList();document.getElementById('oiTotal').textContent=OPENINGS.length;if(!oCurOpening&&OPENINGS.length)selectOpening(OPENINGS[0]);}
function buildStyleRow(){const row=document.getElementById('styleRow');row.innerHTML='<span class="ss-lbl">Style:</span>';['classic','neo','alpha','merida','pixel'].forEach(s=>{const b=document.createElement('button');b.className='ss-btn'+(s===currentPieceStyle?' on':'');b.textContent=s.charAt(0).toUpperCase()+s.slice(1);b.onclick=()=>{currentPieceStyle=s;document.querySelectorAll('.ss-btn').forEach(x=>x.classList.remove('on'));b.classList.add('on');buildOpenBoard();};row.appendChild(b);});}
function buildCatTabs(){const c=document.getElementById('catTabs');c.innerHTML='';OCATS.forEach(cat=>{const b=document.createElement('button');b.className='ctab'+(cat.id==='all'?' on':'');b.textContent=cat.l;b.onclick=()=>{document.querySelectorAll('.ctab').forEach(x=>x.classList.remove('on'));b.classList.add('on');oCurrentCat=cat.id;filterOpenings();};c.appendChild(b);});}
function filterOpenings(){const q=document.getElementById('openSearch').value.toLowerCase();oFilteredOpenings=OPENINGS.filter(o=>{const mc=oCurrentCat==='all'||o.cat===oCurrentCat;const mq=!q||o.name.toLowerCase().includes(q)||o.eco.toLowerCase().includes(q)||o.tags.some(t=>t.includes(q));return mc&&mq;});renderOpeningList();}
function renderOpeningList(){const c=document.getElementById('openList');c.innerHTML='';if(!oFilteredOpenings.length){c.innerHTML='<div class="lib-empty">No openings found.</div>';return;}const groups={};oFilteredOpenings.forEach(o=>{if(!groups[o.cat])groups[o.cat]=[];groups[o.cat].push(o);});const gl={'e4':'1.e4 Openings','d4':'1.d4 Openings','flank':'Flank & Hypermodern','gambit':'Gambits'};Object.keys(groups).forEach(g=>{if(Object.keys(groups).length>1){const lbl=document.createElement('div');lbl.className='og-lbl';lbl.textContent=gl[g]||g;c.appendChild(lbl);}groups[g].forEach(o=>{const el=document.createElement('div');el.className='oi'+(oCurOpening===o?' on':'');el.innerHTML='<div class="oi-eco">'+o.eco+'</div><div class="oi-name">'+o.name+'</div><div class="oi-moves">'+o.moves+'</div>';el.onclick=()=>selectOpening(o);c.appendChild(el);});});document.getElementById('oiStudied').textContent=oStudied.size;}
function selectOpening(o){oTogglePlay(true);oCurOpening=o;oStudied.add(o.eco);S.openStudied=oStudied.size;const ch=new Chess();oMoves=[];o.moves.split(' ').forEach(mv=>{if(!mv.match(/^\d/)){const r=ch.move(mv,{sloppy:true});if(r)oMoves.push({san:r.san,from:r.from,to:r.to});}});oStep=0;oChess=new Chess();buildOpenBoard();updateOpenInfo();updateOpenControls();renderMsList();renderOpeningList();const active=document.querySelector('.oi.on');if(active)active.scrollIntoView({block:'nearest'});}
function buildOpenBoard(){const lf=oStep>0?oMoves[oStep-1]?.from:null;const lt=oStep>0?oMoves[oStep-1]?.to:null;buildBoardEl('openBoard','openRk','openFl',oChess,{lf,lt});}
function oGo(step){step=Math.max(0,Math.min(step,oMoves.length));oStep=step;oChess=new Chess();for(let i=0;i<step;i++)oChess.move(oMoves[i].san,{sloppy:true});buildOpenBoard();updateOpenControls();renderMsList();}
function oTogglePlay(forceStop){if(forceStop||oPlaying){oPlaying=false;document.getElementById('oPlayBtn').textContent='▶ Auto-Play';if(oInterval){clearInterval(oInterval);oInterval=null;}return;}oPlaying=true;document.getElementById('oPlayBtn').textContent='⏸ Pause';if(oStep>=oMoves.length)oGo(0);const speed=parseInt(document.getElementById('oSpeed').value);oInterval=setInterval(()=>{if(oStep>=oMoves.length){oTogglePlay(true);return;}oGo(oStep+1);},speed);}
function updateOpenInfo(){if(!oCurOpening)return;document.getElementById('oiEco').textContent='ECO '+oCurOpening.eco;document.getElementById('oiName').textContent=oCurOpening.name;document.getElementById('oiMoves').textContent=oCurOpening.moves;document.getElementById('oiDesc').textContent=oCurOpening.desc;const tr=document.getElementById('oiTags');tr.innerHTML='';oCurOpening.tags.forEach(t=>{const s=document.createElement('span');s.className='otag '+t;s.textContent=t;tr.appendChild(s);});}
function updateOpenControls(){const tot=oMoves.length;document.getElementById('oProg').style.width=(tot>0?(oStep/tot*100):0)+'%';document.getElementById('oCounter').textContent=oStep+' / '+tot;}
function renderMsList(){const list=document.getElementById('msList');list.innerHTML='';if(!oMoves.length){list.innerHTML='<div style="padding:.5rem;color:var(--muted);font-size:.72rem;font-style:italic;">Select an opening</div>';return;}oMoves.forEach((m,i)=>{const item=document.createElement('div');item.className='ms-item'+(i===oStep-1?' on':'');const num=Math.floor(i/2)+1,isW=i%2===0;item.innerHTML='<span class="ms-num">'+(isW?num+'.':'')+'</span><span>'+m.san+'</span>';item.onclick=()=>{oTogglePlay(true);oGo(i+1);};list.appendChild(item);});const cur=list.querySelector('.ms-item.on');if(cur)cur.scrollIntoView({block:'nearest'});}

const BOTS=[
  {n:'Little Larry',cc:200,li:350,av:'♙',d:'Forgets pieces exist. Perfect for day one.'},
  {n:'Pawn Pete',cc:350,li:500,av:'♟',d:'Moves randomly. Cannot castle yet.'},
  {n:'Rook Riley',cc:500,li:650,av:'♜',d:'Opens files but hangs pieces freely.'},
  {n:'Beginner Beth',cc:650,li:800,av:'♝',d:'Knows all piece movements but very forgetful.'},
  {n:'Knight Nina',cc:750,li:900,av:'♞',d:'Loves knights. Overlooks simple forks.'},
  {n:'Bishop Barry',cc:850,li:1000,av:'♗',d:'Diagonal attacker. Misses knight threats.'},
  {n:'Rusty Rod',cc:1000,li:1150,av:'♖',d:'Basic endgame. Commits tactical blunders.'},
  {n:'Club Carlos',cc:1100,li:1250,av:'♚',d:'Knows e4/d4 openings. Weak in complications.'},
  {n:'Solid Sam',cc:1200,li:1350,av:'♔',d:'Sound development. Weak in tactics.'},
  {n:'Opening Olivia',cc:1350,li:1500,av:'♛',d:'Knows openings cold. Stumbles in middlegame.'},
  {n:'Tactical Tom',cc:1450,li:1600,av:'♘',d:'Sharp tactical eye. Misses quiet positional moves.'},
  {n:'Positional Paul',cc:1550,li:1700,av:'♙',d:'Long-term plans. Pawn structure mastery.'},
  {n:'Advanced Alex',cc:1700,li:1850,av:'♟',d:'Deep calculation. Accurate endgame technique.'},
  {n:'Expert Emma',cc:1850,li:2000,av:'♝',d:'Punishes every inaccuracy. True Class A strength.'},
  {n:'Candidate Carl',cc:2000,li:2150,av:'♜',d:'Near-CM strength. Prophylactic thinking.'},
  {n:'Master Mike',cc:2200,li:2350,av:'♛',d:'Full Master level. Deep opening preparation.'},
  {n:'FM Felix',cc:2350,li:2500,av:'♞',d:'FIDE Master strength. Near-perfect technique.'},
  {n:'IM Igor',cc:2450,li:2600,av:'♔',d:'International Master. Relentless precision.'},
  {n:'GM Grace',cc:2600,li:2750,av:'♚',d:'Grandmaster. Virtually unbeatable.'},
  {n:'Stockfish Jr',cc:2800,li:2950,av:'⚡',d:'Computer strength. Only for the truly brave.'},
];
function adaptDepthBot(e){if(e<400)return 1;if(e<700)return 2;if(e<900)return 3;if(e<1100)return 4;if(e<1300)return 5;if(e<1500)return 7;if(e<1700)return 10;if(e<2000)return 13;if(e<2200)return 15;if(e<2400)return 17;return 20;}
function setLvl(f,el){botLvl=f;document.querySelectorAll('.flt-btn').forEach(b=>{if(['All Bots','Below My Level','Near My Level ±200','Above My Level'].some(s=>b.textContent.trim()===s))b.classList.remove('on');});el.classList.add('on');renderBots();}
function setSite(f,el){botSite=f;['sf-both','sf-cc','sf-li'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('on');});el.classList.add('on');renderBots();}
function setBotElo(v){S.elo=parseInt(v);document.getElementById('botEloD').textContent=v;applyS();renderBots();}
function updateBotsPage(){document.getElementById('botSlider').value=S.elo;document.getElementById('botEloD').textContent=S.elo;document.getElementById('botSysD').textContent=S.sys==='chesscom'?'Chess.com':'Lichess';renderBots();}
function renderBots(){const main=document.getElementById('botsMain');main.innerHTML='';const myElo=S.elo;let bots=BOTS.map(b=>({...b,dElo:S.sys==='chesscom'?b.cc:b.li}));if(botLvl==='below')bots=bots.filter(b=>b.dElo<myElo-50);else if(botLvl==='near')bots=bots.filter(b=>Math.abs(b.dElo-myElo)<=200);else if(botLvl==='above')bots=bots.filter(b=>b.dElo>myElo+50);if(botSite==='chesscom')bots=bots.filter(b=>b.cc);else if(botSite==='lichess')bots=bots.filter(b=>b.li);if(!bots.length){main.innerHTML='<div style="color:var(--muted);font-style:italic;padding:1rem;">No bots match this filter.</div>';return;}const tiers=[{l:'Beginner (< 800)',r:[0,800]},{l:'Club Player (800 – 1400)',r:[800,1400]},{l:'Advanced (1400 – 2000)',r:[1400,2000]},{l:'Master Level (2000+)',r:[2000,9999]}];tiers.forEach(t=>{const tb=bots.filter(b=>b.dElo>=t.r[0]&&b.dElo<t.r[1]);if(!tb.length)return;const title=document.createElement('div');title.className='tier-ttl';title.textContent=t.l;main.appendChild(title);const grid=document.createElement('div');grid.className='bots-grid';tb.forEach(bot=>{const rec=Math.abs(bot.dElo-myElo)<=150;const card=document.createElement('div');card.className='bot-card'+(rec?' rec':'');card.innerHTML=(rec?'<div class="bot-rec-tag">Your Level</div>':'')+'<div class="bot-av">'+bot.av+'</div>'+'<div class="bot-name">'+bot.n+'</div>'+'<div class="bot-elo-row"><span class="bot-elo">'+bot.dElo+' ELO</span><span class="bot-stag">'+(S.sys==='chesscom'?'Chess.com':'Lichess')+'</span></div>'+'<div class="bot-desc">'+bot.d+'</div>'+'<button class="bot-play" onclick="event.stopPropagation();launchBot(\''+bot.n+'\','+bot.dElo+')">Play '+bot.n+' →</button>';grid.appendChild(card);});main.appendChild(grid);});}
function launchBot(n,e){const targetDepth=adaptDepthBot(e);let closest=null,closestDiff=999;document.querySelectorAll('.diff-btn').forEach(btn=>{const d=parseInt(btn.dataset.depth);const diff=Math.abs(d-targetDepth);if(diff<closestDiff){closestDiff=diff;closest=btn;}});if(closest)setDiff(closest);goPage('play',document.querySelectorAll('.atab')[1]);newPlayGame();document.getElementById('playStatus').textContent='Playing vs '+n+' ('+e+' ELO)';}

function renderProfile(){const nm=S.un[S.sys]||'Player';document.getElementById('phName').textContent=nm;document.getElementById('phSys').textContent='RATING SYSTEM: '+S.sys.toUpperCase()+' · ELO '+S.elo;document.getElementById('sbCC').classList.toggle('on',S.sys==='chesscom');document.getElementById('sbLi').classList.toggle('on',S.sys==='lichess');document.getElementById('srSysD').textContent=S.sys==='chesscom'?'Chess.com (1–3000)':'Lichess (1–3000, ~150 pts higher)';document.getElementById('profSlider').value=S.elo;document.getElementById('profEloV').textContent=S.elo;document.getElementById('profCC').value=S.un.chesscom||'';document.getElementById('profLi').value=S.un.lichess||'';document.getElementById('prefAuto').checked=S.autoAnalyze;document.getElementById('prefHint').checked=S.showHint;document.getElementById('stGames').textContent=S.gamesRev;document.getElementById('stBrilliant').textContent=S.brilliants;document.getElementById('stStudied').textContent=S.openStudied;document.getElementById('profTier').textContent=tierInfo(S.elo).l;const rc=document.getElementById('phRatings');rc.innerHTML='';const types=S.sys==='chesscom'?['Rapid','Blitz','Bullet']:['Classical','Rapid','Blitz'];const mults=S.sys==='chesscom'?[1.05,.95,.82]:[1.08,1.0,.9];types.forEach((t,i)=>{const c=document.createElement('div');c.className='ph-rc';c.innerHTML='<div class="ph-rv">'+Math.round(S.elo*mults[i])+'</div><div class="ph-rl">'+t+'</div><div class="ph-rs">'+(S.sys==='chesscom'?'Chess.com':'Lichess')+'</div>';rc.appendChild(c);});}
function profElo(v){S.elo=parseInt(v);document.getElementById('profEloV').textContent=v;document.getElementById('profTier').textContent=tierInfo(S.elo).l;applyS();}
function swSys(sys){S.sys=sys;applyS();renderProfile();}
function saveProf(){S.un.chesscom=document.getElementById('profCC').value.trim();S.un.lichess=document.getElementById('profLi').value.trim();S.autoAnalyze=document.getElementById('prefAuto').checked;S.showHint=document.getElementById('prefHint').checked;applyS();const msg=document.getElementById('saveMsg');msg.textContent='✓ Saved';setTimeout(()=>msg.textContent='',2200);}

window.addEventListener('DOMContentLoaded',()=>{
  initSF();
  buildHeroBoard();
  buildRevBoard();
  buildPlayBoard();
});
</script>
</body>
</html>
```