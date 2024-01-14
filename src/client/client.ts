import {
  WebGLRenderer,
  OrthographicCamera,
  Scene,
  PlaneGeometry,
  ShaderMaterial,
  BufferGeometry,
  BufferAttribute,
  Points,
  Vector3,
  Color,
} from "three";

// Initialize Renderer
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize Camera
const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);

// Initialize Scene
const scene = new Scene();
// Set a background color different from the particle color
scene.background = new Color(0xffffff); // Example: white background

// Adjust the camera position if necessary
camera.position.z = 5; // Example: moving the camera back a bit

// Particle System Setup
const particleCount = 10000; // Adjust based on required density
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3); // RGB for each particle
// Add an age attribute to each particle
// Initialize ages to -1 indicating inactive particles
const ages = new Float32Array(particleCount).fill(-1);
const maxParticleSize = new Float32Array(particleCount).fill(0);

// Shader Material Setup
const shaderMaterial = new ShaderMaterial({
  vertexShader: `
    attribute vec3 customColor;
    attribute float age;
    varying vec3 vColor;
    varying float visibility; // Add this line
    void main() {
        if (age < 0.0) {
            visibility = 0.0; // Particle is not visible
        } else {
            visibility = 1.0; // Particle is visible
            vColor = customColor;
            float size = 5.0 + age * 2.0; // Size increases with age
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size;
            gl_Position = projectionMatrix * mvPosition;
        }
    }
    `,
  fragmentShader: `
varying vec3 vColor;
varying float visibility;
void main() {
    if (visibility == 0.0) discard;
    vec2 coord = gl_PointCoord - vec2(0.5, 0.5); // Coordinates from the center
    if (length(coord) > 0.5) discard; // Discard fragments outside the circle
    gl_FragColor = vec4(vColor, 1.0);
}
`,

  transparent: true,
});

// Create BufferGeometry and attach it to the Points
const particleGeometry = new BufferGeometry();
particleGeometry.setAttribute("position", new BufferAttribute(positions, 3));
particleGeometry.setAttribute("customColor", new BufferAttribute(colors, 3));
particleGeometry.setAttribute("age", new BufferAttribute(ages, 1));

const particleSystem = new Points(particleGeometry, shaderMaterial);
scene.add(particleSystem);

// Function to add a drop
interface KeyData {
  startTime: number;
  duration?: number; // Make duration optional
}

const keyPressDuration: Map<string, KeyData> = new Map();

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (!keyPressDuration.has(event.code)) {
    keyPressDuration.set(event.code, { startTime: performance.now() });
  }
});

window.addEventListener("keyup", (event: KeyboardEvent) => {
  const keyData = keyPressDuration.get(event.code);
  if (keyData) {
    const duration = performance.now() - keyData.startTime;
    keyPressDuration.delete(event.code); // Clear the record for this key
    addDrop(duration); // Add a drop with the duration
  }
});

function addDrop(duration: number): void {
  for (let i = 0; i < particleCount; i++) {
    if (ages[i] === -1) {
      const maxSizeForKey: number = Math.min(duration, 200); // Use duration, cap at 200
      maxParticleSize[i] = maxSizeForKey;

      // Find an inactive particle
      const x = (Math.random() - 0.5) * 2; // Random x position
      const y = (Math.random() - 0.5) * 2; // Random y position
      const color = new Color(Math.random(), Math.random(), Math.random());

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0; // Z position
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      ages[i] = 0; // Activate the particle
      break;
    }
  }
}

const maxSize = 200.0; // Define a maximum size

function updateDrops(): void {
  for (let i = 0; i < particleCount; i++) {
    if (ages[i] >= 0 && ages[i] < maxParticleSize[i]) {
      ages[i] += 1.5; // Increase age until it reaches maxSizeForKey // Increase age until it reaches maxSizeForKey
    }
  }

  particleGeometry.attributes.position.needsUpdate = true;
  particleGeometry.attributes.customColor.needsUpdate = true;
  particleGeometry.attributes.age.needsUpdate = true;
}

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (!keyPressDuration.has(event.code)) {
    keyPressDuration.set(event.code, { startTime: performance.now() });
  }
});

window.addEventListener("keyup", (event: KeyboardEvent) => {
  const keyData = keyPressDuration.get(event.code);
  if (keyData && keyData.startTime !== undefined) {
    const duration = performance.now() - keyData.startTime;
    keyPressDuration.delete(event.code); // Clear the record for this key
    addDrop(duration); // Add a drop with the duration
  }
});

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  updateDrops(); // Update the position and size of each drop
  renderer.render(scene, camera);
}

animate();
