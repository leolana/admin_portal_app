import * as Raven from 'raven-js';
import { environment } from '../../../environments/environment';

class RavenConfig {
    install(): void {
        // TODO: Adicionar essa url na variável de ambiente
        Raven
            .config('https://b1f19718a62e433f80346b334767c614@sentry.io/1281952', {
                environment: environment.production ? 'production' : 'development',
            })
            .install();
    }
}

export default RavenConfig;
