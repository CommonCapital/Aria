/**
 * Telegram Integration for Aria
 * Fetches and summarizes messages from authorized chats.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { ARIA_SYSTEM_PROMPT } from './persona';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export interface TelegramMessage {
  id: number;
  chatId: number;
  chatTitle: string;
  sender: string;
  text: string;
  date: number;
}

/**
 * Fetches unread updates from the Telegram Bot API.
 * Note: In a real app, you'd use a webhook or persistent polling.
 */
export async function fetchTelegramMessages(): Promise<TelegramMessage[]> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("Telegram Bot Token is missing.");
    return [];
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=50&allowed_updates=["message"]`);
    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API Error: ${data.description}`);
    }

    return data.result.map((update: any) => ({
      id: update.message.message_id,
      chatId: update.message.chat.id,
      chatTitle: update.message.chat.title || "Private Chat",
      sender: update.message.from.first_name || update.message.from.username,
      text: update.message.text || "",
      date: update.message.date,
    })).filter((msg: any) => msg.text.length > 0);
  } catch (error) {
    console.error("Failed to fetch Telegram messages:", error);
    return [];
  }
}

/**
 * Summarizes Telegram messages using Aria's persona.
 */
export async function summarizeTelegramMessages(messages: TelegramMessage[]) {
  if (messages.length === 0) return "No new messages on Telegram.";

  const messageContext = messages.map(m => 
    `[${new Date(m.date * 1000).toLocaleTimeString()}] ${m.sender} in ${m.chatTitle}: ${m.text}`
  ).join("\n");

  const { text } = await generateText({
    model: anthropic("claude-3-5-sonnet-latest"),
    prompt: `
    ${ARIA_SYSTEM_PROMPT}
    
    The user has some new messages on Telegram. Please summarize them in your warm, caring tone as Aria. 
    Focus on anything important, mentions of the user, or interesting group chat drama.
    
    MESSAGES:
    ${messageContext}
    
    Aria's Summary:
    `,
  });

  return text;
}
