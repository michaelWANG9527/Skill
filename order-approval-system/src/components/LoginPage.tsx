"use client";

import { useState, useEffect, useCallback } from "react";
import { USERS } from "@/data/mockData";
import { User } from "@/types";
import Toggle from "@/components/ui/Toggle";
import Footer from "@/components/ui/Footer";

interface LoginPageProps {
  onLogin: (user: User) => void;
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
      padding: "13px 16px 13px 42px",
      border: focused
        ? "1px solid rgba(0,122,255,0.5)"
        : "1px solid rgba(0,0,0,0.06)",
      borderRadius: 12,
      background: focused ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
      fontSize: 15,
      color: "#1d1d1f",
      outline: "none",
      transition: "all 0.2s ease",
      boxShadow: focused ? "0 0 0 4px rgba(0,122,255,0.08)" : "none",
      boxSizing: "border-box" as const,
    }),
    []
  );

  const [focusField, setFocusField] = useState<string | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      {/* Glass Card */}
      <div
        style={{
          width: 420,
          maxWidth: "92vw",
          background: "rgba(255,255,255,0.68)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow:
            "0 8px 40px rgba(0,40,100,0.08), 0 2px 6px rgba(0,0,0,0.03)",
          padding: "36px 32px 28px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src="/logo.png"
            alt="SeekWave 希微科技"
            style={{ height: 40, margin: "0 auto 10px", display: "block" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#1a5ca8",
              letterSpacing: 3,
            }}
          >
            希微科技
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#3bb8c3",
              letterSpacing: 6,
              marginTop: 2,
              fontWeight: 500,
            }}
          >
            SEEKWAVE TECHNOLOGY
          </div>
          <div
            style={{
              height: 2,
              margin: "14px auto",
              width: 60,
              background: "linear-gradient(90deg, #1a5ca8, #3bb8c3)",
              borderRadius: 1,
            }}
          />
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1d1d1f",
            }}
          >
            销售订单审批系统
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Username */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                zIndex: 1,
              }}
            >
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
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                zIndex: 1,
              }}
            >
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
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                zIndex: 1,
              }}
            >
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
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 16,
                  zIndex: 1,
                }}
              >
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
                borderRadius: 12,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                cursor: countdown > 0 ? "default" : "pointer",
                background:
                  countdown > 0
                    ? "rgba(0,0,0,0.04)"
                    : "linear-gradient(135deg, #007AFF, #0055d4)",
                color: countdown > 0 ? "#86868b" : "#fff",
                transition: "all 0.2s ease",
              }}
            >
              {countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
            </button>
          </div>

          {/* Toggles */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
            }}
          >
            <Toggle
              checked={rememberAccount}
              onChange={setRememberAccount}
              label="记住账号"
            />
            <Toggle
              checked={rememberPassword}
              onChange={setRememberPassword}
              label="记住密码"
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#FF3B30",
                padding: "2px 0",
              }}
            >
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
              padding: 15,
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #007AFF, #0055d4)",
              color: "#fff",
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: 2,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0,122,255,0.25)",
              transition: "all 0.2s ease",
              transform: pressed ? "scale(0.97)" : "scale(1)",
            }}
          >
            登 录
          </button>

          {/* Security notice */}
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#FF3B30",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            密码信息至关重要，请不要向其他人透露该信息。建议密码每个月更换一次。
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
