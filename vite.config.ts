import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: 'FluidPay Guardian',
            fileName: (format) => `index.${format}.js`
        }
    }
});
