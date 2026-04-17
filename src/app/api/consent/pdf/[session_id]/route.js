import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: "PDF Generation has been disabled." }, { status: 410 });
}
