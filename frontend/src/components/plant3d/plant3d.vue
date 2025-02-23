<script lang="ts" setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { onMounted, ref } from 'vue' // Importiere Vue-spezifische Funktionen

// Typisierung für das HTML-Element des Containers
const threeContainer = ref<HTMLElement | null>(null) // Ref für das DOM-Element, wo das 3D-Modell gerendert wird

onMounted(() => {
  const container = threeContainer.value
  if (!container) return // Sicherstellen, dass der Container vorhanden ist

  // Szene erstellen
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  // Kamera erstellen
  const camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000,
  )
  camera.position.set(0, 5, 0) // Kamera Position

  // Renderer erstellen
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  container.appendChild(renderer.domElement)

  // Licht hinzufügen
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))

  // OrbitControls (Zoom und Pan deaktivieren, nur horizontale Drehung erlauben)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = false // Zoom deaktivieren
  controls.enablePan = false // Panoramabewegung deaktivieren
  controls.minPolarAngle = Math.PI / 2 // Vertikale Drehung verhindern (nach oben)
  controls.maxPolarAngle = Math.PI / 2 // Vertikale Drehung verhindern (nach unten)

  // Modell laden
  const loader = new GLTFLoader()
  loader.load('/models3d/plant.glb', (gltf) => {
    scene.add(gltf.scene)

    // Zielpunkt explizit setzen
    const targetPosition = new THREE.Vector3(0, 4, 0) // Beispielzielpunkt: (0, 4, 0)
    controls.target.copy(targetPosition) // Setzt das Ziel explizit
    controls.update() // Steuerung aktualisieren
  })

  // Rendering-Schleife
  const animate = () => {
    requestAnimationFrame(animate)
    controls.update() // Steuerung aktualisieren
    renderer.render(scene, camera)
  }
  animate()

  // Fenstergröße ändern
  window.addEventListener('resize', () => {
    if (container) {
      camera.aspect = container.offsetWidth / container.offsetHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.offsetWidth, container.offsetHeight)
    }
  })
})
</script>

<template>
  <div id="three-container" ref="threeContainer"></div>
</template>

<style scoped>
#three-container {
  width: 100%;
  height: 400px;
  background-color: #000;
}
</style>
