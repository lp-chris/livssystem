export async function sendPushover(melding: string, tittel?: string) {
  const token = process.env.PUSHOVER_APP_TOKEN;
  const user = process.env.PUSHOVER_USER_KEY;

  if (!token || !user) {
    console.warn("Pushover ikke konfigurert — hopper over varsel");
    return;
  }

  const res = await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, user, message: melding, title: tittel ?? "Livssystem" }),
  });

  if (!res.ok) {
    console.error("Pushover-feil:", await res.text());
  }
}
