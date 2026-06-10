"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  FileText,
  Image,
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BIZ_TYPE_LABELS, formatFileSize, cn } from "@/lib/utils";

interface LinkItem {
  bizType: string;
  bizId: string;
  bizNo: string;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

const BIZ_TYPES = Object.entries(BIZ_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function getFileIcon(mimeType: string) {
  if (mimeType === "application/pdf") return FileText;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return FileSpreadsheet;
  return FileText;
}

function UploadPageContent() {
  const router = useRouter();
  // 从 URL 读取预填参数（如订单页「上传文档」按钮跳转：/upload?bizType=ORDER&bizNo=SO-2026-001）
  const searchParams = useSearchParams();
  const presetType = searchParams.get("bizType") || "ORDER";
  const presetNo = searchParams.get("bizNo") || "";

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([
    { bizType: presetType, bizId: presetNo, bizNo: presetNo },
  ]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setError("");
      setStatus("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    onDropRejected: (files) => {
      const err = files[0]?.errors[0];
      if (err?.code === "file-too-large") setError("文件大小不能超过 50MB");
      else if (err?.code === "file-invalid-type")
        setError("不支持该文件类型，仅支持 PDF、Word、Excel、图片");
      else setError("文件不合法");
    },
  });

  const addLink = () => {
    setLinks([...links, { bizType: "ORDER", bizId: "", bizNo: "" }]);
  };

  const removeLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const updateLink = (idx: number, field: keyof LinkItem, value: string) => {
    setLinks(
      links.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("请先选择文件");
      return;
    }

    const validLinks = links.filter((l) => l.bizId && l.bizNo);

    setStatus("uploading");
    setProgress(0);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    if (description) formData.append("description", description);
    if (validLinks.length > 0) {
      formData.append("links", JSON.stringify(validLinks));
    }

    // 模拟进度（真实进度需要 XMLHttpRequest）
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 85));
    }, 200);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);
      setProgress(100);

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setError(data.error || "上传失败，请稍后重试");
        return;
      }

      setStatus("success");
      setTimeout(() => {
        router.push(`/documents/${data.data.id}`);
      }, 1200);
    } catch {
      clearInterval(progressTimer);
      setStatus("error");
      setError("网络错误，请检查连接后重试");
    }
  };

  const FileIcon = file ? getFileIcon(file.type) : null;

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold">上传文档</h1>
        <p className="text-sm text-muted-foreground mt-1">
          支持 PDF、Word、Excel、图片，单文件最大 50MB
        </p>
      </div>

      {/* 拖拽上传区 */}
      <Card>
        <CardContent className="pt-5">
          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200",
                isDragActive
                  ? "border-apple-blue bg-apple-blue/5"
                  : "border-border hover:border-apple-gray-2 hover:bg-apple-gray-6"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-12 h-12 rounded-xl bg-apple-gray-6 flex items-center justify-center mx-auto mb-4">
                <Upload
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isDragActive ? "text-apple-blue" : "text-apple-gray-2"
                  )}
                  strokeWidth={1.5}
                />
              </div>
              {isDragActive ? (
                <p className="text-sm font-medium text-apple-blue">
                  释放鼠标以上传文件
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">
                    拖拽文件到此处，或{" "}
                    <span className="text-apple-blue">点击选择文件</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    PDF、Word、Excel、图片（JPG/PNG/WebP）
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-apple-gray-6 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-white shadow-apple flex items-center justify-center shrink-0">
                {FileIcon && (
                  <FileIcon
                    className="w-5 h-5 text-apple-blue"
                    strokeWidth={1.5}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => { setFile(null); setStatus("idle"); }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-apple-red hover:bg-apple-red/10 transition-colors"
                disabled={status === "uploading"}
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* 上传进度 */}
          {status === "uploading" && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>正在上传...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-apple-gray-5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-apple-blue rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="mt-4 flex items-center gap-2 text-sm text-apple-green">
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              上传成功，正在跳转...
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-md bg-red-50 border border-apple-red/20">
              <AlertCircle
                className="w-4 h-4 text-apple-red shrink-0"
                strokeWidth={1.5}
              />
              <p className="text-sm text-apple-red">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 文档描述 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">文档描述（可选）</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Input
            placeholder="补充说明，如合同期限、版本备注等"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* 关联业务对象 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">关联业务对象</CardTitle>
            <Button variant="ghost" size="sm" onClick={addLink}>
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              添加关联
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {links.map((link, idx) => (
            <div key={idx} className="flex items-end gap-2">
              <div className="w-32 shrink-0">
                {idx === 0 && (
                  <Label className="text-xs mb-1.5 block">类型</Label>
                )}
                <Select
                  value={link.bizType}
                  onValueChange={(v) => updateLink(idx, "bizType", v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BIZ_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                {idx === 0 && (
                  <Label className="text-xs mb-1.5 block">编号</Label>
                )}
                <Input
                  placeholder="如 SO-2026-001"
                  value={link.bizNo}
                  onChange={(e) => {
                    updateLink(idx, "bizNo", e.target.value);
                    updateLink(idx, "bizId", e.target.value);
                  }}
                />
              </div>
              {links.length > 1 && (
                <button
                  onClick={() => removeLink(idx)}
                  className="mb-px p-2 rounded-md text-muted-foreground hover:text-apple-red hover:bg-apple-red/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            关联后可通过订单号、客户编号等快速检索此文档
          </p>
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!file || status === "uploading" || status === "success"}
          size="lg"
          className="flex-1"
        >
          {status === "uploading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" strokeWidth={1.5} />
              确认上传
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.back()}
          disabled={status === "uploading"}
        >
          取消
        </Button>
      </div>
    </div>
  );
}

// useSearchParams 需要 Suspense 边界（Next.js App Router 要求）
export default function UploadPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl space-y-5"><div className="skeleton h-8 w-40" /><div className="skeleton h-48 w-full" /></div>}>
      <UploadPageContent />
    </Suspense>
  );
}
