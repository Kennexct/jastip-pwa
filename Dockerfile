# Tahap 1: Build aplikasi
FROM node:20-alpine AS builder

WORKDIR /app

# Salin package.json untuk install dependencies terlebih dahulu (optimasi cache Docker)
COPY package.json ./
# Jika Anda menggunakan pnpm atau yarn, Anda bisa menambahkan lock filenya di sini
# COPY package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN npm install

# Salin seluruh kode sumber (kecuali yang ada di .dockerignore)
COPY . .

# Build proyek (menghasilkan folder dist)
RUN npm run build

# Tahap 2: Serve aplikasi dengan Nginx
FROM nginx:alpine

# Salin konfigurasi kustom Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin aset yang sudah di-build dari tahap builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Ekspos port 8080 (wajib untuk Cloud Run)
EXPOSE 8080

# Jalankan Nginx
CMD ["nginx", "-g", "daemon off;"]
