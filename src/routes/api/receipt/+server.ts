import type { RequestHandler } from '@sveltejs/kit';
import axios from 'axios';
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
    const { data } = await axios.get(
      `https://apis.backend.mouau.edu.ng/api/printable-receipt?transaction_ref=${ref}`,
      { timeout: 10_000 }
    );

    const $ = cheerio.load(data);

    const getText = (label: string) =>
      $(`th:contains("${label}")`).first().next('td').text().trim();

    const result = {
      name:       getText('NAME'),
      college:    getText('COLLEGE'),
      department: getText('DEPARTMENT'),
      matricNo:   getText('MATRIC NO'),
      jambregNo: getText('JAMB REG NO'),
      level:      getText('LEVEL'),
      session:    getText('SESSION'),
      receiptNo:  getText('Portal Issued Receipt Number')
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('MOUAU receipt fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch receipt' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};