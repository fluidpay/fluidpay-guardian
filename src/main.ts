import { Guardian } from './guardian/guardian';
const endpoint = 'http://localhost:8001'
new Guardian(endpoint).process()
