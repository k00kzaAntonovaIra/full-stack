FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Открываем порт для Vite
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]