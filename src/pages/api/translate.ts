import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text, targetLang, isHtml } = await request.json();
    const apiKey = import.meta.env.DEEPL_API_KEY;

    if (!apiKey) {
      console.error('Translation Error: DEEPL_API_KEY is not defined in environment variables.');
      return new Response(JSON.stringify({ error: 'DeepL API key not found' }), { status: 500 });
    }

    // Map Astro locales to DeepL target languages
    const langMap: Record<string, string> = {
      'en': 'EN-US',
      'pt-br': 'PT-BR',
      'es': 'ES',
      'ja': 'JA',
      'nl': 'NL',
      'zh': 'ZH'
    };

    const target = langMap[targetLang] || targetLang.toUpperCase();
    const isFree = apiKey.endsWith(':fx');
    const url = isFree 
      ? 'https://api-free.deepl.com/v2/translate' 
      : 'https://api.deepl.com/v2/translate';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        target_lang: target,
        ...(isHtml && { tag_handling: 'xml' })
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepL Error:', errorData);
      return new Response(JSON.stringify({ error: 'DeepL translation failed' }), { status: response.status });
    }

    const data = await response.json();
    const translated = data.translations[0].text;

    return new Response(JSON.stringify({ translated }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('Translation API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
