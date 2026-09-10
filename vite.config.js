import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			input: {
				storefront: resolve(import.meta.dirname, 'index.html'),
				admin: resolve(import.meta.dirname, 'admin.html')
			}
		}
	}
})
