function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function checkAnswer(user: string, expected: string[]): "correct" | "close" | "wrong" {
  const u = normalize(user);
  if (!u) return "wrong";

  for (const ans of expected) {
    const e = normalize(ans);
    if (u === e) return "correct";
    if (u.includes(e) || e.includes(u)) return "close";
  }

  const uWords = new Set(u.split(" "));
  for (const ans of expected) {
    const eWords = normalize(ans).split(" ").filter(Boolean);
    const hit = eWords.filter((w) => uWords.has(w)).length;
    if (eWords.length > 0 && hit / eWords.length >= 0.85) return "close";
  }

  return "wrong";
}
