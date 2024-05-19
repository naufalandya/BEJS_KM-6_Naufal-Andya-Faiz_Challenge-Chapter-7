import Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

const SENTRY_DSN = Bun.env.DSN
Sentry.init({
    dsn: SENTRY_DSN,
    integrations : [
        new Sentry.Integrations.Http({tracing : true}),
        new Sentry.Integrations.Express({ app: require('express') }),
        //nodeProfilingIntegration(),
        
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
})

export default Sentry