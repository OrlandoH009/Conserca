"use server";

import * as QuoteController from "@/controllers/quote.controller";

export type QuoteState = QuoteController.PublicQuoteResult;

export async function submitQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  return QuoteController.submitPublic(formData);
}

export async function submitQuick(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  return QuoteController.submitQuick(formData);
}
