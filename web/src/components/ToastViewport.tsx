import { CheckCircle2, Info, X, XCircle } from "lucide-react";

export type ToastTone = "error" | "info" | "success";

export type ToastMessage = {
  detail?: string;
  id: string;
  title: string;
  tone: ToastTone;
};

type ToastViewportProps = {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
};

export function ToastViewport({ messages, onDismiss }: ToastViewportProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="toast-viewport" aria-live="polite" aria-label="Notifications">
      {messages.map((message) => (
        <article className={`toast toast--${message.tone}`} key={message.id}>
          <span className="toast__icon" aria-hidden="true">
            {message.tone === "success" ? <CheckCircle2 size={18} /> : null}
            {message.tone === "info" ? <Info size={18} /> : null}
            {message.tone === "error" ? <XCircle size={18} /> : null}
          </span>
          <div>
            <strong>{message.title}</strong>
            {message.detail ? <p>{message.detail}</p> : null}
          </div>
          <button type="button" onClick={() => onDismiss(message.id)} aria-label="Dismiss notification">
            <X size={16} aria-hidden="true" />
          </button>
        </article>
      ))}
    </div>
  );
}
