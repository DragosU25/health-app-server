# Folosește un image oficial de Node.js ca image de bază
FROM node:14

# Setează directorul de lucru în container
WORKDIR /usr/src/app

# Copiază package.json și package-lock.json în container
COPY package*.json ./

# Instalează dependințele
RUN npm install

# Copiază restul codului aplicației în container
COPY . .

# Expune portul pe care aplicația va rula
EXPOSE 3000

# Rulează comanda pentru a porni aplicația
CMD ["npm", "start"]