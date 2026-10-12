// In-app pop-ups that replace the browser's alert() and confirm().
//
//   notifySuccess("The changes were saved.", "Profile updated");
//   notifyError(error.response?.data?.message);
//   notifyWarning("Pick the dates first.");
//   if (!(await confirmDialog("She can be reactivated later.", { title: "Deactivate Maria?" }))) return;
//
// Each one returns a Promise that resolves when the pop-up is closed (confirmDialog: true when
// the person pressed Confirm), so a page can wait for it, or ignore it like it ignored alert().
// <DialogHost /> (mounted once in main.jsx) draws them, one at a time.
import { useSyncExternalStore } from "react";

let queue = []; // the pop-ups waiting; the first one is on screen
const listeners = new Set();
let nextId = 1;

const emit = () => listeners.forEach((l) => l());

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => queue;

export const useDialogs = () => useSyncExternalStore(subscribe, getSnapshot);

function open(spec) {
  return new Promise((resolve) => {
    queue = [...queue, { id: nextId++, ...spec, resolve }];
    emit();
  });
}

// called by <DialogHost /> when the person closes the pop-up
export function closeDialog(id, result) {
  const dialog = queue.find((d) => d.id === id);
  if (!dialog) return;
  queue = queue.filter((d) => d.id !== id);
  emit();
  dialog.resolve(result);
}

const text = (message, fallback) =>
  message === undefined || message === null || message === "" ? fallback : String(message);

export const notifySuccess = (message, title = "Done") =>
  open({ kind: "success", title, message: text(message, "") });

export const notifyError = (message, title = "Something went wrong") =>
  open({ kind: "error", title, message: text(message, "Please try again.") });

export const notifyWarning = (message, title = "Please check") =>
  open({ kind: "warning", title, message: text(message, "") });

export const confirmDialog = (
  message,
  { title = "Are you sure?", confirmLabel = "Confirm" } = {},
) => open({ kind: "confirm", title, message: text(message, ""), confirmLabel });
