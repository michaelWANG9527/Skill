export { default } from "next-auth/middleware";

// 除以下路径外，所有页面与 API 均需登录：
// - /login          登录页
// - /api/auth       NextAuth 自身
// - /api/erp        鼎捷 ERP 服务端集成（X-API-Key 鉴权，无浏览器会话）
// - /api/health     健康检查（运维监控用）
export const config = {
  matcher: [
    "/((?!login|api/auth|api/erp|api/health|_next/static|_next/image|favicon.ico).*)",
  ],
};
