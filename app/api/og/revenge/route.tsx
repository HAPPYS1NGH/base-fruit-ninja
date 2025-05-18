import React from 'react';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = searchParams.get('score') || '0';
  const victimsStr = searchParams.get('victims') || '[]';
  let victims: { username: string; pfp: string }[] = [];
  try {
    victims = JSON.parse(victimsStr);
  } catch {}

  const maxAvatars = Math.min(victims.length, 6);

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'linear-gradient(to bottom, #1e3a8a, #000)',
      }}
    >
      <div style={{ marginTop: 40, color: '#fff', fontSize: 60, fontWeight: 700, textAlign: 'center' }}>
        Sliced {victims.length} followers in Fruit Ninja!
      </div>
      <div style={{ color: '#fbbf24', fontSize: 80, fontWeight: 700, margin: '20px 0' }}>
        Score: {score}
      </div>
      <div style={{ color: '#ef4444', fontSize: 50, fontWeight: 700, fontStyle: 'italic', marginBottom: 30 }}>
        Take Your Revenge!
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 40, width: '100%' }}>
        {victims.slice(0, maxAvatars).map((victim) => (
          <div key={victim.username} style={{ position: 'relative', width: 150, height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={victim.pfp}
              width={150}
              height={150}
              style={{ borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff' }}
            />
            {/* Red X overlay */}
            <svg width={150} height={150} style={{ position: 'absolute', top: 0, left: 0 }}>
              <line x1={20} y1={20} x2={130} y2={130} stroke="#ef4444" strokeWidth={8} />
              <line x1={130} y1={20} x2={20} y2={130} stroke="#ef4444" strokeWidth={8} />
            </svg>
            <div style={{ color: '#fff', fontSize: 24, fontWeight: 600, marginTop: 8, textAlign: 'center', width: 150 }}>
              @{victim.username}
            </div>
          </div>
        ))}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
} 