import { snakeCase } from 'lodash'
import Joi from '@hapi/joi'

const VERSION = '4.0.0-rc4'

class Configuration {
  constructor (options) {
    if (!options) throw new TypeError('Options are required.')

    this.externalOptions = options
    this.options = {}

    this.prefix = 'S3D'

    const optionsDefinition = {
      pluginVersion: Joi.string().valid(VERSION).error((err) => {
        return `
          Configuration is out of date.
          Config: ${err[0].context.value} Plugin: ${VERSION}
          Run 'vue invoke s3-deploy'
        `
      }).required(),
      awsProfile: Joi.string().default('default'),
      overrideEndpoint: Joi.boolean().default(false),
      endpoint: Joi.string(),
      region: Joi.string().regex(/^[-0-9a-zA-Z]+$/).default('us-east-1'),
      bucket: Joi.string().required(),
      createBucket: Joi.boolean().default(false),
      uploadConcurrency: Joi.number().min(1).default(5),
      staticHosting: Joi.boolean().default(false),
      staticUpdate: Joi.boolean().default(false),
      staticIndexPage: Joi.string().default('index.html'),
      staticErrorPage: Joi.string().default('index.html'),
      staticWebsiteConfiguration: Joi.object(),
      assetPath: Joi.string().default('dist'),
      assetMatch: Joi.string().default('**'),
      deployPath: Joi.string().default('/'),
      acl: Joi.string().default('public-read'),
      pwa: Joi.boolean().default(false),
      pwaFiles: Joi.string().default('index.html,service-worker.js,manifest.json'),
      enableCloudfront: Joi.boolean().default(false),
      cloudfrontId: Joi.string(),
      cloudfrontMatchers: Joi.string().default('/index.html,/service-worker.js,/manifest.json'),
      registry: Joi.any(),
      gzip: Joi.boolean().default(false),
      gzipFilePattern: Joi.string().default('**/*.{js,css,json,ico,map,xml,txt,svg,eot,ttf,woff,woff2}'),
      cacheControl: Joi.string().default('max-age=86400'),
      cacheControlPerFile: Joi.array().default([]),
      onCompleteFunction: Joi.func().arity(2).default(function (options, error) {}),
      fastGlobOptions: Joi.object().default({ dot: true, onlyFiles: false })
    }

    const optionsSchema = Joi.object().keys(optionsDefinition)
    const envOptions = this.applyEnvOverrides(options, Object.keys(optionsDefinition))
    const validOptions = Joi.validate(envOptions, optionsSchema)

    if (!validOptions.error) {
      this.options = validOptions.value
    } else {
      throw validOptions.error
    }
  }

  applyEnvOverrides (options, optionNames) {
    const optionsCopy = { ...options }

    optionNames.forEach((name) => {
      const envVar = `${this.prefix}_${snakeCase(name).toUpperCase()}`
      optionsCopy[name] = process.env[envVar] || optionsCopy[name]
    })

    return optionsCopy
  }
}

export { VERSION }
export default Configuration
