import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box } from '@chakra-ui/react';

interface Vector2D {
  x: number;
  y: number;
}

interface Body {
  position: Vector2D;
  velocity: Vector2D;
  mass: number;
  radius: number;
  color: string;
}

interface DragState {
  isDragging: boolean;
  bodyIndex: number;
  startPos: Vector2D;
  currentPos: Vector2D;
}

const GravitySimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodiesRef = useRef<Body[]>([]);
  const [constants] = useState({
    G: 500,
    PI: Math.PI,
    dt: 0.016,
    pathSteps: 25,
    bodyRadius: 10,
    restitution: 0.8,
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    bodyIndex: -1,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
  });
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const { G, dt, pathSteps, bodyRadius, restitution } = constants;

  const getRandomColor = () => {
    const hues = [210, 180, 140, 270, 330];
    const hue = hues[Math.floor(Math.random() * hues.length)];
    return `hsla(${hue}, 70%, 70%, 0.7)`;
  };

  const updateDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      const initialBodies: Body[] = Array.from({ length: 4 }, (_) => ({
        position: {
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
        },
        velocity: {
          x: (Math.random() - 0.5) * 40,
          y: (Math.random() - 0.5) * 40,
        },
        mass: 500 + Math.random() * 500,
        radius: bodyRadius + Math.random() * 5,
        color: getRandomColor(),
      }));

      bodiesRef.current = initialBodies;
    }
  }, [dimensions, bodyRadius]);

  const isValidPosition = useCallback((pos: Vector2D): boolean => {
    return !bodiesRef.current.some((body) => {
      const dx = pos.x - body.position.x;
      const dy = pos.y - body.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < body.radius * 2;
    });
  }, []);

  const addBody = useCallback(
    (pos: Vector2D) => {
      if (isValidPosition(pos)) {
        const newBody: Body = {
          position: { ...pos },
          velocity: { x: 0, y: 0 },
          mass: 500 + Math.random() * 500,
          radius: bodyRadius + Math.random() * 5,
          color: getRandomColor(),
        };
        bodiesRef.current = [...bodiesRef.current, newBody];
      }
    },
    [isValidPosition, bodyRadius]
  );

  const wrapPosition = useCallback(
    (position: Vector2D): Vector2D => {
      return {
        x:
          ((position.x % dimensions.width) + dimensions.width) %
          dimensions.width,
        y:
          ((position.y % dimensions.height) + dimensions.height) %
          dimensions.height,
      };
    },
    [dimensions]
  );

  const calculateForce = useCallback(
    (body1: Body, body2: Body): Vector2D => {
      let minDistance = Infinity;
      let finalForce = { x: 0, y: 0 };

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const wrappedPos = {
            x: body2.position.x + dx * dimensions.width,
            y: body2.position.y + dy * dimensions.height,
          };

          const deltaX = wrappedPos.x - body1.position.x;
          const deltaY = wrappedPos.y - body1.position.y;
          const distanceSq = deltaX * deltaX + deltaY * deltaY;
          const distance = Math.sqrt(distanceSq);

          if (distance < minDistance && distance > 0.1) {
            minDistance = distance;
            const force = (G * body1.mass * body2.mass) / distanceSq;
            finalForce = {
              x: (force * deltaX) / distance,
              y: (force * deltaY) / distance,
            };
          }
        }
      }

      return finalForce;
    },
    [dimensions, G]
  );

  const resolveCollision = useCallback(
    (body1: Body, body2: Body): [Vector2D, Vector2D] => {
      const dx = body2.position.x - body1.position.x;
      const dy = body2.position.y - body1.position.y;
      const distanceSq = dx * dx + dy * dy;
      const distance = Math.sqrt(distanceSq);

      if (distance < body1.radius + body2.radius) {
        const nx = dx / distance;
        const ny = dy / distance;

        const rvx = body2.velocity.x - body1.velocity.x;
        const rvy = body2.velocity.y - body1.velocity.y;

        const velAlongNormal = rvx * nx + rvy * ny;

        if (velAlongNormal > 0) return [body1.velocity, body2.velocity];

        const j = -(1 + restitution) * velAlongNormal;
        const impulse = j / (1 / body1.mass + 1 / body2.mass);

        const v1x = body1.velocity.x - (impulse * nx) / body1.mass;
        const v1y = body1.velocity.y - (impulse * ny) / body1.mass;
        const v2x = body2.velocity.x + (impulse * nx) / body2.mass;
        const v2y = body2.velocity.y + (impulse * ny) / body2.mass;

        const overlap = body1.radius + body2.radius - distance;
        const separationX = (overlap * nx) / 2;
        const separationY = (overlap * ny) / 2;

        body1.position.x -= separationX;
        body1.position.y -= separationY;
        body2.position.x += separationX;
        body2.position.y += separationY;

        return [
          { x: v1x, y: v1y },
          { x: v2x, y: v2y },
        ];
      }

      return [body1.velocity, body2.velocity];
    },
    [restitution]
  );

  const updatePhysics = useCallback(
    (bodies: Body[]): Body[] => {
      const bodiesLength = bodies.length;

      for (let i = 0; i < bodiesLength; i++) {
        const body = bodies[i];
        const totalForce = { x: 0, y: 0 };

        for (let j = 0; j < bodiesLength; j++) {
          if (i !== j) {
            const force = calculateForce(body, bodies[j]);
            totalForce.x += force.x;
            totalForce.y += force.y;
          }
        }

        const acceleration = {
          x: totalForce.x / body.mass,
          y: totalForce.y / body.mass,
        };

        body.velocity.x += acceleration.x * dt;
        body.velocity.y += acceleration.y * dt;

        body.position.x += body.velocity.x * dt;
        body.position.y += body.velocity.y * dt;

        const wrapped = wrapPosition(body.position);
        body.position.x = wrapped.x;
        body.position.y = wrapped.y;
      }

      for (let i = 0; i < bodiesLength; i++) {
        for (let j = i + 1; j < bodiesLength; j++) {
          const [v1, v2] = resolveCollision(bodies[i], bodies[j]);
          bodies[i].velocity = v1;
          bodies[j].velocity = v2;
        }
      }

      return bodies;
    },
    [calculateForce, dt, resolveCollision, wrapPosition]
  );

  const predictPath = useCallback(
    (
      bodies: Body[],
      draggedIndex: number,
      newVelocity: Vector2D
    ): Vector2D[] => {
      const predictedBodies = bodies.map((body) => ({
        ...body,
        position: { ...body.position },
        velocity: { ...body.velocity },
      }));

      predictedBodies[draggedIndex].velocity = { ...newVelocity };

      const path: Vector2D[] = [];
      for (let i = 0; i < pathSteps; i++) {
        updatePhysics(predictedBodies);
        path.push({
          x: predictedBodies[draggedIndex].position.x,
          y: predictedBodies[draggedIndex].position.y,
        });
      }
      return path;
    },
    [pathSteps, updatePhysics]
  );

  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const bodies = bodiesRef.current;
    const bodiesLength = bodies.length;

    ctx.strokeStyle = 'rgba(100, 150, 230, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i < bodiesLength; i++) {
      const body1 = bodies[i];
      for (let j = i + 1; j < bodiesLength; j++) {
        const body2 = bodies[j];
        ctx.beginPath();
        ctx.moveTo(body1.position.x, body1.position.y);
        ctx.lineTo(body2.position.x, body2.position.y);
        ctx.stroke();
      }
    }

    for (let i = 0; i < bodiesLength; i++) {
      const body = bodies[i];

      ctx.fillStyle = body.color;
      ctx.beginPath();
      ctx.arc(
        body.position.x,
        body.position.y,
        body.radius,
        0,
        constants.PI * 2
      );
      ctx.fill();

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;

          const wrappedX = body.position.x + dx * dimensions.width;
          const wrappedY = body.position.y + dy * dimensions.height;

          if (
            wrappedX + body.radius > 0 &&
            wrappedX - body.radius < dimensions.width &&
            wrappedY + body.radius > 0 &&
            wrappedY - body.radius < dimensions.height
          ) {
            ctx.beginPath();
            ctx.arc(wrappedX, wrappedY, body.radius, 0, constants.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    if (dragState.isDragging) {
      ctx.beginPath();
      ctx.moveTo(dragState.startPos.x, dragState.startPos.y);
      ctx.lineTo(dragState.currentPos.x, dragState.currentPos.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const dx = dragState.startPos.x - dragState.currentPos.x;
      const dy = dragState.startPos.y - dragState.currentPos.y;
      const newVelocity = {
        x: dx * 2,
        y: dy * 2,
      };

      const predictedPath = predictPath(
        bodies,
        dragState.bodyIndex,
        newVelocity
      );

      ctx.beginPath();
      ctx.moveTo(predictedPath[0].x, predictedPath[0].y);

      for (let i = 1; i < predictedPath.length; i++) {
        const point = predictedPath[i];
        const prevPoint = predictedPath[i - 1];

        if (
          Math.abs(point.x - prevPoint.x) < dimensions.width / 2 &&
          Math.abs(point.y - prevPoint.y) < dimensions.height / 2
        ) {
          ctx.lineTo(point.x, point.y);
        } else {
          ctx.moveTo(point.x, point.y);
        }
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [constants.PI, dimensions, dragState, predictPath]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width || !dimensions.height) return;

    ctxRef.current = canvas.getContext('2d');
    if (!ctxRef.current) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;

      if (deltaTime >= 16 && !dragState.isDragging) {
        bodiesRef.current = updatePhysics(bodiesRef.current);
        lastTimeRef.current = timestamp;
      }

      draw();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, dragState, draw, updatePhysics]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getMousePosition = (e: MouseEvent) => {
      return {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleClick = (e: MouseEvent) => {
      if (!dragState.isDragging) {
        const pos = getMousePosition(e);
        addBody(pos);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const mousePos = getMousePosition(e);
      const bodies = bodiesRef.current;

      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const dx = mousePos.x - body.position.x;
        const dy = mousePos.y - body.position.y;
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq < body.radius * body.radius) {
          setDragState({
            isDragging: true,
            bodyIndex: i,
            startPos: { ...body.position },
            currentPos: mousePos,
          });
          break;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.isDragging) {
        setDragState((prev) => ({
          ...prev,
          currentPos: getMousePosition(e),
        }));
      }
    };

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        const dx = dragState.startPos.x - dragState.currentPos.x;
        const dy = dragState.startPos.y - dragState.currentPos.y;

        const bodies = bodiesRef.current;
        bodies[dragState.bodyIndex].velocity = {
          x: dx * 2,
          y: dy * 2,
        };

        setDragState({
          isDragging: false,
          bodyIndex: -1,
          startPos: { x: 0, y: 0 },
          currentPos: { x: 0, y: 0 },
        });
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [addBody, dragState]);

  return (
    <Box
      width="100vw"
      height="100vh"
      position="fixed"
      top={0}
      left={0}
      zIndex={-1000}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </Box>
  );
};

export default GravitySimulation;
