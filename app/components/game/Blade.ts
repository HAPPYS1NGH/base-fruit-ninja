// Blade/Slice effect
export class Blade {
  points: { x: number; y: number; time: number }[];
  active: boolean;

  constructor() {
    this.points = [];
    this.active = false;
  }

  addPoint(x: number, y: number) {
    this.points.push({ x, y, time: Date.now() });
    
    // Remove points older than 100ms to create a trail effect
    this.points = this.points.filter(point => Date.now() - point.time < 100);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    
    // Draw glow effect
    ctx.shadowColor = "#4fc3f7";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}
