import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validation.middleware';
import { GoogleGenAI } from '@google/genai';

const router = Router();

const chatMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message cannot be empty'),
    previousInteractionId: z.string().optional().or(z.literal(''))
  })
});

const SYSTEM_PROMPT = `You are KiwiBot, the official AI assistant for KiwiClicks (Delhi's Digital Growth Partner). 
KiwiClicks is a premium, founder-led digital marketing and high-velocity web development agency located in Dwarka, New Delhi.
Founded and led by Bandana Kumari (Founder & Growth Strategist), KiwiClicks helps ambitious local brands and businesses in Delhi/NCR grow.

Key details about KiwiClicks:
- Services we offer:
  1. Search Engine Optimization (SEO) & Local SEO.
  2. Google Business Profile (GBP) Optimization (moving local businesses to the top-3 pack on Google Maps).
  3. Speed-Optimized Custom Web Development (using modern React, Shopify, custom single product landers).
  4. WhatsApp Marketing Automation & Chatbots (building user sync, CRM integrations).
  5. CRM & Lead Pipeline Automations (integrating tools like Make, Zapier, Hubspot to capture and profile leads).
- Key Statistics & Trust Signals:
  - 20+ successful businesses helped.
  - Average ROAS of 4.8x on search/social ads.
  - 400+ qualified leads generated per month.
  - Up to 320% traffic growth increases.
- Location: Dwarka, New Delhi.
- Contact Details: Phone: +91 82100 77633, Email: info@kiwiclicks.in.
- Founder: Bandana Kumari.

Guidelines for your tone and behavior:
- Keep your answers concise, helpful, professional, and friendly.
- Highlight our founder-led approach and focus on metrics/results.
- Encourage users to book a direct call or message on WhatsApp (+91 82100 77633) for detailed audits.
- If the visitor wants to submit their contact info, let them know they can do so on the contact page or provide details here.`;

// Simple keyword-based local search heuristic engine (Fallback when no API Key is available)
function getLocalHeuristicResponse(userMessage: string): string {
  const query = userMessage.toLowerCase();

  if (query.includes('seo') || query.includes('rank') || query.includes('search') || query.includes('google maps') || query.includes('gbp') || query.includes('local pack')) {
    return "KiwiClicks is a specialist in SEO and Google Business Profile (GBP) optimization. We help Delhi/NCR businesses rank on page 1 of Google and in the top-3 local pack on Google Maps. This drives organic phone calls and direct enquiries. Would you like a free SEO audit for your website? You can contact Bandana Kumari at +91 82100 77633.";
  }

  if (query.includes('website') || query.includes('web dev') || query.includes('react') || query.includes('shopify') || query.includes('wordpress') || query.includes('speed')) {
    return "We build speed-optimized custom websites, React single-product landers, and Shopify stores. Our pages are built for conversions, fast load times, and clean UI. Would you like to check our results page to see recent client websites? Let's discuss your project details!";
  }

  if (query.includes('whatsapp') || query.includes('bot') || query.includes('automation') || query.includes('crm') || query.includes('make') || query.includes('zapier')) {
    return "KiwiClicks builds custom AI chatbot integrations, WhatsApp automation flows (like verification, automated updates), and CRM pipes (Make/Zapier) that reduce manual labor bottlenecks. We can automate your customer lead pings and contact form sorting. Would you like a live demo?";
  }

  if (query.includes('founder') || query.includes('bandana') || query.includes('kumari') || query.includes('owner') || query.includes('strategist')) {
    return "KiwiClicks is founded and led by Bandana Kumari, a growth strategist based in Delhi. Unlike other agencies led by sales managers, KiwiClicks is founder-led, meaning you get custom-built digital marketing systems and strategies designed directly by Bandana herself to target NCR buyer behavior.";
  }

  if (query.includes('contact') || query.includes('phone') || query.includes('number') || query.includes('email') || query.includes('address') || query.includes('location') || query.includes('office') || query.includes('delhi')) {
    return "Our office is in Dwarka, New Delhi. You can call or WhatsApp our founder Bandana Kumari directly at +91 82100 77633, or email us at info@kiwiclicks.in. We can schedule a video call or a face-to-face meet at our Dwarka office!";
  }

  if (query.includes('pricing') || query.includes('cost') || query.includes('charge') || query.includes('budget') || query.includes('rate')) {
    return "We create custom digital growth packages tailored to your business needs (Local SEO, Web Dev, or automations). We focus on ROI and profitable customer acquisition rather than generic packages. Please share your project scope or contact +91 82100 77633 to get a quote.";
  }

  if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('greetings')) {
    return "Hello! I am KiwiBot, your digital growth assistant. How can I help you grow your business in Delhi today? I can tell you about our SEO, Web Development, or Automation services, or help you contact our founder, Bandana Kumari.";
  }

  return "I'm KiwiBot, the KiwiClicks digital growth assistant. I can tell you all about our conversion-focused Web Development, Local SEO, WhatsApp Automations, and CRM integrations, or guide you to contact our founder Bandana Kumari directly at +91 82100 77633. What services are you looking for today?";
}

router.post('/', validate(chatMessageSchema), async (req: any, res: any, next: any) => {
  try {
    const { message, previousInteractionId } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Heuristic engine fallback
      const responseText = getLocalHeuristicResponse(message);
      return res.status(200).json({
        status: 'success',
        data: {
          reply: responseText,
          interactionId: null,
          source: 'local_heuristic_fallback'
        }
      });
    }

    // Initialize official GoogleGenAI Client
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const tools: any[] = [
      {
        type: 'google_search',
      },
    ];

    const generationConfig = {
      temperature: 1,
      max_output_tokens: 65536,
      topP: 0.95,
      thinkingLevel: 'high',
    };

    // Query Gemini using Interactions API
    const interaction = await ai.interactions.create({
      model: 'models/gemini-3-flash-preview',
      input: message,
      previous_interaction_id: previousInteractionId || undefined,
      tools: tools,
      system_instruction: SYSTEM_PROMPT,
      generation_config: generationConfig,
    });

    const reply = interaction.output_text || getLocalHeuristicResponse(message);

    return res.status(200).json({
      status: 'success',
      data: {
        reply,
        interactionId: interaction.id,
        source: 'gemini_interactions_api'
      }
    });
  } catch (error) {
    // If Gemini query fails, gracefully fallback to local heuristic search to prevent breaking client UI
    console.error('[Chat API Error] Gemini SDK interaction query failed:', error);
    try {
      const fallbackReply = getLocalHeuristicResponse(req.body.message);
      return res.status(200).json({
        status: 'success',
        data: {
          reply: fallbackReply,
          interactionId: null,
          source: 'error_fallback'
        }
      });
    } catch (fallbackErr) {
      return next(fallbackErr);
    }
  }
});

export const chatRouter = router;
export default router;
