import { NextRequest } from 'next/server';

const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

export async function POST(request: NextRequest) {
  const { action, source_code, language_id, stdin } = await request.json();
  
  if (!JUDGE0_API_KEY) {
    return Response.json({ success: false, error: 'Judge0 API key not configured' }, { status: 500 });
  }
  
  try {
    switch (action) {
      case 'submit':
        return await submitCode(source_code, language_id, stdin);
      case 'get-result':
        const { token } = await request.json();
        return await getSubmissionResult(token);
      default:
        return Response.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in Judge0 API:', error);
    return Response.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}

async function submitCode(source_code: string, language_id: number, stdin: string = '') {
  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY as string,
      'X-RapidAPI-Host': JUDGE0_API_HOST,
    },
    body: JSON.stringify({
      source_code,
      language_id,
      stdin,
    }),
  });
  
  const data = await response.json();
  return Response.json({ success: true, token: data.token });
}

async function getSubmissionResult(token: string) {
  const response = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': JUDGE0_API_KEY as string,
      'X-RapidAPI-Host': JUDGE0_API_HOST,
    },
  });
  
  const data = await response.json();
  return Response.json({ success: true, result: data });
}