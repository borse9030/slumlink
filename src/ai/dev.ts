import { config } from 'dotenv';
config();

import '@/ai/flows/generate-development-suggestions.ts';
import '@/ai/flows/suggest-urgent-needs.ts';
import '@/ai/flows/summarize-zone-issues.ts';
