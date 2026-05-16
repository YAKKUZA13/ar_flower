(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://example.com`,t=(t=>{let n=t?.trim()||e;try{let e=new URL(n);return[`http:`,`https:`].includes(e.protocol)?{ctaUrl:e.toString(),configError:null}:{ctaUrl:null,configError:`CTA URL must use http or https`}}catch{return{ctaUrl:null,configError:`Invalid VITE_CTA_URL: "${n}"`}}})(void 0),n=`/poster-ar-app/`,r=e=>`${n}${e.replace(/^\//,``)}`,i={ctaLabel:`Open website`,...t,targetSrc:r(`/targets/poster.mind`),modelSrc:r(`/models/dogdog.glb`)},a=document.querySelector(`#app`),o=()=>`
  <div class="app-shell">
    <section class="status-panel" aria-live="polite">
      <p class="eyebrow">Poster AR</p>
      <h1 id="status-title">Loading AR experience</h1>
      <p id="status-detail">Allow camera access, then point your phone at the poster.</p>
    </section>

    <a
      id="cta-link"
      class="cta-link"
      href="${i.ctaUrl??`#`}"
      aria-disabled="${i.ctaUrl?`false`:`true`}"
    >
      ${i.ctaLabel}
    </a>

    <a-scene
      id="ar-scene"
      class="ar-scene"
      mindar-image="imageTargetSrc: ${i.targetSrc}; uiScanning: yes; uiLoading: no; uiError: no"
      color-space="sRGB"
      renderer="colorManagement: true"
      vr-mode-ui="enabled: false"
      device-orientation-permission-ui="enabled: false"
      loading-screen="enabled: false"
      embedded
    >
      <a-assets id="ar-assets" timeout="15000">
        <a-asset-item id="characterModel" src="${i.modelSrc}"></a-asset-item>
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
`,s=(e,t,n,r)=>{e.status.dataset.tone=r,e.status.querySelector(`h1`)?.replaceChildren(t),e.statusDetail.textContent=n},c=(e,t)=>{e.model.setAttribute(`visible`,String(t))},l=(e,t)=>{if(!t.hasFatalError){if(i.configError&&(e.cta.classList.add(`is-disabled`),e.cta.removeAttribute(`href`),e.cta.setAttribute(`aria-disabled`,`true`)),!t.isArReady){s(e,`Preparing camera`,`The 3D model is preloading while the AR camera starts.`,`loading`);return}if(!t.hasModelLoaded){s(e,`Loading 3D model`,`The camera is ready. Waiting for the model to finish loading.`,`loading`);return}if(t.hasTarget){s(e,`Poster detected`,`The animation is playing on the poster.`,`found`);return}s(e,`Scan the poster`,`Keep the whole poster inside the camera view.`,`ready`)}},u=()=>{let e=document.querySelector(`.status-panel`),t=document.querySelector(`#status-detail`),n=document.querySelector(`#cta-link`),r=document.querySelector(`#ar-scene`),i=document.querySelector(`#poster-target`),a=document.querySelector(`#character-model`),o=document.querySelector(`#ar-assets`);if(!e||!t||!n||!r||!i||!a||!o)throw Error(`AR app markup failed to initialize`);return{status:e,statusDetail:t,cta:n,scene:r,target:i,model:a,assets:o}},d=e=>{let t={hasModelLoaded:!1,hasTarget:!1,isArReady:!1,hasFatalError:!1};e.cta.addEventListener(`click`,t=>{i.ctaUrl||(t.preventDefault(),s(e,`Link is not configured`,i.configError??`Set VITE_CTA_URL before publishing this experience.`,`error`))}),e.scene.addEventListener(`arReady`,()=>{t.isArReady=!0,l(e,t)}),e.scene.addEventListener(`arError`,()=>{t.hasFatalError=!0,c(e,!1),s(e,`Camera failed to start`,`Check camera permissions and open the site over HTTPS on a mobile device.`,`error`)}),e.assets.addEventListener(`timeout`,()=>{t.hasFatalError=!0,c(e,!1),s(e,`Assets are taking too long`,`Try a stronger connection or reduce the model size before publishing.`,`error`)}),e.model.addEventListener(`model-loaded`,()=>{t.hasModelLoaded=!0,c(e,t.hasTarget),l(e,t)}),e.model.addEventListener(`model-error`,()=>{t.hasFatalError=!0,c(e,!1),s(e,`Model failed to load`,`Replace the model with a valid glTF 2.0 .glb file and rebuild.`,`error`)}),e.target.addEventListener(`targetFound`,()=>{t.hasTarget=!0,c(e,t.hasModelLoaded),l(e,t)}),e.target.addEventListener(`targetLost`,()=>{t.hasTarget=!1,c(e,!1),s(e,`Poster lost`,`Point the camera back at the poster.`,`lost`)}),l(e,t)};(()=>{if(!a)throw Error(`Missing #app root`);a.innerHTML=o(),d(u())})();