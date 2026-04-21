import type { RequestHandler } from '@sveltejs/kit';
import * as cheerio from 'cheerio';

export const GET: RequestHandler = async ({ url }) => {
  const ref = url.searchParams.get('ref');

  if (!ref) {
    return new Response(JSON.stringify({ error: 'Missing ref' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const res = await fetch(
      `https://apis.backend.mouau.edu.ng/api/printable-receipt?transaction_ref=${encodeURIComponent(ref)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'text/html'
        },
        signal: AbortSignal.timeout(10_000)
      }
    );

    const html = await res.text();

    // Invalid ref returns JSON: { status: false, message: '...' }
    if (html.trimStart().startsWith('{')) {
      const json = JSON.parse(html);
      return new Response(
        JSON.stringify({ error: json.message ?? 'Invalid transaction reference' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const $ = cheerio.load(html);

    // ── Layout A: "LABEL:" in one td, value in the next td (same row) ──
    // Used for: NAME, MATRIC NO, COLLEGE, DEPARTMENT, REG. NO, SESSION, LEVEL
    const getInlineCell = (label: string): string => {
      let found = '';
      $('td').each((_, el) => {
        const text = $(el).text().trim();
        if (text.toLowerCase() === label.toLowerCase() + ':' || text.toLowerCase() === label.toLowerCase()) {
          found = $(el).next('td').text().trim();
          return false;
        }
      });
      return found;
    };

    // ── Layout B: receipt details table — label in col 1, value in col 2 ──
    // Used for: RRR Code, Amount Paid, Payment Date, Purpose, Portal Issued Receipt Number
    const getReceiptDetail = (label: string): string => {
      let found = '';
      $('tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const cellLabel = cells.eq(0).text().trim().replace(/:$/, '').toLowerCase();
          if (cellLabel === label.toLowerCase()) {
            found = cells.eq(1).text().trim();
            return false;
          }
        }
      });
      return found;
    };

    const result = {
      name:       getInlineCell('NAME'),
      college:    getInlineCell('COLLEGE'),
      department: getInlineCell('DEPARTMENT'),
      matricNo:   getInlineCell('MATRIC NO'),
      jambregNo:  getInlineCell('REG. NO'),
      level:      getInlineCell('LEVEL'),
      session:    getInlineCell('SESSION'),
      receiptNo:  getReceiptDetail('Portal Issued Receipt Number'),
      rrrCode:    getReceiptDetail('RRR Code'),
      amountPaid: getReceiptDetail('Amount Paid (in Naira)'),
      paymentDate: getReceiptDetail('Payment Date'),
      purpose:    getReceiptDetail('Purpose of Payment')
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[receipt] error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};