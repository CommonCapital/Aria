import { completeAgentRun, createAgentRun, createTask } from "@/app/db/queries"
import { NextResponse } from "next/server"
import { getCalendarClient, getGmailClient } from "./google-client";
import { createDraft, fetchUnReadEmails, markAsRead } from "./agents/gmail";
import { CalendarEvent, createCalendarEvent, fetchUpcomingEvent } from "./agents/calendar";
import { ActionLogEntry } from "@/app/db/schema";
import { analyzeEmailWithAI } from "./agents/proces-email";
import { fetchTelegramMessages, summarizeTelegramMessages } from "./agents/telegram";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { ARIA_SYSTEM_PROMPT } from "./agents/persona";
import { memoryClient } from "./memory-client";

export async function runAgent(userId: string) {
    const startTime = Date.now()
    const agentRun  = await createAgentRun(userId);
    try {
       

        const gmailClient = await getGmailClient(userId);
        if (!gmailClient) {
            const run = await completeAgentRun(
                agentRun.id,
                {
                    status: "failed",
                    summary: "Gmail is not connected",
                    actionsLog:  [],
                    emailProcessed: 0,
                    tasksCreated: 0,
                    draftsCreated: 0,
                    errorMessage: "Gmail is not connected or token expired",
                    
                    durationMs: Date.now() - startTime,

                }
            );

            return {
                runId: run.id, status: "failed" as const, summary: "Gmail not connected",
            };
        }

        const emails = await fetchUnReadEmails(gmailClient, 10);
         if (emails.length === 0) {
            const run = await completeAgentRun(agentRun.id, {
                status: "success",
                summary: "No unread emails found",
                actionsLog: [],
                emailProcessed: 0,
                tasksCreated: 0,
                draftsCreated: 0,
                durationMs: Date.now() - startTime,
            });

            return {
                runId: run.id,
                status: "success" as const,
                summary: "No unread emails to process",
            };
         }

         const calendarClient = await getCalendarClient(userId);
         let upcomingEvents: CalendarEvent[] = []
         if (calendarClient) {
            try {
                upcomingEvents = await fetchUpcomingEvent(calendarClient, 24)
            } catch (error) {
                console.error("Calendar fetch failed:", error);
            }
         }
 
         // --- Telegram Integration ---
         const telegramMessages = await fetchTelegramMessages();
         const telegramSummary = telegramMessages.length > 0 
           ? await summarizeTelegramMessages(telegramMessages)
           : "No new messages on Telegram.";

         // --- Memory Retrieval ---
         const memoryContext = await memoryClient.search("Information relevant to unread emails and tasks", userId);


       const actionsLog: ActionLogEntry[] = [];
       let totalTasksCreated = 0;
       let totalDraftsCreated = 0;
       let totalEventsCreated = 0;

       const results = await Promise.allSettled(emails.map(async (email) => {
        try {
          const analysis = await analyzeEmailWithAI(email, upcomingEvents, memoryContext);
          let emailTasksCreated = 0;

          for (const item of analysis.actionItems) {
             await createTask({
                userId,
                title: item.title,
                description: item.description,
                priority: analysis.priority,
                dueDate: item.dueDate ? new Date(item.dueDate) : null,
                createdByAgent: true,
                

          })
          emailTasksCreated++;
          };

          let draftCreated = false;
          if (analysis.needsReply && analysis.draftReply) {
            await createDraft(
                gmailClient,
                email.from,
                email.subject,
                analysis.draftReply,
                email.threadId,
            );
            draftCreated = true;
          }

          let emailEventsCreated = 0;
          if (calendarClient && analysis.calendarEvents.length > 0) {
            for (const event of analysis.calendarEvents) {
                try {
                    await createCalendarEvent(calendarClient, event);
                    emailEventsCreated++;
                } catch (error) {
                    console.error(
                        `[Agent] Failed to create calendar event "${event.title}":`, error,
                    );
                }
            }
          }

          await markAsRead(gmailClient, email.id);

          // --- Memorize Email ---
          await memoryClient.memorize(email.id, email.subject, email.body, userId);


          return {
            emailId: email.id,
            subject: email.subject,
            from: email.date,
            date: email.date,
            status: "success",
            summary: analysis.summary,
            priority: analysis.priority,
            category: analysis.category,
            needsReply: analysis.needsReply,
            draftReply: analysis.draftReply,
            actionItems: analysis.actionItems,
            calendarEvents: analysis.calendarEvents,
            tasksCreated: emailTasksCreated,
            draftsCreated: draftCreated,
            eventsCreated: emailEventsCreated,
            
          }

        } catch (error) {
            console.error("Email processing failed:", error);
            return {
                emailId: email.id,
                subject: email.subject,
                from: email.from,
                date: email.date,
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error",

            };

        }
       }));

       for (const result of results) {
if (result.status === 'fulfilled') {
    const entry = result.value;
    actionsLog.push({
        emailId: entry.emailId,
        subject: entry.subject,
        from: entry.from,
        date: entry.date,
        status: entry.status as 'success' | 'error',
        summary: entry.summary,
        priority: entry.priority
    })
    if (entry.status === "success") {
        totalTasksCreated += entry.tasksCreated ?? 0;
        totalDraftsCreated += entry.draftsCreated ? 1 : 0;
        totalEventsCreated += entry.eventsCreated ?? 0;
    } 

}
       }

       const successCount = actionsLog.filter((entry) =>
        entry.status === 'success').length;
       const errorCount = actionsLog.filter((entry) =>
        entry.status === "error").length;
       const overallStatus = successCount > 0 ? "success" : "failed";

       const { text: ariaSummary } = await generateText({
         model: anthropic("claude-3-5-sonnet-latest"),
         prompt: `
         ${ARIA_SYSTEM_PROMPT}
         
         Here is a technical summary of what was accomplished in this agent run:
         - Emails processed: ${successCount}
         - Tasks created: ${totalTasksCreated}
         - Drafts created: ${totalDraftsCreated}
         - Calendar events created: ${totalEventsCreated}
         - Telegram summary: ${telegramSummary}
         - Upcoming events: ${upcomingEvents.length}
         
         Please provide a warm, caring, and conversational summary for the user as Aria. 
         Keep it concise but meaningful. Mention any important Telegram or Email highlights.
         `,
       });



    const run = await completeAgentRun(agentRun.id, {
         status: overallStatus,
         summary: ariaSummary,
        actionsLog: actionsLog,
        emailProcessed: successCount,
        tasksCreated: totalTasksCreated,
        draftsCreated: totalDraftsCreated,
        durationMs: Date.now() - startTime,
        errorMessage: 
        errorCount > 0 ? `${errorCount} email(s) failed to process` : undefined
    });
     return {
         runId: run.id,
         status: overallStatus,
         summary: ariaSummary,
     }

    } catch (error) {
        console.error("Agent run error:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const run = await completeAgentRun(agentRun.id, {
            status: "failed",
            summary: "Agent run failed",
        actionsLog: [],
        emailProcessed: 0,
        tasksCreated: 0,
        draftsCreated: 0,
        durationMs: Date.now() - startTime
        })
        return {
            runId: run.id,
            status: "failed",
            summary: errorMessage
        }
    }

}