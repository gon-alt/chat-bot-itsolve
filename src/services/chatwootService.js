// src/services/chatwootService.js
const BASE = process.env.CHATWOOT_URL;
const TOKEN = process.env.CHATWOOT_TOKEN;
const ACCOUNT = process.env.CHATWOOT_ACCOUNT_ID;
const INBOX = process.env.CHATWOOT_INBOX_ID;

const headers = {
  "Content-Type": "application/json",
  "api_access_token": TOKEN,
};

async function findOrCreateContact(phone) {
  const search = await fetch(`${BASE}/api/v1/accounts/${ACCOUNT}/contacts/search?q=${phone}&include_contacts=true`, { headers });
  const data = await search.json();
  if (data.payload?.length > 0) return data.payload[0].id;

  const create = await fetch(`${BASE}/api/v1/accounts/${ACCOUNT}/contacts`, {
    method: "POST",
    headers,
    body: JSON.stringify({ phone_number: `+${phone}`, name: phone }),
  });
  const contact = await create.json();
  return contact.id;
}

async function createConversation(contactId, initialMessage) {
  const res = await fetch(`${BASE}/api/v1/accounts/${ACCOUNT}/conversations`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      inbox_id: Number(INBOX),
      contact_id: contactId,
      additional_attributes: {},
    }),
  });
  const conv = await res.json();
  const convId = conv.id;

  if (initialMessage) {
    await sendMessage(convId, initialMessage, "incoming");
  }

  return convId;
}

async function sendMessage(conversationId, content, type = "incoming") {
  await fetch(`${BASE}/api/v1/accounts/${ACCOUNT}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content, message_type: type, private: false }),
  });
}

async function escalateToAgent(phone, historyText) {
  const contactId = await findOrCreateContact(phone);
  const convId = await createConversation(contactId, historyText);
  return convId;
}

module.exports = { escalateToAgent, sendMessage };
