import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import GUI from "lil-gui"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import halftoneVertexShader from "./shaders/halftone/vertex.glsl"
import halftoneFragmentShader from "./shaders/halftone/fragment.glsl"

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

// Loaders
const gltfLoader = new GLTFLoader()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
}

// GUI
const config = {
  gridSize: 120.0,
  colour: "#ff794d",
  lightColour: "#e5ffe0",
  shadowColour: "#8e19b8",
  lightRepetitions: 130.0,
}

gui.addColor(config, "colour").onChange(() => {
  material.uniforms.uColor.value.set(config.colour)
})

gui
  .add(config, "gridSize")
  .min(1)
  .max(200.0)
  .step(1.0)
  .name("Shadow Repetitions")
  .onChange(() => {
    material.uniforms.uGridSize.value = config.gridSize
  })

gui.addColor(config, "shadowColour").onChange(() => {
  material.uniforms.uShadowColour.value.set(config.shadowColour)
})

gui
  .add(config, "lightRepetitions")
  .min(1)
  .max(200.0)
  .step(1.0)
  .name("Light Repetitions")
  .onChange(() => {
    material.uniforms.uLightRepetitions.value = config.lightRepetitions
  })

gui.addColor(config, "lightColour").onChange(() => {
  material.uniforms.uLightColour.value.set(config.lightColour)
})

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

  // Update materials
  material.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
  )

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.x = 7
camera.position.y = 7
camera.position.z = 7
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const rendererParameters = {}
rendererParameters.clearColor = "#26132f"

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setClearColor(rendererParameters.clearColor)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

gui.addColor(rendererParameters, "clearColor").onChange(() => {
  renderer.setClearColor(rendererParameters.clearColor)
})

/**
 * Material
 */

const material = new THREE.ShaderMaterial({
  vertexShader: halftoneVertexShader,
  fragmentShader: halftoneFragmentShader,
  uniforms: {
    uColor: new THREE.Uniform(new THREE.Color(config.colour)),
    uLightColour: new THREE.Uniform(new THREE.Color(config.lightColour)),
    uGridSize: new THREE.Uniform(config.gridSize),
    uShadowColour: new THREE.Uniform(new THREE.Color(config.shadowColour)),
    uLightRepetitions: new THREE.Uniform(config.lightRepetitions),
    uResolution: {
      value: new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio
      ),
    },
  },
})

/**
 * Objects
 */
// Torus knot
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
  material
)
torusKnot.position.x = 3
scene.add(torusKnot)

// Sphere
const sphere = new THREE.Mesh(new THREE.SphereGeometry(), material)
sphere.position.x = -3
scene.add(sphere)

// Suzanne
let suzanne = null
// gltfLoader.load(
//     './suzanne.glb',
//     (gltf) =>
//     {
//         suzanne = gltf.scene
//         suzanne.traverse((child) =>
//         {
//             if(child.isMesh)
//                 child.material = material
//         })
//         scene.add(suzanne)
//     }
// )

let mxkLogo = null
gltfLoader.load("./mxk-logo.glb", (gltf) => {
  mxkLogo = gltf.scene

  mxkLogo.traverse((child) => {
    if (child.isMesh) child.material = material
  })

  mxkLogo.scale.set(0.35, 0.35, 0.35)
  scene.add(mxkLogo)
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Rotate objects
  if (suzanne) {
    suzanne.rotation.x = -elapsedTime * 0.1
    suzanne.rotation.y = elapsedTime * 0.2
  }

  if (mxkLogo) {
    mxkLogo.rotation.z = -elapsedTime * 0.1
    mxkLogo.rotation.x = elapsedTime * 0.01
  }

  sphere.rotation.x = -elapsedTime * 0.1
  sphere.rotation.y = elapsedTime * 0.2

  torusKnot.rotation.x = -elapsedTime * 0.1
  torusKnot.rotation.y = elapsedTime * 0.2

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
