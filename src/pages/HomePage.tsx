import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';

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

interface ConstantsInputGroupProps {
  constants: Record<string, number>;
  setConstants: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const ConstantsInputGroup = ({
  constants,
  setConstants,
}: ConstantsInputGroupProps) => {
  const sliderConfig = [
    {
      label: 'Gravitational Constant (G)',
      name: 'G',
      min: 0,
      max: 20000,
      step: 100,
    },
    {
      label: 'Coefficient of Restitution',
      name: 'restitution',
      min: 0,
      max: 1,
      step: 0.1,
    },
    {
      label: 'Body Radius',
      name: 'bodyRadius',
      min: 5,
      max: 30,
      step: 1,
    },
    {
      label: 'Time Step (dt)',
      name: 'dt',
      min: 0.001,
      max: 0.1,
      step: 0.001,
    },
    {
      label: 'Value of Pi (π)',
      name: 'PI',
      min: 0,
      max: 10,
      step: 0.01,
    },
    {
      label: 'Prediction Steps',
      name: 'pathSteps',
      min: 10,
      max: 200,
      step: 10,
    },
  ];

  return (
    <Card
      bg="gray.900"
      w="320px"
      position="absolute"
      bottom="400"
      right="4"
      zIndex="40"
    >
      <CardHeader pb={2}>
        <Heading size="md" color="white">
          Constants
        </Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {sliderConfig.map((config) => (
            <Box key={config.name}>
              <Flex justify="space-between" mb={2}>
                <Text color="white" fontSize="sm">
                  {config.label}
                </Text>
                <Text color="whiteAlpha.800" fontSize="sm">
                  {constants[config.name]}
                </Text>
              </Flex>
              <Slider
                min={config.min}
                max={config.max}
                step={config.step}
                value={constants[config.name]}
                onChange={(value) =>
                  setConstants((prev) => ({ ...prev, [config.name]: value }))
                }
                name={config.name}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

const HomePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [constants, setConstants] = useState<Record<string, number>>({
    G: 1000,
    PI: Math.PI,
    dt: 0.016,
    pathSteps: 100,
    bodyRadius: 15,
    restitution: 0.8,
  });
  const [bodies, setBodies] = useState<Body[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    bodyIndex: -1,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
  });
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const G = constants.G;
  const dt = constants.dt;
  const pathSteps = constants.pathSteps;
  const bodyRadius = constants.bodyRadius;
  const restitution = constants.restitution;

  const getRandomColor = () => {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      const initialBodies: Body[] = [
        {
          position: { x: dimensions.width * 0.3, y: dimensions.height * 0.5 },
          velocity: { x: 0, y: -50 },
          mass: 1000,
          radius: bodyRadius,
          color: '#FF6B6B',
        },
        {
          position: { x: dimensions.width * 0.7, y: dimensions.height * 0.5 },
          velocity: { x: 0, y: 50 },
          mass: 1000,
          radius: bodyRadius,
          color: '#4ECDC4',
        },
        {
          position: { x: dimensions.width * 0.5, y: dimensions.height * 0.7 },
          velocity: { x: 50, y: 0 },
          mass: 1000,
          radius: bodyRadius,
          color: '#FFE66D',
        },
      ];
      setBodies(initialBodies);
    }
  }, [dimensions]);

  const isValidPosition = (pos: Vector2D): boolean => {
    return !bodies.some((body) => {
      const dx = pos.x - body.position.x;
      const dy = pos.y - body.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < body.radius * 2;
    });
  };

  const addBody = (pos: Vector2D) => {
    if (isValidPosition(pos)) {
      const newBody: Body = {
        position: { ...pos },
        velocity: { x: 0, y: 0 },
        mass: 1000,
        radius: bodyRadius,
        color: getRandomColor(),
      };
      setBodies((prev) => [...prev, newBody]);
    }
  };

  const wrapPosition = (position: Vector2D): Vector2D => {
    return {
      x:
        ((position.x % dimensions.width) + dimensions.width) % dimensions.width,
      y:
        ((position.y % dimensions.height) + dimensions.height) %
        dimensions.height,
    };
  };

  const calculateForce = (body1: Body, body2: Body): Vector2D => {
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
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < minDistance && distance > 0.1) {
          minDistance = distance;
          const force = (G * body1.mass * body2.mass) / (distance * distance);
          finalForce = {
            x: (force * deltaX) / distance,
            y: (force * deltaY) / distance,
          };
        }
      }
    }

    return finalForce;
  };

  const resolveCollision = (body1: Body, body2: Body): [Vector2D, Vector2D] => {
    const dx = body2.position.x - body1.position.x;
    const dy = body2.position.y - body1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

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
  };

  const updatePhysics = (bodies: Body[]): Body[] => {
    const updatedBodies = bodies.map((body, i) => {
      const totalForce = { x: 0, y: 0 };

      bodies.forEach((otherBody, j) => {
        if (i !== j) {
          const force = calculateForce(body, otherBody);
          totalForce.x += force.x;
          totalForce.y += force.y;
        }
      });

      const acceleration = {
        x: totalForce.x / body.mass,
        y: totalForce.y / body.mass,
      };

      const newVelocity = {
        x: body.velocity.x + acceleration.x * dt,
        y: body.velocity.y + acceleration.y * dt,
      };

      const newPosition = {
        x: body.position.x + newVelocity.x * dt,
        y: body.position.y + newVelocity.y * dt,
      };

      return {
        ...body,
        velocity: newVelocity,
        position: wrapPosition(newPosition),
      };
    });

    for (let i = 0; i < updatedBodies.length; i++) {
      for (let j = i + 1; j < updatedBodies.length; j++) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const wrappedPos = {
              x: updatedBodies[j].position.x + dx * dimensions.width,
              y: updatedBodies[j].position.y + dy * dimensions.height,
            };

            const tempBody2 = {
              ...updatedBodies[j],
              position: wrappedPos,
            };

            const [v1, v2] = resolveCollision(updatedBodies[i], tempBody2);
            updatedBodies[i].velocity = v1;
            updatedBodies[j].velocity = v2;
          }
        }
      }
    }

    return updatedBodies;
  };

  const predictPath = (
    bodies: Body[],
    draggedIndex: number,
    newVelocity: Vector2D
  ): Vector2D[] => {
    let predictedBodies = bodies.map((body) => ({ ...body }));
    predictedBodies[draggedIndex].velocity = newVelocity;

    const path: Vector2D[] = [];
    for (let i = 0; i < pathSteps; i++) {
      predictedBodies = updatePhysics(predictedBodies);
      path.push({ ...predictedBodies[draggedIndex].position });
    }
    return path;
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    bodies.forEach((body) => {
      ctx.beginPath();
      ctx.arc(
        body.position.x,
        body.position.y,
        body.radius,
        0,
        constants.PI * 2
      );
      ctx.fillStyle = body.color;
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
            ctx.fillStyle = body.color;
            ctx.fill();
          }
        }
      }
    });

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
      predictedPath.forEach((point, i) => {
        if (i > 0) {
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
      });
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width || !dimensions.height) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;

      if (deltaTime >= 16 && !dragState.isDragging) {
        setBodies((prevBodies) => updatePhysics(prevBodies));
        lastTimeRef.current = timestamp;
      }

      draw(ctx);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [bodies, dragState, dimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent) => {
      if (!dragState.isDragging) {
        const rect = canvas.getBoundingClientRect();
        const pos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        addBody(pos);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      bodies.forEach((body, index) => {
        const dx = mousePos.x - body.position.x;
        const dy = mousePos.y - body.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < body.radius) {
          setDragState({
            isDragging: true,
            bodyIndex: index,
            startPos: { ...body.position },
            currentPos: mousePos,
          });
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.isDragging) {
        const rect = canvas.getBoundingClientRect();
        setDragState((prev) => ({
          ...prev,
          currentPos: {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          },
        }));
      }
    };

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        const dx = dragState.startPos.x - dragState.currentPos.x;
        const dy = dragState.startPos.y - dragState.currentPos.y;

        setBodies((prevBodies) => {
          const newBodies = [...prevBodies];
          newBodies[dragState.bodyIndex] = {
            ...newBodies[dragState.bodyIndex],
            velocity: {
              x: dx * 2,
              y: dy * 2,
            },
          };
          return newBodies;
        });

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
  }, [bodies, dragState]);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <a href="/" className="absolute top-4 left-4 z-40 text-white"></a>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute top-0 left-0 w-full h-full z-50"
      />
      <div className="relative z-40 p-4">
        <div className="text-white/70 text-sm">
          Click anywhere to add bodies - Drag bodies to slingshot them - Watch
          them collide!
        </div>
      </div>
      <ConstantsInputGroup constants={constants} setConstants={setConstants} />
    </div>
  );
};

export default HomePage;
