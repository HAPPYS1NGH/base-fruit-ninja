// Game constants
export const GRAVITY = 0.18; // Increased from 0.12
export const BASE_FRAME_RATE = 1000 / 100; // 60 FPS as base

// Import the followers function
import { getFollowersByAffinity } from '@/app/actions/followers';

// Fruit types
export const FRUITS: { name: string; color: string; points: number; radius: number; image: string; fid: number }[] = [
];

// Function to initialize fruits with follower images
export async function initializeFruitsWithFollowers(fid: number) {
  try {
    const followersByAffinity = await getFollowersByAffinity(fid);
    const followers = followersByAffinity.sort(() => Math.random() - 0.5).slice(0, 10);
    // Update FRUITS array with follower data
    FRUITS.length = 0; // Clear existing fruits
    if (followers.length > 0) {
      // Ensure we have exactly 5 followers
      const selectedFollowers = followers.slice(0, 10);


      selectedFollowers.forEach((follower) => {
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
  sliceParts: { x: number; y: number; vx: number; vy: number; rot: number; sliceAngle: number }[];
  image: HTMLImageElement;

  constructor(canvasWidth: number, type: typeof FRUITS[0]) {
    // Position fruit at the bottom of the screen
    this.x = Math.random() * (canvasWidth - 100) + 50;
    this.y = window.innerHeight + 100; // Start further below screen
    this.radius = type.radius;
    this.color = type.color;

    // Create and load the image
    this.image = new Image();
    this.image.src = type.image;

    // Adjust velocity for more controlled arc
    const minSpeed = 14; // Increased from 10
    const maxSpeed = 17; // Increased from 14

    // 10% chance for a high throw
    const isHighThrow = Math.random() < 0.1;
    const speed = isHighThrow
      ? maxSpeed
      : Math.random() * (maxSpeed - minSpeed) + minSpeed;

    // Wider angle for more horizontal movement
    const angleSpread = isHighThrow ? 0.1 : 0.3;
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

  update(deltaTime: number = BASE_FRAME_RATE) {
    const timeScale = deltaTime / BASE_FRAME_RATE;

    if (this.sliced) {
      // Update slice parts with reduced gravity for sliced parts
      for (let i = 0; i < this.sliceParts.length; i++) {
        const part = this.sliceParts[i];
        part.vy += GRAVITY * 1.5 * timeScale;
        part.x += part.vx * timeScale;
        part.y += part.vy * timeScale;
        part.rot += 0.05 * timeScale;
      }
      return;
    }

    // Further reduced gravity effect for even smoother arcs
    this.velocityY += GRAVITY * 0.85 * timeScale;
    this.x += this.velocityX * timeScale;
    this.y += this.velocityY * timeScale;
    this.rotation += this.rotationSpeed * timeScale;
  }

  slice() {
    if (this.sliced) return;

    this.sliced = true;
    this.sliceTime = Date.now();

    // Calculate slice angle based on velocity
    const sliceAngle = Math.atan2(this.velocityY, this.velocityX);

    // Create two sliced parts with proper tangent separation
    this.sliceParts = [
      {
        x: this.x,
        y: this.y,
        vx: this.velocityX - Math.cos(sliceAngle) * 2,
        vy: this.velocityY - Math.sin(sliceAngle) * 2,
        rot: this.rotation,
        sliceAngle: sliceAngle
      },
      {
        x: this.x,
        y: this.y,
        vx: this.velocityX + Math.cos(sliceAngle) * 2,
        vy: this.velocityY + Math.sin(sliceAngle) * 2,
        rot: this.rotation,
        sliceAngle: sliceAngle
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

        // Create clipping path for the sliced part
        ctx.beginPath();

        // Calculate the slice angle
        const sliceAngle = part.sliceAngle;

        // Draw the partial circle
        if (i === 0) {
          // First half: from slice angle to slice angle + 180 degrees
          ctx.arc(0, 0, this.radius, sliceAngle, sliceAngle + Math.PI);
        } else {
          // Second half: from slice angle + 180 degrees to slice angle + 360 degrees
          ctx.arc(0, 0, this.radius, sliceAngle + Math.PI, sliceAngle + Math.PI * 2);
        }

        // Add the slice line
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.clip();

        // Draw the image
        const size = this.radius * 2;
        ctx.drawImage(
          this.image,
          -this.radius, -this.radius,
          size, size
        );

        ctx.restore();
      }
      return;
    }

    // Draw whole fruit
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Draw white border first
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.clip();

    const size = this.radius * 2;
    ctx.drawImage(
      this.image,
      -this.radius, -this.radius,
      size, size
    );

    ctx.restore();
  }
}
