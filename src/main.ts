import './styles.css'
import { appConfig } from './config'

type StatusTone = 'loading' | 'ready' | 'found' | 'lost' | 'error'

type ArElements = {
  status: HTMLElement
  statusDetail: HTMLElement
  cta: HTMLAnchorElement
  scene: HTMLElement
  target: HTMLElement
  model: HTMLElement
  assets: HTMLElement
}

type ArState = {
  hasModelLoaded: boolean
  hasTarget: boolean
  isArReady: boolean
  hasFatalError: boolean
}

const appRoot = document.querySelector<HTMLDivElement>('#app')

const createSceneMarkup = () => `
  <div class="app-shell">
    <section class="status-panel" aria-live="polite">
      <p class="eyebrow">Poster AR</p>
      <h1 id="status-title">Loading AR experience</h1>
      <p id="status-detail">Allow camera access, then point your phone at the poster.</p>
    </section>

    <a
      id="cta-link"
      class="cta-link"
      href="${appConfig.ctaUrl ?? '#'}"
      aria-disabled="${appConfig.ctaUrl ? 'false' : 'true'}"
    >
      ${appConfig.ctaLabel}
    </a>

    <a-scene
      id="ar-scene"
      class="ar-scene"
      mindar-image="imageTargetSrc: ${appConfig.targetSrc}; uiScanning: yes; uiLoading: no; uiError: no"
      color-space="sRGB"
      renderer="colorManagement: true"
      vr-mode-ui="enabled: false"
      device-orientation-permission-ui="enabled: false"
      loading-screen="enabled: false"
      embedded
    >
      <a-assets id="ar-assets" timeout="15000">
        <a-asset-item id="characterModel" src="${appConfig.modelSrc}"></a-asset-item>
      </a-assets>

      <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

      <a-entity id="poster-target" mindar-image-target="targetIndex: 0">
        <a-entity
          id="character-model"
          gltf-model="#characterModel"
          animation-mixer="clip: *; loop: repeat"
          position="0 -0.15 0"
          rotation="0 0 0"
          scale="0.45 0.45 0.45"
          visible="false"
        ></a-entity>
      </a-entity>
    </a-scene>
  </div>
`

const setStatus = (
  elements: Pick<ArElements, 'status' | 'statusDetail'>,
  title: string,
  detail: string,
  tone: StatusTone
) => {
  elements.status.dataset.tone = tone
  elements.status.querySelector('h1')?.replaceChildren(title)
  elements.statusDetail.textContent = detail
}

const setModelVisibility = (elements: Pick<ArElements, 'model'>, isVisible: boolean) => {
  elements.model.setAttribute('visible', String(isVisible))
}

const updateReadyStatus = (elements: ArElements, state: ArState) => {
  if (state.hasFatalError) return

  if (appConfig.configError) {
    elements.cta.classList.add('is-disabled')
    elements.cta.removeAttribute('href')
    elements.cta.setAttribute('aria-disabled', 'true')
  }

  if (!state.isArReady) {
    setStatus(
      elements,
      'Preparing camera',
      'The 3D model is preloading while the AR camera starts.',
      'loading'
    )
    return
  }

  if (!state.hasModelLoaded) {
    setStatus(
      elements,
      'Loading 3D model',
      'The camera is ready. Waiting for the model to finish loading.',
      'loading'
    )
    return
  }

  if (state.hasTarget) {
    setStatus(elements, 'Poster detected', 'The animation is playing on the poster.', 'found')
    return
  }

  setStatus(elements, 'Scan the poster', 'Keep the whole poster inside the camera view.', 'ready')
}

const getElements = (): ArElements => {
  const status = document.querySelector<HTMLElement>('.status-panel')
  const statusDetail = document.querySelector<HTMLElement>('#status-detail')
  const cta = document.querySelector<HTMLAnchorElement>('#cta-link')
  const scene = document.querySelector<HTMLElement>('#ar-scene')
  const target = document.querySelector<HTMLElement>('#poster-target')
  const model = document.querySelector<HTMLElement>('#character-model')
  const assets = document.querySelector<HTMLElement>('#ar-assets')

  if (!status || !statusDetail || !cta || !scene || !target || !model || !assets) {
    throw new Error('AR app markup failed to initialize')
  }

  return {
    status,
    statusDetail,
    cta,
    scene,
    target,
    model,
    assets
  }
}

const bindArEvents = (elements: ArElements) => {
  const state: ArState = {
    hasModelLoaded: false,
    hasTarget: false,
    isArReady: false,
    hasFatalError: false
  }

  elements.cta.addEventListener('click', event => {
    if (!appConfig.ctaUrl) {
      event.preventDefault()
      setStatus(
        elements,
        'Link is not configured',
        appConfig.configError ?? 'Set VITE_CTA_URL before publishing this experience.',
        'error'
      )
    }
  })

  elements.scene.addEventListener('arReady', () => {
    state.isArReady = true
    updateReadyStatus(elements, state)
  })

  elements.scene.addEventListener('arError', () => {
    state.hasFatalError = true
    setModelVisibility(elements, false)
    setStatus(
      elements,
      'Camera failed to start',
      'Check camera permissions and open the site over HTTPS on a mobile device.',
      'error'
    )
  })

  elements.assets.addEventListener('timeout', () => {
    state.hasFatalError = true
    setModelVisibility(elements, false)
    setStatus(
      elements,
      'Assets are taking too long',
      'Try a stronger connection or reduce the model size before publishing.',
      'error'
    )
  })

  elements.model.addEventListener('model-loaded', () => {
    state.hasModelLoaded = true
    setModelVisibility(elements, state.hasTarget)
    updateReadyStatus(elements, state)
  })

  elements.model.addEventListener('model-error', () => {
    state.hasFatalError = true
    setModelVisibility(elements, false)
    setStatus(
      elements,
      'Model failed to load',
      'Replace the model with a valid glTF 2.0 .glb file and rebuild.',
      'error'
    )
  })

  elements.target.addEventListener('targetFound', () => {
    state.hasTarget = true
    setModelVisibility(elements, state.hasModelLoaded)
    updateReadyStatus(elements, state)
  })

  elements.target.addEventListener('targetLost', () => {
    state.hasTarget = false
    setModelVisibility(elements, false)
    setStatus(elements, 'Poster lost', 'Point the camera back at the poster.', 'lost')
  })

  updateReadyStatus(elements, state)
}

const init = () => {
  if (!appRoot) {
    throw new Error('Missing #app root')
  }

  appRoot.innerHTML = createSceneMarkup()
  bindArEvents(getElements())
}

init()
