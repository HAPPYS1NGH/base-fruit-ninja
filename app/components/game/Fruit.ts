// Game constants
export const GRAVITY = 0.2; // Reduced gravity from 0.3

// Import the followers function
import { getFollowersByAffinity } from '@/app/actions/followers';

// Fruit types
export const FRUITS: { name: string; color: string; points: number; radius: number; image: string; fid: number }[] = [
];

// Function to initialize fruits with follower images
export async function initializeFruitsWithFollowers(fid: number) {
  try {
    const followers = await getFollowersByAffinity(fid);
    // Update FRUITS array with follower data
    FRUITS.length = 0; // Clear existing fruits
    if (followers.length > 0) {
      // Ensure we have exactly 5 followers
      const selectedFollowers = followers.slice(0, 5);


      selectedFollowers.forEach((follower, index) => {
        FRUITS.push({
          name: follower.username,
          color: "#ff0000",
          points: 1,
          radius: 40,
          image: follower.pfp_url,
          fid: follower.fid
        });
      });

      // Preload all follower images
      FRUITS.forEach(fruit => {
        const img = new Image();
        img.src = fruit.image;
        fruit.image = img.src; // Store the loaded image URL
      });
    }
  } catch (error) {
    console.error('Error initializing fruits with followers:', error);
    // Fallback to default fruit if there's an error
    FRUITS.push({ name: "jesee", color: "#ff0000", points: 1, radius: 40, image: "/jesee.jpg", fid: 99 });
  }
}


// Fruit class
export class Fruit {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  points: number;
  name: string;
  sliced: boolean;
  sliceTime: number;
  sliceParts: { x: number; y: number; vx: number; vy: number; rot: number }[];
  image: HTMLImageElement;

  constructor(canvasWidth: number, type: typeof FRUITS[0]) {
    // Position fruit at the bottom of the screen
    this.x = Math.random() * (canvasWidth - 100) + 50;
    this.y = window.innerHeight + 50; // Start slightly below screen
    this.radius = type.radius;
    this.color = type.color;

    // Create and load the image
    this.image = new Image();
    this.image.src = type.image;

    // Adjust velocity for balanced arc
    const minSpeed = 15;
    const maxSpeed = 18;

    // 10% chance for a high throw
    const isHighThrow = Math.random() < 0.1;
    const speed = isHighThrow
      ? maxSpeed // Slightly reduced boost for high throws
      : Math.random() * (maxSpeed - minSpeed) + minSpeed;

    // Steeper angle for high throws
    const angleSpread = isHighThrow ? 0.15 : 0.52; // Narrower angle for high throws
    const angle = Math.PI / 2 + (Math.random() * angleSpread - angleSpread / 2);

    // Calculate velocities
    this.velocityX = speed * Math.cos(angle) * (Math.random() < 0.5 ? -1 : 1);
    this.velocityY = -speed * Math.sin(angle); // Negative for upward motion

    this.rotation = 0;
    this.rotationSpeed = Math.random() * 0.05 - 0.025;
    this.points = type.points;
    this.name = type.name;
    this.sliced = false;
    this.sliceTime = 0;
    this.sliceParts = [];
  }

  update() {
    if (this.sliced) {
      // Update slice parts with reduced gravity for sliced parts
      for (let i = 0; i < this.sliceParts.length; i++) {
        const part = this.sliceParts[i];
        part.vy += GRAVITY * 1.5; // Reduced from 2x to 1.5x for sliced parts
        part.x += part.vx;
        part.y += part.vy;
        part.rot += 0.05;
      }
      return;
    }

    // Further reduced gravity effect for even smoother arcs
    this.velocityY += GRAVITY * 0.85; // Reduced from 0.95
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.rotation += this.rotationSpeed;
  }

  slice() {
    if (this.sliced) return;

    this.sliced = true;
    this.sliceTime = Date.now();

    // Create two sliced parts
    this.sliceParts = [
      {
        x: this.x,
        y: this.y,
        vx: this.velocityX - 1,
        vy: this.velocityY,
        rot: this.rotation
      },
      {
        x: this.x,
        y: this.y,
        vx: this.velocityX + 1,
        vy: this.velocityY,
        rot: this.rotation
      }
    ];
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.sliced) {
      // Draw sliced parts
      for (let i = 0; i < this.sliceParts.length; i++) {
        const part = this.sliceParts[i];
        ctx.save();
        ctx.translate(part.x, part.y);
        ctx.rotate(part.rot);

        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.clip();

        // Draw half of the image for each slice part
        const size = this.radius * 2;
        if (i === 0) {
          ctx.drawImage(this.image,
            0, 0, this.image.width, this.image.height / 2, // Source: top half
            -this.radius, -this.radius, size, size // Destination
          );
        } else {
          ctx.drawImage(this.image,
            0, this.image.height / 2, this.image.width, this.image.height / 2, // Source: bottom half
            -this.radius, -this.radius, size, size // Destination
          );
        }

        ctx.restore();
      }
      return;
    }

    // Draw whole fruit
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.clip();

    const size = this.radius * 2;
    ctx.drawImage(this.image,
      -this.radius, -this.radius, // Position
      size, size // Size
    );

    ctx.restore();
  }
}
