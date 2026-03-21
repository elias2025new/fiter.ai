import { webhookCallback } from "grammy";
import { bot } from "../bot/index";

/**
 * Vercel Serverless Function to handle Telegram webhooks
 */
export default webhookCallback(bot, "next-js");
