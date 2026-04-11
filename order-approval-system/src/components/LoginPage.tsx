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
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* WiFi signal — hero element, top-right, large */}
      <g opacity="0.12" transform="translate(1120, 80) scale(2.2)">
        <path d="M50 70a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" stroke="#0071e3" strokeWidth="2"/>
        <path d="M30 50c11-11 29-11 40 0" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M20 40c16.5-16.5 43.5-16.5 60 0" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M10 30c22-22 58-22 80 0" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </g>

      {/* Chip / MCU — hero element, bottom-left, large */}
      <g opacity="0.10" transform="translate(60, 600) scale(2)">
        <rect x="20" y="20" width="50" height="50" rx="6" stroke="#0071e3" strokeWidth="1.5" fill="none"/>
        <rect x="35" y="35" width="20" height="20" rx="3" stroke="#0071e3" strokeWidth="1.5" fill="none"/>
        {/* pins */}
        <line x1="30" y1="20" x2="30" y2="10" stroke="#0071e3" strokeWidth="1.5"/>
        <line x1="45" y1="20" x2="45" y2="10" stroke="#0071e3" strokeWidth="1.5"/>
        <line x1="60" y1="20" x2="60" y2="10" stroke="#0071e3" strokeWidth="1.5"/>
        <line x1="30" y1="70" x2="30" y2="80" stroke="#0071e3" strokeWidth="1.5"/>
        <line x1="45" y1="70" x2="45" y2="80" stroke="#0071e3" strokeWidth="1.5"/>
        <line x1="60" y1="70" x2="60" y2="80" stroke="#0071e3" strokeWidth="1.5"/>
        <line x1="20" y1="35" x2="10" y2="35" stroke="#0071e3" strokeWidth="1.5"/>
        <line x1="20" y1="55" x2="10" y2="55" stroke="#0071e3" strokeWidth="1.5"/>
        <line x1="70" y1="35" x2="80" y2="35" stroke="#0071e3" strokeWidth="1.5"/>
        <line x1="70" y1="55" x2="80" y2="55" stroke="#0071e3" strokeWidth="1.5"/>
      </g>

      {/* Router — medium, top-left area */}
      <g opacity="0.08" transform="translate(100, 140) scale(1.4)">
        <rect x="10" y="30" width="60" height="20" rx="4" stroke="#0071e3" strokeWidth="1.5" fill="none"/>
        <line x1="25" y1="30" x2="20" y2="10" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="55" y1="30" x2="60" y2="10" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="20" cy="40" r="2" stroke="#0071e3" strokeWidth="1"/>
        <circle cx="30" cy="40" r="2" stroke="#0071e3" strokeWidth="1"/>
      </g>

      {/* Smart TV — medium, right side */}
      <g opacity="0.07" transform="translate(1200, 400) scale(1.5)">
        <rect x="5" y="5" width="70" height="45" rx="4" stroke="#0071e3" strokeWidth="1.5" fill="none"/>
        <rect x="10" y="10" width="60" height="35" rx="2" stroke="#0071e3" strokeWidth="1" fill="none"/>
        <line x1="30" y1="50" x2="30" y2="60" stroke="#0071e3" strokeWidth="1.5"/>
        <line x1="50" y1="50" x2="50" y2="60" stroke="#0071e3" strokeWidth="1.5"/>
        <line x1="20" y1="60" x2="60" y2="60" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* Drone — small, scattered */}
      <g opacity="0.06" transform="translate(320, 80) scale(1.1)">
        <ellipse cx="40" cy="40" rx="8" ry="4" stroke="#0071e3" strokeWidth="1.2" fill="none"/>
        <line x1="32" y1="38" x2="18" y2="28" stroke="#0071e3" strokeWidth="1.2"/>
        <line x1="48" y1="38" x2="62" y2="28" stroke="#0071e3" strokeWidth="1.2"/>
        <line x1="32" y1="42" x2="18" y2="52" stroke="#0071e3" strokeWidth="1.2"/>
        <line x1="48" y1="42" x2="62" y2="52" stroke="#0071e3" strokeWidth="1.2"/>
        <circle cx="18" cy="28" r="10" stroke="#0071e3" strokeWidth="1" fill="none"/>
        <circle cx="62" cy="28" r="10" stroke="#0071e3" strokeWidth="1" fill="none"/>
        <circle cx="18" cy="52" r="10" stroke="#0071e3" strokeWidth="1" fill="none"/>
        <circle cx="62" cy="52" r="10" stroke="#0071e3" strokeWidth="1" fill="none"/>
      </g>

      {/* Smart Watch — small */}
      <g opacity="0.06" transform="translate(1300, 700) scale(1.2)">
        <rect x="20" y="10" width="30" height="40" rx="8" stroke="#0071e3" strokeWidth="1.3" fill="none"/>
        <line x1="28" y1="10" x2="28" y2="2" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="42" y1="10" x2="42" y2="2" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="28" y1="50" x2="28" y2="58" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="42" y1="50" x2="42" y2="58" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="35" cy="30" r="8" stroke="#0071e3" strokeWidth="1" fill="none"/>
        <line x1="35" y1="25" x2="35" y2="30" stroke="#0071e3" strokeWidth="1"/>
        <line x1="35" y1="30" x2="39" y2="33" stroke="#0071e3" strokeWidth="1"/>
      </g>

      {/* Camera (IP Cam / Sports Cam) — small */}
      <g opacity="0.07" transform="translate(200, 720) scale(1.3)">
        <rect x="10" y="20" width="50" height="30" rx="5" stroke="#0071e3" strokeWidth="1.3" fill="none"/>
        <circle cx="35" cy="35" r="10" stroke="#0071e3" strokeWidth="1.3" fill="none"/>
        <circle cx="35" cy="35" r="5" stroke="#0071e3" strokeWidth="1" fill="none"/>
        <rect x="45" y="22" width="8" height="5" rx="1" stroke="#0071e3" strokeWidth="1" fill="none"/>
      </g>

      {/* Smart Speaker — small */}
      <g opacity="0.06" transform="translate(950, 150) scale(1.2)">
        <path d="M25 55 Q25 10 40 10 Q55 10 55 55" stroke="#0071e3" strokeWidth="1.3" fill="none"/>
        <ellipse cx="40" cy="55" rx="15" ry="5" stroke="#0071e3" strokeWidth="1.3" fill="none"/>
        <path d="M33 25 a7 7 0 0 1 14 0" stroke="#0071e3" strokeWidth="1" fill="none"/>
      </g>

      {/* Notebook / Laptop — small */}
      <g opacity="0.06" transform="translate(500, 780) scale(1)">
        <path d="M15 45 L15 15 Q15 10 20 10 L70 10 Q75 10 75 15 L75 45" stroke="#0071e3" strokeWidth="1.3" fill="none"/>
        <path d="M5 45 L85 45 Q90 50 85 55 L5 55 Q0 50 5 45z" stroke="#0071e3" strokeWidth="1.3" fill="none"/>
      </g>

      {/* VR Headset — small */}
      <g opacity="0.05" transform="translate(800, 750) scale(1.1)">
        <path d="M10 30 Q10 15 25 15 L55 15 Q70 15 70 30 L70 40 Q70 50 60 50 L50 50 Q45 50 40 45 Q35 50 30 50 L20 50 Q10 50 10 40z" stroke="#0071e3" strokeWidth="1.3" fill="none"/>
        <circle cx="28" cy="32" r="6" stroke="#0071e3" strokeWidth="1" fill="none"/>
        <circle cx="52" cy="32" r="6" stroke="#0071e3" strokeWidth="1" fill="none"/>
      </g>

      {/* Printer — tiny accent */}
      <g opacity="0.05" transform="translate(1100, 600) scale(1)">
        <rect x="10" y="20" width="50" height="25" rx="3" stroke="#0071e3" strokeWidth="1.2" fill="none"/>
        <path d="M18 20 L18 8 L52 8 L52 20" stroke="#0071e3" strokeWidth="1.2" fill="none"/>
        <path d="M18 45 L18 55 L52 55 L52 45" stroke="#0071e3" strokeWidth="1.2" fill="none"/>
      </g>

      {/* Game Console controller — tiny accent */}
      <g opacity="0.05" transform="translate(60, 400) scale(1)">
        <path d="M10 30 Q10 10 30 15 L50 15 Q70 10 70 30 Q70 50 55 45 L50 40 L30 40 L25 45 Q10 50 10 30z" stroke="#0071e3" strokeWidth="1.2" fill="none"/>
        <line x1="25" y1="25" x2="25" y2="33" stroke="#0071e3" strokeWidth="1"/>
        <line x1="21" y1="29" x2="29" y2="29" stroke="#0071e3" strokeWidth="1"/>
        <circle cx="50" cy="25" r="2" stroke="#0071e3" strokeWidth="0.8" fill="none"/>
        <circle cx="55" cy="30" r="2" stroke="#0071e3" strokeWidth="0.8" fill="none"/>
      </g>

      {/* Decorative WiFi waves — scattered small accents */}
      <g opacity="0.04" transform="translate(700, 100) scale(0.8)">
        <path d="M20 30c5.5-5.5 14.5-5.5 20 0" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M15 24c8.25-8.25 21.75-8.25 30 0" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </g>
      <g opacity="0.04" transform="translate(400, 500) scale(0.6)">
        <path d="M20 30c5.5-5.5 14.5-5.5 20 0" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M15 24c8.25-8.25 21.75-8.25 30 0" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M10 18c11-11 29-11 40 0" stroke="#0071e3" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </g>

      {/* Circuit traces — subtle connecting lines */}
      <g opacity="0.03" stroke="#0071e3" strokeWidth="1">
        <path d="M0 300 L120 300 L120 380 L200 380" fill="none"/>
        <path d="M1440 500 L1320 500 L1320 560 L1250 560" fill="none"/>
        <path d="M600 0 L600 60 L680 60" fill="none"/>
        <path d="M900 900 L900 820 L980 820" fill="none"/>
        <circle cx="120" cy="300" r="3" fill="#0071e3"/>
        <circle cx="200" cy="380" r="3" fill="#0071e3"/>
        <circle cx="1320" cy="500" r="3" fill="#0071e3"/>
        <circle cx="600" cy="60" r="3" fill="#0071e3"/>
      </g>
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
      padding: "12px 16px 12px 44px",
      border: "none",
      borderRadius: 8,
      background: focused ? "#ffffff" : "rgba(255,255,255,0.7)",
      fontSize: 17,
      fontWeight: 400 as const,
      color: "#1d1d1f",
      letterSpacing: -0.374,
      lineHeight: "1.47",
      outline: "none",
      transition: "all 0.2s ease",
      boxShadow: focused
        ? "0 0 0 2px #0071e3"
        : "inset 0 0 0 1px rgba(0,0,0,0.06)",
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
      {/* Product application illustrations */}
      <ProductIcons />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: 420,
          maxWidth: "92vw",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderRadius: 18,
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 8px 40px, rgba(0, 0, 0, 0.02) 0px 2px 8px",
          padding: "40px 36px 32px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src="/logo.png"
            alt="SeekWave 希微科技"
            style={{ height: 44, margin: "0 auto 14px", display: "block" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#1d1d1f",
              letterSpacing: -0.28,
              lineHeight: 1.14,
            }}
          >
            希微科技
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(0,0,0,0.48)",
              letterSpacing: 4,
              marginTop: 4,
              fontWeight: 400,
              textTransform: "uppercase",
            }}
          >
            SEEKWAVE TECHNOLOGY
          </div>
          <div
            style={{
              height: 1,
              margin: "20px auto 16px",
              width: 48,
              background: "rgba(0,0,0,0.08)",
            }}
          />
          <div
            style={{
              fontSize: 21,
              fontWeight: 600,
              color: "#1d1d1f",
              letterSpacing: 0.231,
              lineHeight: 1.19,
            }}
          >
            销售订单审批系统
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Username */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.5, zIndex: 1 }}>
              👤
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
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.5, zIndex: 1 }}>
              🔒
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
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.5, zIndex: 1 }}>
              📱
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
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.5, zIndex: 1 }}>
                ✉️
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
              disabled={countdown > 0}
              style={{
                padding: "0 18px",
                borderRadius: 8,
                border: countdown > 0 ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
                fontSize: 14,
                fontWeight: 400,
                letterSpacing: -0.224,
                whiteSpace: "nowrap",
                cursor: countdown > 0 ? "default" : "pointer",
                background: countdown > 0 ? "rgba(255,255,255,0.6)" : "#0071e3",
                color: countdown > 0 ? "rgba(0,0,0,0.48)" : "#ffffff",
                transition: "all 0.2s ease",
              }}
            >
              {countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
            </button>
          </div>

          {/* Toggles */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
            <Toggle checked={rememberAccount} onChange={setRememberAccount} label="记住账号" />
            <Toggle checked={rememberPassword} onChange={setRememberPassword} label="记住密码" />
          </div>

          {/* Error */}
          {error && (
            <div style={{ textAlign: "center", fontSize: 14, color: "#ff3b30", letterSpacing: -0.224, padding: "2px 0" }}>
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "12px 15px",
              borderRadius: 8,
              border: "1px solid transparent",
              background: "#0071e3",
              color: "#ffffff",
              fontSize: 17,
              fontWeight: 400,
              letterSpacing: -0.374,
              cursor: "pointer",
              transition: "all 0.2s ease",
              transform: pressed ? "scale(0.97)" : "scale(1)",
            }}
          >
            登录
          </button>

          {/* Security notice */}
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgba(0,0,0,0.48)",
              marginTop: 4,
              lineHeight: 1.33,
              letterSpacing: -0.12,
            }}
          >
            密码信息至关重要，请不要向其他人透露该信息。建议密码每个月更换一次。
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <Footer />
      </div>
    </div>
  );
}
