"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  documentId: string;
  documentName: string;
}

export function DeleteDocumentButton({ documentId, documentName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "删除失败");
        setDeleting(false);
        return;
      }
      router.push("/documents");
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
      setDeleting(false);
    }
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
        删除
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-apple-red" strokeWidth={1.5} />
              确认删除文档？
            </DialogTitle>
            <DialogDescription className="pt-2">
              即将删除「{documentName}」。
              <br />
              文件将从存储中移除，此操作不可恢复（删除行为本身会被记入审计日志）。
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="text-sm text-apple-red bg-red-50 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  删除中…
                </>
              ) : (
                "确认删除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
