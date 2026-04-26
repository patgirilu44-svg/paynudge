import * as Sentry from '@sentry/node';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { validateInvoiceOwnership } from './validators';

// Initialize Sentry
Sentry.init({ dsn: 'YOUR_SENTRY_DSN' });

const rateLimiter = new RateLimiterMemory({ points: 5, duration: 1 }); // 5 requests per second

export const nudgeHandler = async (req, res) => {
    try {
        // Rate limiting
        await rateLimiter.consume(req.ip);
        
        const invoiceId = req.params.invoiceId;
        const userId = req.user.id;

        // Invoice ownership validation
        const isOwner = await validateInvoiceOwnership(invoiceId, userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'You do not own this invoice.' });
        }

        // Continue with the nudge logic
        // ... (your existing logic)

        return res.status(200).json({ message: 'Nudge sent successfully.' });
    } catch (error) {
        // Sentry error logging
        Sentry.captureException(error);
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};
