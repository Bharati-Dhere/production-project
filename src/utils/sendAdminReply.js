// Utility to call backend email API
export async function sendAdminReply({ to, subject, text, html }) {
  const res = await fetch('https://production-project-1.onrender.com/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ to, subject, text, html })
  });
  if (!res.ok) throw new Error('Failed to send email');
  return res.json();
}
