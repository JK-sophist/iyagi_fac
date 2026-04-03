FROM node:20-alpine

WORKDIR /app
COPY apps/frontend/package.json apps/frontend/package-lock.json* ./
RUN npm install
COPY apps/frontend ./
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
