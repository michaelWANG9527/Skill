"use client";

import { useState, useEffect, useCallback } from "react";
import { USERS } from "@/data/mockData";
import { User } from "@/types";
import Toggle from "@/components/ui/Toggle";
import Footer from "@/components/ui/Footer";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

/* ── Product application SVG icons as line-art illustrations ── */
function ProductIcons() {
  const s = "#0071e3";
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none" }}
      viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
    >
      {/* ═══ HERO — WiFi signal with "6" badge, top-right ═══ */}
      <g opacity="0.13" transform="translate(1100, 50) scale(2.4)">
        <circle cx="50" cy="68" r="5" stroke={s} strokeWidth="2"/>
        <path d="M30 48c11-11 29-11 40 0" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M20 38c16.5-16.5 43.5-16.5 60 0" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M10 28c22-22 58-22 80 0" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* "6" badge */}
        <rect x="68" y="55" width="18" height="18" rx="4" stroke={s} strokeWidth="1.5"/>
        <text x="77" y="68" textAnchor="middle" fill={s} fontSize="12" fontWeight="700" fontFamily="system-ui">6</text>
      </g>

      {/* ═══ HERO — Chip / MCU with internal traces, bottom-left ═══ */}
      <g opacity="0.11" transform="translate(40, 580) scale(2.2)">
        <rect x="20" y="20" width="50" height="50" rx="6" stroke={s} strokeWidth="1.5" fill="none"/>
        <rect x="32" y="32" width="26" height="26" rx="4" stroke={s} strokeWidth="1.2" fill="none"/>
        <circle cx="45" cy="45" r="6" stroke={s} strokeWidth="0.8" fill="none"/>
        <circle cx="45" cy="45" r="2" stroke={s} strokeWidth="0.8"/>
        {/* pins — top */}
        {[28,37,45,53,62].map(x=><line key={`t${x}`} x1={x} y1="20" x2={x} y2="8" stroke={s} strokeWidth="1.5"/>)}
        {/* pins — bottom */}
        {[28,37,45,53,62].map(x=><line key={`b${x}`} x1={x} y1="70" x2={x} y2="82" stroke={s} strokeWidth="1.5"/>)}
        {/* pins — left */}
        {[28,37,45,53,62].map(y=><line key={`l${y}`} x1="20" y1={y} x2="8" y2={y} stroke={s} strokeWidth="1.5"/>)}
        {/* pins — right */}
        {[28,37,45,53,62].map(y=><line key={`r${y}`} x1="70" y1={y} x2="82" y2={y} stroke={s} strokeWidth="1.5"/>)}
        {/* internal traces */}
        <path d="M38 38 L42 42" stroke={s} strokeWidth="0.6"/>
        <path d="M52 38 L48 42" stroke={s} strokeWidth="0.6"/>
        <path d="M38 52 L42 48" stroke={s} strokeWidth="0.6"/>
        <path d="M52 52 L48 48" stroke={s} strokeWidth="0.6"/>
      </g>

      {/* ═══ WiFi 7 badge — medium, left edge ═══ */}
      <g opacity="0.09" transform="translate(50, 260) scale(1.6)">
        <path d="M30 40c5.5-5.5 14.5-5.5 20 0" stroke={s} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M23 33c9.5-9.5 25-9.5 34 0" stroke={s} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M16 26c13.5-13.5 35-35.5 48 0" stroke={s} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="40" cy="46" r="3" stroke={s} strokeWidth="1.5"/>
        <rect x="52" y="22" width="20" height="16" rx="4" stroke={s} strokeWidth="1.3"/>
        <text x="62" y="34" textAnchor="middle" fill={s} fontSize="11" fontWeight="700" fontFamily="system-ui">7</text>
      </g>

      {/* ═══ Bluetooth logo — medium, right edge ═══ */}
      <g opacity="0.09" transform="translate(1300, 260) scale(1.8)">
        <path d="M30 10 L30 60 L50 45 L20 20 L50 45 L50 15 L20 40 L50 15 L30 10z" stroke={s} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <text x="30" y="78" textAnchor="middle" fill={s} fontSize="8" fontWeight="600" fontFamily="system-ui" letterSpacing="1">BT</text>
      </g>

      {/* ═══ ISO 9001 — quality seal, bottom-right ═══ */}
      <g opacity="0.07" transform="translate(1200, 680) scale(1.4)">
        <circle cx="40" cy="40" r="30" stroke={s} strokeWidth="1.3" fill="none"/>
        <circle cx="40" cy="40" r="24" stroke={s} strokeWidth="0.8" fill="none"/>
        {/* globe lines */}
        <ellipse cx="40" cy="40" rx="12" ry="24" stroke={s} strokeWidth="0.6" fill="none"/>
        <line x1="16" y1="32" x2="64" y2="32" stroke={s} strokeWidth="0.6"/>
        <line x1="16" y1="48" x2="64" y2="48" stroke={s} strokeWidth="0.6"/>
        <text x="40" y="82" textAnchor="middle" fill={s} fontSize="8" fontWeight="600" fontFamily="system-ui">ISO 9001</text>
      </g>

      {/* ═══ Router — medium, top-left ═══ */}
      <g opacity="0.08" transform="translate(120, 110) scale(1.5)">
        <rect x="10" y="30" width="65" height="22" rx="5" stroke={s} strokeWidth="1.4" fill="none"/>
        <line x1="25" y1="30" x2="18" y2="8" stroke={s} strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="55" y1="30" x2="62" y2="8" stroke={s} strokeWidth="1.4" strokeLinecap="round"/>
        {/* wifi arcs from antennas */}
        <path d="M14 6a6 6 0 0 0 8 0" stroke={s} strokeWidth="0.8" fill="none"/>
        <path d="M58 6a6 6 0 0 0 8 0" stroke={s} strokeWidth="0.8" fill="none"/>
        <circle cx="20" cy="41" r="2.5" stroke={s} strokeWidth="1"/>
        <circle cx="30" cy="41" r="2.5" stroke={s} strokeWidth="1"/>
        <circle cx="40" cy="41" r="2.5" stroke={s} strokeWidth="1"/>
        <rect x="55" y="38" width="12" height="6" rx="1.5" stroke={s} strokeWidth="0.8" fill="none"/>
      </g>

      {/* ═══ Smart TV — medium, right ═══ */}
      <g opacity="0.07" transform="translate(1180, 420) scale(1.6)">
        <rect x="5" y="5" width="75" height="48" rx="4" stroke={s} strokeWidth="1.4" fill="none"/>
        <rect x="9" y="9" width="67" height="38" rx="2" stroke={s} strokeWidth="0.8" fill="none"/>
        {/* screen content — play button */}
        <polygon points="35,22 35,36 47,29" stroke={s} strokeWidth="0.8" fill="none"/>
        <line x1="32" y1="53" x2="32" y2="62" stroke={s} strokeWidth="1.4"/>
        <line x1="53" y1="53" x2="53" y2="62" stroke={s} strokeWidth="1.4"/>
        <line x1="22" y1="62" x2="63" y2="62" stroke={s} strokeWidth="1.4" strokeLinecap="round"/>
      </g>

      {/* ═══ Drone — detailed, upper area ═══ */}
      <g opacity="0.065" transform="translate(340, 60) scale(1.3)">
        <ellipse cx="40" cy="40" rx="10" ry="5" stroke={s} strokeWidth="1.2" fill="none"/>
        {/* camera underneath */}
        <circle cx="40" cy="48" r="3" stroke={s} strokeWidth="0.8" fill="none"/>
        {/* arms */}
        <line x1="30" y1="37" x2="14" y2="24" stroke={s} strokeWidth="1.2"/>
        <line x1="50" y1="37" x2="66" y2="24" stroke={s} strokeWidth="1.2"/>
        <line x1="30" y1="43" x2="14" y2="56" stroke={s} strokeWidth="1.2"/>
        <line x1="50" y1="43" x2="66" y2="56" stroke={s} strokeWidth="1.2"/>
        {/* motors */}
        <circle cx="14" cy="24" r="4" stroke={s} strokeWidth="1" fill="none"/>
        <circle cx="66" cy="24" r="4" stroke={s} strokeWidth="1" fill="none"/>
        <circle cx="14" cy="56" r="4" stroke={s} strokeWidth="1" fill="none"/>
        <circle cx="66" cy="56" r="4" stroke={s} strokeWidth="1" fill="none"/>
        {/* propellers */}
        <ellipse cx="14" cy="24" rx="12" ry="3" stroke={s} strokeWidth="0.6" fill="none"/>
        <ellipse cx="66" cy="24" rx="12" ry="3" stroke={s} strokeWidth="0.6" fill="none"/>
        <ellipse cx="14" cy="56" rx="12" ry="3" stroke={s} strokeWidth="0.6" fill="none"/>
        <ellipse cx="66" cy="56" rx="12" ry="3" stroke={s} strokeWidth="0.6" fill="none"/>
      </g>

      {/* ═══ Smart Watch — detailed ═══ */}
      <g opacity="0.065" transform="translate(1310, 680) scale(1.3)">
        <rect x="18" y="8" width="34" height="48" rx="10" stroke={s} strokeWidth="1.3" fill="none"/>
        {/* strap */}
        <path d="M22 8 Q22 0 28 0 L42 0 Q48 0 48 8" stroke={s} strokeWidth="1.8" fill="none"/>
        <path d="M22 56 Q22 64 28 64 L42 64 Q48 64 48 56" stroke={s} strokeWidth="1.8" fill="none"/>
        {/* screen */}
        <rect x="22" y="14" width="26" height="36" rx="6" stroke={s} strokeWidth="0.8" fill="none"/>
        {/* clock hands */}
        <circle cx="35" cy="32" r="10" stroke={s} strokeWidth="0.7" fill="none"/>
        <line x1="35" y1="25" x2="35" y2="32" stroke={s} strokeWidth="1"/>
        <line x1="35" y1="32" x2="41" y2="36" stroke={s} strokeWidth="1"/>
        <circle cx="35" cy="32" r="1.5" fill={s}/>
        {/* side button */}
        <rect x="52" y="28" width="4" height="8" rx="2" stroke={s} strokeWidth="0.8" fill="none"/>
      </g>

      {/* ═══ Camera / Sports Camera — detailed ═══ */}
      <g opacity="0.07" transform="translate(180, 700) scale(1.4)">
        <rect x="8" y="16" width="55" height="35" rx="6" stroke={s} strokeWidth="1.3" fill="none"/>
        <circle cx="35" cy="33" r="12" stroke={s} strokeWidth="1.3" fill="none"/>
        <circle cx="35" cy="33" r="7" stroke={s} strokeWidth="1" fill="none"/>
        <circle cx="35" cy="33" r="3" stroke={s} strokeWidth="0.7" fill="none"/>
        {/* flash */}
        <rect x="48" y="18" width="10" height="6" rx="1.5" stroke={s} strokeWidth="0.8" fill="none"/>
        {/* viewfinder */}
        <rect x="28" y="10" width="14" height="8" rx="2" stroke={s} strokeWidth="0.8" fill="none"/>
        {/* grip */}
        <rect x="8" y="16" width="8" height="14" rx="2" stroke={s} strokeWidth="0.6" fill="none"/>
      </g>

      {/* ═══ Smart Speaker — detailed ═══ */}
      <g opacity="0.065" transform="translate(940, 120) scale(1.3)">
        <path d="M24 58 Q24 8 40 8 Q56 8 56 58" stroke={s} strokeWidth="1.3" fill="none"/>
        <ellipse cx="40" cy="58" rx="16" ry="6" stroke={s} strokeWidth="1.3" fill="none"/>
        {/* speaker grille lines */}
        <line x1="30" y1="35" x2="50" y2="35" stroke={s} strokeWidth="0.5"/>
        <line x1="29" y1="39" x2="51" y2="39" stroke={s} strokeWidth="0.5"/>
        <line x1="28" y1="43" x2="52" y2="43" stroke={s} strokeWidth="0.5"/>
        <line x1="28" y1="47" x2="52" y2="47" stroke={s} strokeWidth="0.5"/>
        {/* light ring */}
        <path d="M32 14 a8 8 0 0 1 16 0" stroke={s} strokeWidth="1.2" fill="none"/>
        <circle cx="40" cy="14" r="2" fill={s} opacity="0.3"/>
      </g>

      {/* ═══ Notebook / Laptop — detailed ═══ */}
      <g opacity="0.06" transform="translate(480, 770) scale(1.1)">
        <path d="M15 45 L15 14 Q15 9 20 9 L72 9 Q77 9 77 14 L77 45" stroke={s} strokeWidth="1.3" fill="none"/>
        {/* screen content */}
        <rect x="20" y="14" width="52" height="28" rx="1" stroke={s} strokeWidth="0.5" fill="none"/>
        <line x1="20" y1="20" x2="50" y2="20" stroke={s} strokeWidth="0.4"/>
        <line x1="20" y1="24" x2="42" y2="24" stroke={s} strokeWidth="0.4"/>
        {/* keyboard base */}
        <path d="M5 45 L87 45 Q92 50 87 55 L5 55 Q0 50 5 45z" stroke={s} strokeWidth="1.3" fill="none"/>
        {/* trackpad */}
        <rect x="36" y="47" width="20" height="6" rx="2" stroke={s} strokeWidth="0.6" fill="none"/>
      </g>

      {/* ═══ VR Headset — detailed ═══ */}
      <g opacity="0.055" transform="translate(780, 740) scale(1.2)">
        <path d="M8 28 Q8 12 25 12 L58 12 Q75 12 75 28 L75 42 Q75 54 62 54 L52 52 Q46 52 42 46 Q38 52 32 52 L22 54 Q8 54 8 42z" stroke={s} strokeWidth="1.3" fill="none"/>
        <circle cx="28" cy="32" r="8" stroke={s} strokeWidth="1" fill="none"/>
        <circle cx="28" cy="32" r="4" stroke={s} strokeWidth="0.6" fill="none"/>
        <circle cx="55" cy="32" r="8" stroke={s} strokeWidth="1" fill="none"/>
        <circle cx="55" cy="32" r="4" stroke={s} strokeWidth="0.6" fill="none"/>
        {/* strap */}
        <path d="M8 30 Q0 30 0 24" stroke={s} strokeWidth="1" fill="none"/>
        <path d="M75 30 Q83 30 83 24" stroke={s} strokeWidth="1" fill="none"/>
      </g>

      {/* ═══ Printer — detailed ═══ */}
      <g opacity="0.055" transform="translate(1080, 580) scale(1.1)">
        <rect x="8" y="20" width="54" height="26" rx="3" stroke={s} strokeWidth="1.2" fill="none"/>
        <path d="M16 20 L16 6 L54 6 L54 20" stroke={s} strokeWidth="1.2" fill="none"/>
        <path d="M16 46 L16 58 L54 58 L54 46" stroke={s} strokeWidth="1.2" fill="none"/>
        {/* paper coming out */}
        <line x1="22" y1="52" x2="48" y2="52" stroke={s} strokeWidth="0.5"/>
        <line x1="22" y1="55" x2="40" y2="55" stroke={s} strokeWidth="0.5"/>
        {/* buttons */}
        <circle cx="50" cy="30" r="2" stroke={s} strokeWidth="0.8" fill="none"/>
        <rect x="44" y="34" width="10" height="3" rx="1" stroke={s} strokeWidth="0.6" fill="none"/>
      </g>

      {/* ═══ Game Controller — detailed ═══ */}
      <g opacity="0.055" transform="translate(50, 390) scale(1.1)">
        <path d="M8 28 Q8 8 28 13 L52 13 Q72 8 72 28 Q72 52 56 46 L52 40 L28 40 L24 46 Q8 52 8 28z" stroke={s} strokeWidth="1.2" fill="none"/>
        {/* d-pad */}
        <line x1="24" y1="22" x2="24" y2="34" stroke={s} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="18" y1="28" x2="30" y2="28" stroke={s} strokeWidth="1.2" strokeLinecap="round"/>
        {/* action buttons */}
        <circle cx="52" cy="22" r="2.5" stroke={s} strokeWidth="0.8" fill="none"/>
        <circle cx="58" cy="28" r="2.5" stroke={s} strokeWidth="0.8" fill="none"/>
        <circle cx="52" cy="34" r="2.5" stroke={s} strokeWidth="0.8" fill="none"/>
        <circle cx="46" cy="28" r="2.5" stroke={s} strokeWidth="0.8" fill="none"/>
        {/* thumbsticks */}
        <circle cx="34" cy="34" r="3.5" stroke={s} strokeWidth="0.6" fill="none"/>
        <circle cx="44" cy="22" r="3.5" stroke={s} strokeWidth="0.6" fill="none"/>
      </g>

      {/* ═══ Projector — small ═══ */}
      <g opacity="0.05" transform="translate(700, 800) scale(1)">
        <rect x="10" y="15" width="60" height="30" rx="5" stroke={s} strokeWidth="1.2" fill="none"/>
        <circle cx="35" cy="30" r="10" stroke={s} strokeWidth="1" fill="none"/>
        <circle cx="35" cy="30" r="5" stroke={s} strokeWidth="0.7" fill="none"/>
        {/* light beam */}
        <path d="M70 22 L95 10 L95 50 L70 38" stroke={s} strokeWidth="0.6" fill="none" strokeDasharray="3,2"/>
      </g>

      {/* ═══ Smart POS — small ═══ */}
      <g opacity="0.05" transform="translate(560, 100) scale(1)">
        <rect x="10" y="5" width="35" height="55" rx="4" stroke={s} strokeWidth="1.2" fill="none"/>
        <rect x="14" y="10" width="27" height="20" rx="2" stroke={s} strokeWidth="0.8" fill="none"/>
        {/* keypad */}
        {[36,42,48].map(y => [18,27,36].map(x => <circle key={`${x}${y}`} cx={x} cy={y} r="2" stroke={s} strokeWidth="0.5" fill="none"/>))}
        {/* card slot */}
        <rect x="18" y="54" width="20" height="3" rx="1" stroke={s} strokeWidth="0.6" fill="none"/>
      </g>

      {/* ═══ Tablet — small ═══ */}
      <g opacity="0.05" transform="translate(1100, 160) scale(1)">
        <rect x="5" y="5" width="50" height="65" rx="5" stroke={s} strokeWidth="1.2" fill="none"/>
        <rect x="9" y="12" width="42" height="50" rx="2" stroke={s} strokeWidth="0.6" fill="none"/>
        <circle cx="30" cy="68" r="2" stroke={s} strokeWidth="0.6" fill="none"/>
      </g>

      {/* ═══ IP Phone — tiny ═══ */}
      <g opacity="0.04" transform="translate(880, 800) scale(0.9)">
        <rect x="10" y="10" width="45" height="50" rx="4" stroke={s} strokeWidth="1.1" fill="none"/>
        <rect x="14" y="14" width="37" height="18" rx="2" stroke={s} strokeWidth="0.7" fill="none"/>
        {/* keypad grid */}
        {[37,43,49].map(y=>[20,30,40].map(x=><rect key={`p${x}${y}`} x={x} y={y} width="6" height="4" rx="1" stroke={s} strokeWidth="0.4" fill="none"/>))}
        {/* handset */}
        <path d="M58 15 Q68 15 68 25 L68 40 Q68 50 58 50" stroke={s} strokeWidth="1" fill="none"/>
      </g>

      {/* ═══ Scattered WiFi waves ═══ */}
      <g opacity="0.04" transform="translate(700, 130) scale(0.7)">
        <path d="M20 30c5.5-5.5 14.5-5.5 20 0" stroke={s} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M15 24c8.25-8.25 21.75-8.25 30 0" stroke={s} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </g>
      <g opacity="0.035" transform="translate(380, 480) scale(0.6)">
        <path d="M20 30c5.5-5.5 14.5-5.5 20 0" stroke={s} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M15 24c8.25-8.25 21.75-8.25 30 0" stroke={s} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M10 18c11-11 29-11 40 0" stroke={s} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </g>
      <g opacity="0.03" transform="translate(1050, 500) scale(0.5)">
        <path d="M20 30c5.5-5.5 14.5-5.5 20 0" stroke={s} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M15 24c8.25-8.25 21.75-8.25 30 0" stroke={s} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </g>

      {/* ═══ Circuit traces ═══ */}
      <g opacity="0.03" stroke={s} strokeWidth="0.8">
        <path d="M0 320 L140 320 L140 400 L220 400" fill="none"/>
        <path d="M1440 520 L1300 520 L1300 580 L1220 580" fill="none"/>
        <path d="M620 0 L620 70 L700 70" fill="none"/>
        <path d="M880 900 L880 830 L960 830" fill="none"/>
        <path d="M300 900 L300 860 L380 860 L380 830" fill="none"/>
        <path d="M1440 200 L1380 200 L1380 260" fill="none"/>
        <circle cx="140" cy="320" r="3" fill={s}/>
        <circle cx="220" cy="400" r="3" fill={s}/>
        <circle cx="1300" cy="520" r="3" fill={s}/>
        <circle cx="620" cy="70" r="3" fill={s}/>
        <circle cx="960" cy="830" r="3" fill={s}/>
        <circle cx="380" cy="830" r="3" fill={s}/>
      </g>
    </svg>
  );
}

/* ── SVG icon components for form fields (Apple style — no emoji) ── */
function IconUser({ focused }: { focused: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transition: "all 0.25s ease" }}>
      <circle cx="9" cy="6" r="3.5" stroke={focused ? "#0071e3" : "#86868b"} strokeWidth="1.5"/>
      <path d="M2.5 16.5C2.5 13 5 11 9 11s6.5 2 6.5 5.5" stroke={focused ? "#0071e3" : "#86868b"} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconLock({ focused }: { focused: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transition: "all 0.25s ease" }}>
      <rect x="3" y="8" width="12" height="8" rx="2" stroke={focused ? "#0071e3" : "#86868b"} strokeWidth="1.5"/>
      <path d="M5.5 8V5.5a3.5 3.5 0 0 1 7 0V8" stroke={focused ? "#0071e3" : "#86868b"} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="12.5" r="1.2" fill={focused ? "#0071e3" : "#86868b"}/>
    </svg>
  );
}
function IconPhone({ focused }: { focused: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transition: "all 0.25s ease" }}>
      <rect x="4.5" y="1" width="9" height="16" rx="2" stroke={focused ? "#0071e3" : "#86868b"} strokeWidth="1.5"/>
      <line x1="7" y1="14" x2="11" y2="14" stroke={focused ? "#0071e3" : "#86868b"} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function IconShield({ focused }: { focused: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transition: "all 0.25s ease" }}>
      <path d="M9 1.5L3 4v4.5c0 4 2.5 6.5 6 8 3.5-1.5 6-4 6-8V4L9 1.5z" stroke={focused ? "#0071e3" : "#86868b"} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M6.5 9.5l2 2 3.5-4" stroke={focused ? "#0071e3" : "#86868b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [rememberAccount, setRememberAccount] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [error, setError] = useState("");
  const [pressed, setPressed] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);
  const [codeHover, setCodeHover] = useState(false);
  const [loginHover, setLoginHover] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendCode = () => {
    if (countdown > 0) return;
    setCountdown(60);
  };

  const handleLogin = () => {
    setError("");
    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) {
      setError("账号或密码错误");
      return;
    }
    if (!phone.trim()) {
      setError("请输入手机号");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("请输入6位数字验证码");
      return;
    }
    onLogin(user);
  };

  const inputStyle = useCallback(
    (focused: boolean) => ({
      width: "100%",
      padding: "13px 16px 13px 44px",
      border: "none",
      borderRadius: 10,
      background: focused ? "#ffffff" : "rgba(255,255,255,0.65)",
      fontSize: 16,
      fontWeight: 400 as const,
      color: "#1d1d1f",
      letterSpacing: -0.374,
      lineHeight: "1.47",
      outline: "none",
      transition: "all 0.25s cubic-bezier(0.25,0.1,0.25,1)",
      boxShadow: focused
        ? "0 0 0 3px rgba(0,113,227,0.3), inset 0 0 0 1px rgba(0,113,227,0.4)"
        : "inset 0 0 0 1px rgba(0,0,0,0.08)",
      boxSizing: "border-box" as const,
    }),
    []
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "linear-gradient(160deg, #e8f4fd 0%, #dceefb 30%, #c7e2f9 60%, #daeaf8 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ProductIcons />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: 420,
          maxWidth: "92vw",
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "saturate(200%) blur(24px)",
          WebkitBackdropFilter: "saturate(200%) blur(24px)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.03)",
          padding: "44px 40px 36px",
          animation: "cardEntrance 0.6s cubic-bezier(0.25,0.1,0.25,1) both",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <img
            src="/logo.png"
            alt="SeekWave 希微科技"
            style={{ height: 48, margin: "0 auto 16px", display: "block" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1d1d1f",
              letterSpacing: -0.5,
              lineHeight: 1.14,
            }}
          >
            希微科技
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(0,0,0,0.38)",
              letterSpacing: 5,
              marginTop: 6,
              fontWeight: 500,
              textTransform: "uppercase",
            }}
          >
            SEEKWAVE TECHNOLOGY
          </div>
          <div
            style={{
              height: 1,
              margin: "22px auto 18px",
              width: 40,
              background: "rgba(0,0,0,0.08)",
              borderRadius: 1,
            }}
          />
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#1d1d1f",
              letterSpacing: 0.2,
              lineHeight: 1.2,
            }}
          >
            销售订单审批系统
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Username */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", zIndex: 1, display: "flex" }}>
              <IconUser focused={focusField === "username"} />
            </span>
            <input
              type="text"
              placeholder="请输入账号"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusField("username")}
              onBlur={() => setFocusField(null)}
              style={inputStyle(focusField === "username")}
            />
          </div>

          {/* Password */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", zIndex: 1, display: "flex" }}>
              <IconLock focused={focusField === "password"} />
            </span>
            <input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusField("password")}
              onBlur={() => setFocusField(null)}
              style={inputStyle(focusField === "password")}
            />
          </div>

          {/* Phone */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", zIndex: 1, display: "flex" }}>
              <IconPhone focused={focusField === "phone"} />
            </span>
            <input
              type="text"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocusField("phone")}
              onBlur={() => setFocusField(null)}
              style={inputStyle(focusField === "phone")}
            />
          </div>

          {/* Verification Code Row */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", zIndex: 1, display: "flex" }}>
                <IconShield focused={focusField === "code"} />
              </span>
              <input
                type="text"
                placeholder="6位验证码"
                value={code}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(v);
                }}
                maxLength={6}
                onFocus={() => setFocusField("code")}
                onBlur={() => setFocusField(null)}
                style={inputStyle(focusField === "code")}
              />
            </div>
            <button
              onClick={sendCode}
              onMouseEnter={() => setCodeHover(true)}
              onMouseLeave={() => setCodeHover(false)}
              disabled={countdown > 0}
              style={{
                padding: "0 20px",
                borderRadius: 10,
                border: "none",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: -0.1,
                whiteSpace: "nowrap",
                cursor: countdown > 0 ? "default" : "pointer",
                background: countdown > 0
                  ? "rgba(0,0,0,0.04)"
                  : codeHover ? "#005bbd" : "#0071e3",
                color: countdown > 0 ? "rgba(0,0,0,0.38)" : "#ffffff",
                transition: "all 0.25s cubic-bezier(0.25,0.1,0.25,1)",
              }}
            >
              {countdown > 0 ? `${countdown}s` : "获取验证码"}
            </button>
          </div>

          {/* Toggles */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <Toggle checked={rememberAccount} onChange={setRememberAccount} label="记住账号" />
            <Toggle checked={rememberPassword} onChange={setRememberPassword} label="记住密码" />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#ff3b30",
                letterSpacing: -0.1,
                padding: "8px 12px",
                background: "rgba(255,59,48,0.06)",
                borderRadius: 8,
                animation: "fadeSlideIn 0.2s ease",
              }}
            >
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => { setPressed(false); setLoginHover(false); }}
            onMouseEnter={() => setLoginHover(true)}
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "13px 15px",
              borderRadius: 10,
              border: "none",
              background: loginHover ? "#005bbd" : "#0071e3",
              color: "#ffffff",
              fontSize: 17,
              fontWeight: 500,
              letterSpacing: -0.2,
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.25,0.1,0.25,1)",
              transform: pressed ? "scale(0.975)" : "scale(1)",
              boxShadow: "0 2px 8px rgba(0,113,227,0.3)",
            }}
          >
            登录
          </button>

          {/* Security notice */}
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgba(0,0,0,0.36)",
              marginTop: 6,
              lineHeight: 1.5,
              letterSpacing: -0.08,
            }}
          >
            密码信息至关重要，请不要向其他人透露该信息。
            <br />
            建议密码每个月更换一次。
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <Footer />
      </div>
    </div>
  );
}
