FROM node:18

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./

COPY apps/api/package.json ./apps/api/package.json

RUN npm install -g pnpm
RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["node", "apps/api/dist/server.js"]