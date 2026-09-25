import type { CSSProperties } from "react";

export const authFormStyles: Record<string, CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-3)",
    width: "100%",
    maxWidth: 360,
    margin: "0 auto",
    padding: "var(--s-6) var(--s-4)",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--fs-xl)",
    marginBottom: "var(--s-2)",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--s-1)",
    fontSize: "var(--fs-sm)",
    color: "var(--text-2)",
  },
  input: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: "var(--r-md)",
    color: "var(--text)",
    padding: "var(--s-2) var(--s-3)",
    fontSize: "var(--fs-md)",
    fontFamily: "var(--font-body)",
  },
  button: {
    background: "var(--brand)",
    color: "var(--bg)",
    border: "none",
    borderRadius: "var(--r-lg)",
    padding: "var(--s-3)",
    fontSize: "var(--fs-md)",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "var(--s-2)",
  },
  error: {
    color: "var(--error-text)",
    fontSize: "var(--fs-sm)",
    margin: 0,
  },
  hint: {
    color: "var(--text-2)",
    fontSize: "var(--fs-sm)",
    textAlign: "center",
    margin: 0,
  },
};
