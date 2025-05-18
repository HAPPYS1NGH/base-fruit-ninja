import React from 'react';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = searchParams.get('score') || '0';

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
      }} />
      
      {/* Diagonal stripes */}
      <div style={{
        position: 'absolute',
        width: '150%',
        height: '150%',
        top: '-25%',
        left: '-25%',
        background: 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 2px, transparent 2px, transparent 12px)',
      }} />

      {/* Game title */}
      <div style={{
        position: 'absolute',
        top: 40,
        color: '#fff',
        fontSize: 72,
        fontWeight: 800,
        textAlign: 'center',
        textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
        fontFamily: 'sans-serif',
        letterSpacing: '-0.03em',
      }}>
        🍉 FRUIT NINJA
      </div>

      {/* Score display */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        marginTop: -40,
      }}>
        <div style={{
          color: '#fbbf24',
          fontSize: 48,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          textShadow: '0 2px 10px rgba(251, 191, 36, 0.3)',
        }}>
          HIGH SCORE
        </div>
        <div style={{
          color: '#fff',
          fontSize: 120,
          fontWeight: 900,
          textShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(139, 92, 246, 0.5)',
          fontFamily: 'sans-serif',
        }}>
          {parseInt(score).toLocaleString()}
        </div>
      </div>

      {/* Call to action */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        backgroundColor: '#ef4444',
        color: '#fff',
        fontSize: 36,
        fontWeight: 700,
        padding: '16px 40px',
        borderRadius: 9999,
        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        ⚔️ Can You Beat This? ⚔️
      </div>

      {/* Decorative sword slashes */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.1) 55%, transparent 55%), linear-gradient(-45deg, transparent 45%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.1) 55%, transparent 55%)',
      }} />
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
} 