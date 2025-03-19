<script lang="ts" setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { defineProps, onMounted, ref } from 'vue'
import { useColorMode } from '@vueuse/core'

// Definiere Props für den Modelltyp, beide optional
const props = defineProps({
  modelType: {
    type: Array as () => string[],
    required: false,
    default: () => [],
  },
  plantModelPath: { type: String, required: true }, // Pfad zum Pflanzenmodell
})

// Hole die Farbeinstellung des Modus
const mode = useColorMode()

// Ref für das DOM-Element, in dem die Szene gerendert wird
const threeContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  const container = threeContainer.value
  if (!container) return

  // Szene erstellen
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(mode.value === 'dark' ? 0x000000 : 0xffffff)

  // Kamera erstellen
  const camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000,
  )
  camera.position.set(0, 5, 3) // Stelle die Kamera so, dass sie alle Objekte sehen kann

  // Renderer erstellen
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  container.appendChild(renderer.domElement)

  // Licht hinzufügen
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))

  // OrbitControls (Zoom und Pan deaktivieren, nur horizontale Drehung erlauben)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = false
  controls.enablePan = false
  controls.minPolarAngle = Math.PI / 2
  controls.maxPolarAngle = Math.PI / 2

  // Modell der Pflanze laden (immer geladen)
  const loader = new GLTFLoader()
  loader.load(props.plantModelPath, (gltf) => {
    // Position der Pflanze festlegen
    const plant = gltf.scene
    plant.position.set(0, 0, 0) // Pflanze in der Mitte platzieren
    scene.add(plant)

    // Zielpunkt explizit setzen, damit die Kamera auf die Pflanze schaut
    const targetPosition = new THREE.Vector3(0, 4, 0) // Zielpunkt auf der Pflanze
    controls.target.copy(targetPosition)
    controls.update()
  })

  // Modell basierend auf `modelType` laden
  const loadAdditionalModel = (modelType: string, modelPath: string, position: THREE.Vector3) => {
    loader.load(modelPath, (gltf) => {
      const model = gltf.scene
      model.position.set(position.x, position.y, position.z) // Setzt die Position des Modells
      scene.add(model)

      // Zielpunkt explizit setzen, damit die Kamera auch auf die Sonne oder Wolke schaut
      //controls.target.copy(position)
      controls.update()
    })
  }

  // Lade Modelle, falls sie in `modelType` übergeben wurden
  if (props.modelType.includes('sun')) {
    loadAdditionalModel('sun', '/models3d/cloud.glb', new THREE.Vector3(0, 6, 0)) // Sonne 10 Einheiten nach oben
  }

  if (props.modelType.includes('cloud')) {
    loadAdditionalModel('cloud', '/models3d/cloud.glb', new THREE.Vector3(0, 1, 0)) // Wolke 5 Einheiten nach oben und 5 Einheiten nach hinten
  }

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
