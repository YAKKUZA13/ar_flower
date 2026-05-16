const DEFAULT_CTA_URL = 'https://example.com'

type AppConfig = {
  ctaLabel: string
  ctaUrl: string | null
  configError: string | null
  targetSrc: string
  modelSrc: string
}

const parseUrl = (value: string | undefined): Pick<AppConfig, 'ctaUrl' | 'configError'> => {
  const candidate = value?.trim() || DEFAULT_CTA_URL

  try {
    const url = new URL(candidate)

    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        ctaUrl: null,
        configError: 'CTA URL must use http or https'
      }
    }

    return {
      ctaUrl: url.toString(),
      configError: null
    }
  } catch {
    return {
      ctaUrl: null,
      configError: `Invalid VITE_CTA_URL: "${candidate}"`
    }
  }
}

const ctaConfig = parseUrl(import.meta.env.VITE_CTA_URL)
const assetBase = import.meta.env.BASE_URL

const createAssetPath = (path: string) => `${assetBase}${path.replace(/^\//, '')}`

export const appConfig: AppConfig = {
  ctaLabel: 'Open website',
  ...ctaConfig,
  targetSrc: createAssetPath('/targets/poster.mind'),
  modelSrc: createAssetPath('/models/dogdog.glb')
}
