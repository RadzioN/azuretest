# Dockerfile
FROM node:18-alpine

# Ustaw katalog roboczy
WORKDIR /app

# Kopiujemy pliki package.json i package-lock.json (jeśli istnieje)
COPY package*.json ./

# Instalujemy zależności
RUN npm install --production

# Kopiujemy resztę kodu aplikacji
COPY . .

# Domyślny port (można nadpisać przez env PORT)
EXPOSE 3000

# Komenda uruchomienia
CMD ["node", "index.js"]