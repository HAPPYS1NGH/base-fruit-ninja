import { Metadata } from 'next';

// Helper to build the OG image URL for the meta tag
function getOgImageUrl(score: string, pfp: string) {
  // You should implement a real OG image endpoint for production!
  // For now, just use the same share page with a special param
  return `${process.env.NEXT_PUBLIC_URL}/api/og?score=${score}&pfp=${pfp}`;
}

// Server-side metadata for Farcaster frame embed
export async function generateMetadata({ searchParams }: { searchParams: { score?: string, pfp?: string } }): Promise<Metadata> {
  const score = searchParams?.score || '100';
  const pfp = searchParams?.pfp || 'https://i.imgur.com/7ffGYrq.jpg';
  // const victims = searchParams?.victims || '[]';
  console.log('score', score);
  console.log('pfp', pfp);
  console.log('process.env.NEXT_PUBLIC_URL', process.env.NEXT_PUBLIC_URL);
  console.log('getOgImageUrl called');
  
  const imageUrl = getOgImageUrl(score, pfp);

  console.log('imageUrl', imageUrl);

  // See: https://miniapps.farcaster.xyz/docs/guides/sharing
  const frameMeta = {
    version: 'next',
    imageUrl,
    button: {
      title: '⚔️ Take Revenge',
      action: {
        type: 'launch_frame',
        url: `${process.env.NEXT_PUBLIC_URL}/`, // Launches the game
        name: 'Facebreaker',
      },
    },
  };

  return {
    title: 'Can You Break More Faces?',
    description: 'Challenge your friends in Facebreaker! How many faces can you break?',
    openGraph: {
      images: [imageUrl],
    },
    other: {
      'fc:frame': JSON.stringify(frameMeta),
    },
  };
}

export default function FramePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl   mb-4">Fruiit Ninja</h1>
       
      <p className="mt-4 text-gray-400">To see this frame, share it on Farcaster.</p>
    </main>
  );
}