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
      background: focused ? "#ffffff" : "#f5f5f7",
      fontSize: 17,
      fontWeight: 400 as const,
      color: "#1d1d1f",
      letterSpacing: -0.374,
      lineHeight: "1.47",
      outline: "none",
      transition: "all 0.2s ease",
      boxShadow: focused
        ? "0 0 0 2px #0071e3"
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
        background: "#000000",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: 420,
          maxWidth: "92vw",
          background: "#ffffff",
          borderRadius: 18,
          boxShadow: "rgba(0, 0, 0, 0.22) 3px 5px 30px 0px",
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
              background: "rgba(0,0,0,0.12)",
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
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                opacity: 0.5,
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
                opacity: 0.5,
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
                opacity: 0.5,
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
                  opacity: 0.5,
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
                borderRadius: 8,
                border: countdown > 0 ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
                fontSize: 14,
                fontWeight: 400,
                letterSpacing: -0.224,
                whiteSpace: "nowrap",
                cursor: countdown > 0 ? "default" : "pointer",
                background: countdown > 0 ? "#f5f5f7" : "#0071e3",
                color: countdown > 0 ? "rgba(0,0,0,0.48)" : "#ffffff",
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
              padding: "2px 0",
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
                fontSize: 14,
                color: "#ff3b30",
                letterSpacing: -0.224,
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

      <Footer />
    </div>
  );
}
