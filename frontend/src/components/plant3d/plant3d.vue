<script lang="ts" setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { defineProps, onMounted, ref, watch } from 'vue'
import { useColorMode } from '@vueuse/core'

const props = defineProps({
  modelType: {
    type: Array as () => string[],
    required: false,
    default: () => [],
  },
  plantModelPath: { type: String, required: true },
})

const mode = useColorMode()
const threeContainer = ref<HTMLElement | null>(null)

// Deklaration von Variablen, damit sie auch im Watcher zugänglich sind
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
const loader = new GLTFLoader()
// Variable für das aktuell geladene Pflanzenmodell
let currentPlantModel: THREE.Object3D | null = null

/**
 * Skaliert und zentriert ein Modell anhand seiner BoundingBox.
 * @param model - Das zu skalierende Modell (THREE.Object3D)
 * @param desiredSize - Gewünschte maximale Dimension; hier standardmäßig auf 5 gesetzt
 * @returns Das skalierte Modell
 */
const scaleAndCenterModel = (model: THREE.Object3D, desiredSize = 5) => {
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDimension = Math.max(size.x, size.y, size.z)

  const scaleFactor = desiredSize / maxDimension
  model.scale.set(scaleFactor, scaleFactor, scaleFactor)

  // Nach Skalierung die Box und deren Mittelpunkt erneut berechnen
  const boxScaled = new THREE.Box3().setFromObject(model)
  const center = boxScaled.getCenter(new THREE.Vector3())
  model.position.sub(center)

  return model
}

/**
 * Lädt das Pflanzenmodell anhand eines Pfades.
 * Falls bereits ein Modell geladen wurde, wird dieses entfernt.
 * @param path - Pfad zur GLB-Datei
 */
const loadPlantModel = (path: string) => {
  loader.load(path, (gltf) => {
    // Entferne vorhandenes Modell, falls vorhanden
    if (currentPlantModel) {
      scene.remove(currentPlantModel)
    }
    currentPlantModel = gltf.scene
    scaleAndCenterModel(currentPlantModel, 5)
    // Setze das Modell an die gewünschte Position
    currentPlantModel.position.set(0, 0, 0)
    scene.add(currentPlantModel)

    // Setze das OrbitControls-Ziel (hier bspw. etwas oberhalb der Pflanze)
    const targetPosition = new THREE.Vector3(0, 4, 0)
    controls.target.copy(targetPosition)
    controls.update()
  })
}

onMounted(() => {
  const container = threeContainer.value
  if (!container) return

  // Szene erstellen
  scene = new THREE.Scene()
  scene.background = new THREE.Color(mode.value === 'dark' ? 0x000000 : 0xffffff)

  // Kamera erstellen
  camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
  )
  camera.position.set(0, 4.5, 0)

  // Renderer erstellen
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  container.appendChild(renderer.domElement)

  // Ambient Light hinzufügen
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))

  // OrbitControls erstellen (nur horizontale Drehung, Zoom und Pan deaktiviert)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = false
  controls.enablePan = false
  controls.minPolarAngle = Math.PI / 2
  controls.maxPolarAngle = Math.PI / 2

  // Initiales Laden des Pflanzenmodells
  loadPlantModel(props.plantModelPath)

  /**
   * Lädt ein zusätzliches Modell, skaliert und positioniert es.
   * @param modelType - Typ des Modells (z.B. 'sun' oder 'cloud')
   * @param modelPath - Pfad zur GLB-Datei
   * @param desiredPosition - Gewünschte Position im Raum
   * @param desiredSize - Gewünschte maximale Größe (standardmäßig auf 5 gesetzt)
   */
  const loadAdditionalModel = (
    modelType: string,
    modelPath: string,
    desiredPosition: THREE.Vector3,
    desiredSize = 5,
  ) => {
    loader.load(modelPath, (gltf) => {
      const model = gltf.scene
      scaleAndCenterModel(model, desiredSize)
      model.position.add(desiredPosition)
      scene.add(model)
      controls.update()
    })
  }

  // Zusätzliche Modelle basierend auf den modelType-Props laden
  if (props.modelType.includes('sun')) {
    loadAdditionalModel('sun', '/models3d/cloud.glb', new THREE.Vector3(0, 6, 0), 5)
  }
  if (props.modelType.includes('cloud')) {
    loadAdditionalModel('cloud', '/models3d/cloud.glb', new THREE.Vector3(0, 1, 0), 5)
  }

  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener('resize', () => {
    if (container) {
      camera.aspect = container.offsetWidth / container.offsetHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.offsetWidth, container.offsetHeight)
    }
  })
})

// Watcher: Bei einer Änderung im plantModelPath wird das Pflanzenmodell neu geladen
watch(
  () => props.plantModelPath,
  (newPath, oldPath) => {
    if (newPath !== oldPath) {
      loadPlantModel(newPath)
    }
  }
)
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
