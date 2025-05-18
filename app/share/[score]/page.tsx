import { Metadata } from 'next';

// Helper to build the OG image URL for the meta tag
function getOgImageUrl(score: string) {
  // You should implement a real OG image endpoint for production!
  // For now, just use the same share page with a special param
  return `${process.env.NEXT_PUBLIC_URL}/api/og/score?score=${score}}`;
}

// Server-side metadata for Farcaster frame embed
export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  const score = params.score;
  // const victims = searchParams?.victims || '[]';
  const imageUrl = getOgImageUrl(score);

  // See: https://miniapps.farcaster.xyz/docs/guides/sharing
  const frameMeta = {
    version: 'next',
    imageUrl,
    button: {
      title: '⚔️ Take Revenge',
      action: {
        type: 'launch_frame',
        url: `${process.env.NEXT_PUBLIC_URL}/`, // Launches the game
        name: 'Fruit Ninja',
      },
    },
  };

  return {
    title: 'Take Your Revenge in Fruit Ninja!',
    description: 'Can you beat your friend\'s score? Take revenge now!',
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
      <h1 className="text-2xl font-bold mb-4">Zora Collage Frame</h1>
       
      <p className="mt-4 text-gray-400">To see this frame, share it on Farcaster.</p>
    </main>
  );
}